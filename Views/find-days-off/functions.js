import * as apiFuncs from "../backend.js" 
import { deleteDaysOff } from "../days-off/functions.js"

const table = document.getElementById("table")
const errorTag = document.getElementById("error-tag")

export async function displayDaysOff(){
    const daysOffs = JSON.parse(localStorage.getItem("DaysOff"));

    for (const result of daysOffs){
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