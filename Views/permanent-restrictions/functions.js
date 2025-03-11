import * as apiFuncs from '../../static/javascript/backend.js'

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
        emptyTableTag.classList.remove("hidden")
        return
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
        const deleteCell = document.createElement("td")
        const deleteBtn = document.createElement("button")

        deleteBtn.innerHTML = "Delete Restriction"
        deleteBtn.value = restriction.id
        deleteBtn.id = `delete-${restriction.id}`
        deleteBtn.addEventListener("click",(event)=>
            deleteRestriction(event.target.value)
        )
        deleteCell.appendChild(deleteBtn)
        
        idData.innerHTML  = restriction.id
        firstNameData.innerHTML = workerData.first_name
        lastNameData.innerHTML = workerData.last_name
        dayOfWeekData.innerHTML = restriction.day_of_week
        startTimeData.innerHTML = restriction.start_time == "00:00:00" ?  "--" :  restriction.start_time
        endTimeData.innerHTML = restriction.end_time == "00:00:00" ?  "--" :  restriction.end_time
        
        for (const data of [idData,firstNameData,lastNameData,dayOfWeekData,startTimeData,endTimeData,deleteCell]){
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
        errorTag.innerHTML = "Please select an id to search from"
        return 
    }

    if(Object.keys(results).includes("error")){
        errorTag.innerHTML = results.error
        return
    }

    localStorage.setItem("Restrictions",JSON.stringify(results))
    window.location.href = "/find-restrictions"
}

export async function addRestriction(){
    const result = await apiFuncs.createRestriction(workerId.value,dayOfWeek.value,startTime.value,endTime.value)

    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
        return
    }

    sessionStorage.setItem("Message",result.message)
    window.location.href = "/"
}

async function deleteRestriction(id){
    const result = await apiFuncs.deletePermanentRestrictions(id)

    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
        return
    }

    sessionStorage.setItem("Message",result.message)
    window.location.href = "/"
}