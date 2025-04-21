import * as apiFuncs from "../backend.js"
import * as helperFuncs from "./helper-functions.js"

const table = document.getElementById("table")
const errorTag = document.getElementById("error-tag")
const emptyTableTag = document.getElementById("empty-table")
const workerIdCheckbox = document.getElementById("workerid-radio")
const breakIdCheckbox = document.getElementById("breakid-radio")
const valueInput = document.getElementById("value")

const workers = await apiFuncs.getWorkers()
const SHIFTOBJECT = {}

for (const worker of workers){
    for (const hour of worker.hours){
        if (SHIFTOBJECT[hour]){
            SHIFTOBJECT[hour]++
        }else{
            SHIFTOBJECT[hour] = 1
        }
    }
}

export async function displayDaysOff(){
    const results = await apiFuncs.getDaysOff()

    if (Object.keys(results).includes("error")){
        emptyTableTag.classList.remove("specified-hidden")
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
        const deleteBtn = document.createElement("button")

        const rawWorkerData = await apiFuncs.findWorker("","","","",result.worker_id)
        const workerData = rawWorkerData[0]

        idInfo.innerText = result.break_id
        workerInfo.innerText = `${workerData.first_name} ${workerData.last_name}`
        startDate.innerText = result.start_date
        endDate.innerText = result.end_date

        deleteBtn.id = `delete_${result.break_id}`
        deleteBtn.value = result.break_id
        deleteBtn.innerText = "Remove Days Off"
        deleteBtn.classList.add("delete-btn")
        deleteBtn.addEventListener("click",(event)=>{
            const confirmation = confirm(`Are you sure you want ot delete these days off for ${workerData.first_name} ${workerData.last_name}`)
            if (confirmation){
                deleteDaysOff(event)
            }else{
                errorTag.innerText = "Operation Canceled"
                return
            }
        })

        for (const cell of [idInfo,workerInfo,startDate,endDate,deleteBtn]){
            tableRow.appendChild(cell)
        }
        table.appendChild(tableRow)
    }
}

export async function newDaysOff(event){
    
    event.preventDefault()

    const workerId = document.getElementById("worker-id").value
    const startDate = document.getElementById("start-date").value
    const endDate = document.getElementById("end-date").value
    const workerDetails = await apiFuncs.findWorker("","","","",workerId)
    const workerLocations = await apiFuncs.workerLocationSearch("worker_id",workerId)

    for(const result of workerLocations){
        const checkResults = await helperFuncs.validateCoverage(result.location_id,startDate,endDate,workerDetails[0])
        if (!checkResults){
            errorTag.innerText = "Insufficient workers, cannot request day off"
            return
        }
    }

    const result = await apiFuncs.addDaysOff(workerId,startDate,endDate)

    if (Object.keys(result).includes("error")){
        errorTag.innerText = result.error
        return
    }

    sessionStorage.setItem("Message",result.message)
    window.location.href = "/"
}

export async function deleteDaysOff(event){
    const breakId = event.target.value

    const result = await apiFuncs.removeDaysOff(breakId)

    if (Object.keys(result).includes("error")){
        errorTag.innerText = result.error
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
        errorTag.innerText = "Unknown search value"
        return
    }

    if (Object.keys(result).includes("error")){
        errorTag.innerText = result.error
        return
    }

    localStorage.setItem("DaysOff",JSON.stringify(result))
    window.location.href = "/find-days-off"
}

// function specificiedCheck(worker,workers){
//     const array = []
//     for (const hour of worker.hours){
//         for (const worker of workers){
//             const tempArray = []
//             if (worker.hours.includes(hour)){
//                 tempArray.push(worker)
//             }
//             array.push(tempArray)
//         }
//     }

//     for (const innerArray of array){
//         if (innerArray.length < 3){
//             return false
//         }
//     }
//     return true
// }