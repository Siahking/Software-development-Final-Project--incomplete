import * as apiFuncs from "../backend.js";

const table = document.getElementById("table")
const errorTag = document.getElementById("error-tag")
const worker1Id = document.getElementById("worker1")
const worker2Id = document.getElementById("worker2")
const summary = document.getElementById("summary")
const searchWorker1Id = document.getElementById("worker1-id")
const searchWorker2Id = document.getElementById("worker2-id")
const constraintId = document.getElementById("constraint-id")
const worker1IdInput = document.getElementById("worker1Id-input")
const worker2IdInput = document.getElementById("worker2Id-input")
const tableErrorTag = document.getElementById("constraint-table-tag")

async function removeConstraint(id){
    const result = await apiFuncs.deleteConstraints(id)
    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
    }else{
        sessionStorage.setItem("Message",result.message)
        window.location.href = "/"
    }
}

export async function addConstraint(){

    const result = await apiFuncs.createConstraint(worker1Id.value,worker2Id.value,summary.value)
    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
        return
    }

    sessionStorage.setItem("Message",result.message)
    window.location.href = '/'
}

export async function displayConstraints(){
    const results = await apiFuncs.getConstraints()

    if (Object.keys(results).includes("error")){
        tableErrorTag.classList.remove("hidden")
        return
    }

    for (const constraint of results){
        console.log(constraint)
        const worker1Id = constraint.worker1_id
        const worker2Id = constraint.worker2_id

        const worker1 = await apiFuncs.findWorker("","","","",worker1Id)
        const worker2 = await apiFuncs.findWorker("","","","",worker2Id)

        const worker1Info = `${worker1[0].first_name} ${worker1[0].last_name}`
        const worker2Info = `${worker2[0].first_name} ${worker2[0].last_name}`

        const tableRow = document.createElement("tr")
        const IDData = document.createElement("td")
        const worker1Data = document.createElement("td")
        const worker2Data = document.createElement("td")
        const summaryData = document.createElement("td")
        const deleteCell = document.createElement("td")
        const deleteBtn = document.createElement("button")

        deleteBtn.innerHTML = "Delete Constraint"
        deleteBtn.value = constraint.id
        deleteBtn.classList.add("delete-btn")
        deleteBtn.id = `deleteBtn-${constraint.id}`
        deleteBtn.addEventListener("click",(event)=>removeConstraint(event.target.value))
        deleteCell.appendChild(deleteBtn)

        IDData.innerHTML = constraint.id
        worker1Data.innerHTML = worker1Info
        worker2Data.innerHTML = worker2Info
        summaryData.innerHTML = constraint.note

        for (const value of [IDData,worker1Data,worker2Data,summaryData]){
            tableRow.appendChild(value)
        }
        tableRow.appendChild(deleteBtn)
        table.appendChild(tableRow)
    }
}

export async function findConstraint(event){

    event.preventDefault()

    let worker1Id,worker2Id

    try{
        worker1Id = parseInt(searchWorker1Id.value)
        worker2Id = parseInt(searchWorker2Id.value)
    }catch{
        errorTag.innerHTML = "Invalid input params"
        return
    }

    const results = await apiFuncs.getConstraints("",worker1Id,worker2Id)

    if (Object.keys(results).includes("error")){
        errorTag.innerHTML = results.error
        return
    }

    localStorage.setItem("Constraints",JSON.stringify(results))
    window.location.href = "/find-contraints"
}

export async function changeConstraint(event){

    event.preventDefault()

    if (!constraintId.value){
        errorTag.innerHTML = "Constraint ID Required"
        return
    }
    const result = await apiFuncs.editConstraints(constraintId.value,worker1IdInput.value,worker2IdInput.value)

    console.log(result)
    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
        return
    }

    sessionStorage.setItem("Message",result.message)
    window.location.href = "/"
}