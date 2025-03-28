import * as apiFuncs from "../backend.js"

const table = document.getElementById("table")
const errorTag = document.getElementById("error-tag")
const emptyTableTag = document.getElementById("empty-table")
const workerIdCheckbox = document.getElementById("workerid-radio")
const breakIdCheckbox = document.getElementById("breakid-radio")
const valueInput = document.getElementById("value")

export async function displayDaysOff(){
    const results = await apiFuncs.getDaysOff()

    if (Object.keys(results).includes("error")){
        emptyTableTag.classList.remove("hidden")
        return
    }else{
        table.classList.remove("specified-hidden")
    }

    for (const result of results){
        const tableRow = document.createElement("tr")
        const idInfo = document.createElement("td")
        const workerInfo = document.createElement("td")
        const startDate = document.createElement("td")
        const endDate = document.createElement("td")
        const deleteCell = document.createElement("td")
        const deleteBtn = document.createElement("button")

        const rawWorkerData = await apiFuncs.findWorker("","","","",result.worker_id)
        const workerData = rawWorkerData[0]

        idInfo.innerHTML = result.break_id
        workerInfo.innerHTML = `${workerData.first_name} ${workerData.last_name}`
        startDate.innerHTML = result.start_date
        endDate.innerHTML = result.end_date

        deleteBtn.id = `delete_${result.break_id}`
        deleteBtn.value = result.break_id
        deleteBtn.innerHTML = "Remove Days Off"
        deleteBtn.classList.add("delete-btn")
        deleteBtn.addEventListener("click",(event)=>{
            const confirmation = confirm(`Are you sure you want ot delete these days off for ${workerData.first_name} ${workerData.last_name}`)
            if (confirmation){
                deleteDaysOff(event)
            }else{
                errorTag.innerHTML = "Operation Canceled"
                return
            }
        })

        deleteCell.appendChild(deleteBtn)

        for (const cell of [idInfo,workerInfo,startDate,endDate,deleteCell]){
            tableRow.appendChild(cell)
        }
        table.appendChild(tableRow)
    }
}

export async function newDaysOff(event){
    
    event.preventDefault()

    const workerId = document.getElementById("worker-id")
    const startDate = document.getElementById("start-date")
    const endDate = document.getElementById("end-date")

    const result = await apiFuncs.addDaysOff(workerId.value,startDate.value,endDate.value)

    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
        return
    }

    sessionStorage.setItem("Message",result.message)
    window.location.href = "/"
}

export async function deleteDaysOff(event){
    const breakId = event.target.value

    const result = await apiFuncs.removeDaysOff(breakId)

    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
        return
    }

    sessionStorage.setItem("Message",result.message)
    window.location.href = "/"
}

export async function findDaysOff(event){

    event.preventDefault()
    let result

    if (workerIdCheckbox.checked){
        result = await apiFuncs.getDaysOff("worker_id",valueInput.value)
    }else if (breakIdCheckbox.checked){
        result = await apiFuncs.getDaysOff("break_id",valueInput.value)
    }else{
        errorTag.innerHTML = "Unknown search value"
        return
    }

    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
        return
    }

    localStorage.setItem("DaysOff",JSON.stringify(result))
    window.location.href = "/find-days-off"
}