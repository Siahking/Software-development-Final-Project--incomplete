import { editConstraints, findConstraints, findWorker } from "./backend.js"

const errorTag = document.getElementById("error-tag")
const BTNCLICK = localStorage.getItem("buttonClicked")
const notesSection = document.getElementById("notes-section")
const editSection = document.getElementById("edit-section")
let worker1Name,worker2Name
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

function populateTable(workerObj,workerTable,name){
    for (const data of workerObj){
        const workerRow = document.createElement("tr")
        const firstName = document.createElement("td")
        const middleName = document.createElement("td")
        const lastName = document.createElement("td")
        const location = document.createElement("td")
        const radioInput = document.createElement("input")
        const label = document.createElement("label")
        const radioId = `worker1-${data.id}`

        firstName.innerHTML = data.first_name
        lastName.innerHTML = data.last_name
        middleName.innerHTML = data.middle_name ? data.middleName : "Null"
        location.innerHTML = data.location

        radioInput.setAttribute("id",radioId)
        radioInput.setAttribute("type","radio")
        radioInput.setAttribute("value",data.id)
        radioInput.setAttribute("name",name+'-option')

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
    const worker1Data = JSON.parse(localStorage.getItem("worker1Data"))
    const worker2Data = JSON.parse(localStorage.getItem("worker2Data"))
    const notes = localStorage.getItem("notes")

    const notesTextarea = document.getElementById("add-notes-textarea")
    notesTextarea.innerHTML = notes

    const worker1Table = document.getElementById("worker1-table")
    const worker2Table = document.getElementById("worker2-table")

    populateTable(worker1Data,worker1Table,"worker1")
    populateTable(worker2Data,worker2Table,"worker2")
})

document.getElementById("form").addEventListener("submit",async function(event){

    event.preventDefault()

    errorTag.innerHTML = ""

    if (PHASE === 1){
        const inputTags = document.querySelectorAll("input")
        const notes = document.getElementById("add-notes-textarea").value
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

        const worker1Results = await findWorker(worker1Firstname,worker1Lastname)
        const worker2Results = await findWorker(worker2Firstname,worker2Lastname)

        if (Object.keys(worker1Results).includes("error")){
            worker1ErrorTag.innerHTML = "Worker does not exist"
            return
        }else if (Object.keys(worker2Results).includes("error")){
            worker2ErrorTag.innerHTML = "Worker does not exist"
            return
        }

        
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
        return 2 //for phase
    }

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