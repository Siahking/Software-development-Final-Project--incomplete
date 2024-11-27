import { editConstraints, findConstraints, findWorker } from "./backend.js"

const errorTag = document.getElementById("error-tag")
const BTNCLICK = localStorage.getItem("buttonClicked")
const notesSection = document.getElementById("notes-section")
const editSection = document.getElementById("edit-section")
const worker1Data = JSON.parse(localStorage.getItem("worker1Data"))
const worker2Data = JSON.parse(localStorage.getItem("worker2Data"))
const notes = localStorage.getItem("notes")
let constraintId,oldNotes
let PHASE = 1

const btnInnerHtml = 
    BTNCLICK === "add-constraint" ? "Add Constraint":
    BTNCLICK === "edit-constraint" ? "Select":
    BTNCLICK === "delete-constraint" ? "Delete Constraint":
    "Find Constraint"

if (BTNCLICK === 'edit-constraint'){
    notesSection.classList.add('hidden')
}

document.getElementById("submit-btn").innerHTML = btnInnerHtml

function populateTable(workerObj,workerTable,inputName,idParam,inputClass=""){
    for (const data of workerObj){
        const workerRow = document.createElement("tr")
        const firstName = document.createElement("td")
        const middleName = document.createElement("td")
        const lastName = document.createElement("td")
        const location = document.createElement("td")
        const radioInput = document.createElement("input")
        const label = document.createElement("label")
        const radioId = `i${idParam}-${data.id}`

        firstName.innerHTML = data.first_name
        lastName.innerHTML = data.last_name
        middleName.innerHTML = data.middle_name ? data.middleName : "Null"
        location.innerHTML = data.location

        radioInput.setAttribute("id",radioId)
        radioInput.setAttribute("type","radio")
        radioInput.setAttribute("value",data.id)
        radioInput.setAttribute("name",inputName+'-option')
        if (inputClass)radioInput.classList.add(inputClass)

        label.setAttribute("for",radioId)
        label.innerHTML = "Select"
        label.appendChild(radioInput)

        const arr = [firstName,middleName,lastName,location,label]

        for (const element of arr){
            workerRow.appendChild(element)
        };
        workerTable.appendChild(workerRow)
    }
}

window.addEventListener("DOMContentLoaded", async function () {
    const notesTextarea = document.getElementById("add-notes-textarea")
    notesTextarea.innerHTML = notes

    const worker1Table = document.getElementById("worker1-table")
    const worker2Table = document.getElementById("worker2-table")

    populateTable(worker1Data,worker1Table,"worker1","worker1")
    populateTable(worker2Data,worker2Table,"worker2","worker2")
})

document.getElementById("form").addEventListener("submit",async function(event){

    event.preventDefault()

    errorTag.innerHTML = ""

    if (PHASE === 1){
        const inputTags = document.querySelectorAll("input")
        const notes = document.getElementById("add-notes-textarea").value
        oldNotes = notes
        let worker1Check,worker2Check = true
        let worker1,worker2

        for (const input of inputTags){
            if (input.checked){
                if (input.name === "worker1-option"){
                    worker1Check = false
                    worker1 = parseInt(input.value)
                }else{
                    worker2Check = false
                    worker2 = parseInt(input.value)
                }
            }
        }

        if (worker1Check,worker2Check){
            errorTag.innerHTML = "Please insert a value for all tags!"
            return
        }

        if (BTNCLICK === 'add-constraint'){
            return addConstraint(worker1,worker2,notes)
        }else if (BTNCLICK === 'edit-constraint'){
            PHASE = 2
            modifyConstraint(worker1,worker2,notes)
        }

    }else if (PHASE === 2){
        const worker1Firstname = document.getElementById("worker1-firstname").value
        const worker1Lastname = document.getElementById("worker1-lastname").value
        const worker2Firstname = document.getElementById("worker2-firstname").value
        const worker2Lastname = document.getElementById("worker2-lastname").value

        const worker1ErrorTag = document.getElementById("worker1-error-tag")
        const worker2ErrorTag = document.getElementById("worker2-error-tag")
        const worker1ResultTable = document.getElementById("worker1-result-table")
        const worker2ResultTable = document.getElementById("worker2-result-table")

        const worker1Results = await findWorker(worker1Firstname,worker1Lastname)
        const worker2Results = await findWorker(worker2Firstname,worker2Lastname)

        if (Object.keys(worker1Results).includes("error")){
            worker1ErrorTag.innerHTML = "Worker does not exist"
            return
        }else if (Object.keys(worker2Results).includes("error")){
            worker2ErrorTag.innerHTML = "Worker does not exist"
            return
        }

        for (const tag of [worker1ResultTable,worker2ResultTable]){
            tag.classList.remove("hidden")
        }

        populateTable(worker1Results,worker1ResultTable,"worker1-result","worker1-result","results")
        populateTable(worker2Results,worker2ResultTable,"worker2-result","worker2-result","results")
        PHASE = 3
        
    }else if (PHASE === 3){
        const resultInputs = document.getElementsByClassName("results")
        let worker1ResultCheck = true,worker2ResultCheck = true
        let notesValue = document.getElementById('edit-notes-textarea').value
        let newWorker1Id,newWorker2Id

        for (const input of resultInputs){
            if (input.checked){
                if (input.name === "worker1-result-option"){
                    console.log('passed in one')
                    worker1ResultCheck = false
                    newWorker1Id = parseInt(input.value)
                }else{
                    console.log(input.name)
                    worker2ResultCheck = false
                    newWorker2Id = parseInt(input.value)
                }
            }
        }

        const newNotes = notesValue ? notesValue : oldNotes

        if (worker1ResultCheck || worker2ResultCheck){
            errorTag.innerHTML = "Please insert all values"
            return
        }

        const results = await editConstraints(newWorker1Id,newWorker2Id,newNotes,'edit',constraintId)

        console.log(results)
        
    }
})

async function addConstraint(worker1,worker2,notes){
    const results = await editConstraints(worker1,worker2,notes,"add")

    if (Object.keys(results).includes("error")){
        errorTag.innerHTML = results.error
        return
    }else{
        sessionStorage.setItem("Message",results.message)
        window.location.href = "/";
    }
}

async function modifyConstraint(worker1,worker2,notes){
    const results1 = await findConstraints(worker1,worker2)
    const results2 = await findConstraints(worker2,worker1)
    const textArea = document.getElementById('edit-notes-textarea')
    let data

    const result1Check = !Object.keys(results1).includes("error")
    const results2Check = !Object.keys(results2).includes("error")

    if (result1Check){
        data = results1[0]
    }else if (results2Check){
        data = results2[0]
    }else{
        errorTag.innerHTML = "Constraint does not exist!"
        return
    }

    constraintId = data.id
    textArea.setAttribute("placeholder",notes)
    editSection.classList.remove("hidden")
    return
}

function inputsCheck(inputTags){
    for (const tag of inputTags){
        if (tag.value !== ""){
            return false
        }
        return true
    }
}