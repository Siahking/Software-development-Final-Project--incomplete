import * as apiFuncs from '../backend.js'
import validateCoverage from './helper-functions.js'

const errorTag = document.getElementById("error-tag")
const emptyTableTag = document.getElementById("restriction-table-tag")
const workerId = document.getElementById("worker-id-input")
const dayOfWeek = document.getElementById("day-of-week-input")
const startTime = document.getElementById("start-time-input")
const endTime = document.getElementById("end-time-input")

export async function getWorker(workerId){
    const workerData = await apiFuncs.findWorker("","","","",workerId)
    return workerData[0]
}

export async function displayRestrictions(){
    const table = document.getElementById("restriction-table")
    const results = await apiFuncs.getPermanentRestrictions()

    if (Object.keys(results).includes("error")){
        emptyTableTag.classList.remove("specified-hidden")
        return
    }else{
        table.classList.remove("specified-hidden")
    }

    for (const restriction of results){
        const workerData = await getWorker(restriction.worker_id)
        const tableRow = document.createElement("tr")
        const idData = document.createElement("td")
        const firstNameData = document.createElement("td")
        const lastNameData = document.createElement("td")
        const dayOfWeekData= document.createElement("td")
        const startTimeData = document.createElement("td")
        const endTimeData = document.createElement("td")
        const deleteBtn = document.createElement("button")

        deleteBtn.innerText = "Delete Restriction"
        deleteBtn.value = restriction.id
        deleteBtn.id = `delete-${restriction.id}`
        deleteBtn.classList.add("delete-btn")
        deleteBtn.addEventListener("click",(event)=>
            deleteRestriction(event.target.value)
        )
        
        idData.innerText  = restriction.id
        firstNameData.innerText = workerData.first_name
        lastNameData.innerText = workerData.last_name
        dayOfWeekData.innerText = restriction.day_of_week
        startTimeData.innerText = restriction.start_time == "00:00:00" ?  "--" :  restriction.start_time
        endTimeData.innerText = restriction.end_time == "00:00:00" ?  "--" :  restriction.end_time
        
        for (const data of [idData,firstNameData,lastNameData,dayOfWeekData,startTimeData,endTimeData,deleteBtn]){
            tableRow.appendChild(data)
        }

        table.appendChild(tableRow)
    }
}

export async function findRestriction() {
    const workerIdRadio = document.getElementById("restriction-worker-id")
    const idRadio = document.getElementById("restriction-id")
    const idValue = document.getElementById("id-value-input")
    let results

    if (workerIdRadio.checked){
        results = await apiFuncs.findPermanentRestrictions("worker_id",idValue.value)
    } else if (idRadio.checked){
        results = await apiFuncs.findPermanentRestrictions("id",idValue.value)
    } else{
        errorTag.innerText = "Please select an id to search from"
        return 
    }

    if(Object.keys(results).includes("error")){
        errorTag.innerText = results.error
        return
    }

    localStorage.setItem("Restrictions",JSON.stringify(results))
    window.location.href = "/find-restrictions"
}

export async function addRestriction(){
    let dayOfWeek
    let checked = false
    const options = document.querySelectorAll(".day-of-week-input")
    const workerId = document.getElementById("worker-id-input").value
    const startTime = document.getElementById("start-time-input").value
    const endTime = document.getElementById("end-time-input").value

    for (const input of options){
        if (input.checked){
            dayOfWeek = input.value
            checked = true
        }
    }

    if (!checked){
        dayOfWeek = "Any"
    }

    const locationId = await apiFuncs.workerLocationSearch("worker_id",workerId)
    const check = await validateCoverage(locationId[0].location_id,dayOfWeek,workerId)

    if (!check){
        errorTag.innerText = "Insufficient Workers to set permanent day off"
        return
    }

    const result = await apiFuncs.createRestriction(workerId,dayOfWeek,startTime,endTime)

    if (Object.keys(result).includes("error")){
        errorTag.innerText = result.error
        return
    }

    sessionStorage.setItem("Message",result.message)
    window.location.href = "/"
}

export async function deleteRestriction(id){
    const result = await apiFuncs.deletePermanentRestrictions(id)

    if (Object.keys(result).includes("error")){
        errorTag.innerText = result.error
        return
    }

    sessionStorage.setItem("Message",result.message)
    window.location.href = "/"
}