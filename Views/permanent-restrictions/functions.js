import * as apiFuncs from '../backend.js'

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
        const deleteCell = document.createElement("td")
        const deleteBtn = document.createElement("button")

        deleteBtn.innerHTML = "Delete Restriction"
        deleteBtn.value = restriction.id
        deleteBtn.id = `delete-${restriction.id}`
        deleteBtn.classList.add("delete-btn")
        deleteBtn.addEventListener("click",(event)=>
            deleteRestriction(event.target.value)
        )
        deleteCell.appendChild(deleteBtn)
        deleteCell.classList.add("delete-cell")
        
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
    // const worker = await apiFuncs.findWorker("","","","",workerId.value)
    // const check = ampleShiftCheck(worker[0])
    // if (check !== "Sufficient Workers"){
    //     errorTag.innerHTML = check
    //     return check
    // }
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

async function ampleShiftCheck(workerObj){
    const getLocations = await apiFuncs.workerLocationSearch("worker_id",workerObj.id)
    console.log(getLocations)
    const workerLocations = []
    for (const object of getLocations){
        const location = await apiFuncs.findLocation("id",object.location_id)
        workerLocations.push(location[0].id)
    }
    for (const location of workerLocations){
        const shiftWorkers = {
            "24hrs":0
        }
        for (const shift of workerObj.hours){
            shiftWorkers[shift] = 0
        }
        const results = await apiFuncs.workerLocationSearch("location_id",location)

        for (const result of results){
            const worker = await apiFuncs.findWorker("","","","",result.worker_id)
            const shifts = worker[0].hours
            
            for (const shift of shifts){
                if(shiftWorkers[shift]){
                    shiftWorkers[shift]++
                }else if (shift=== "24hrs"){
                    shiftWorkers["24hrs"]++
                }
            }
        }

        for (const shift in shiftWorkers){
            const errorMsg = `Insufficient workers for shift ${shift},has ${shiftWorkers[shift]}worker(s)`
            //check if shift workers is less than 3 and 24hr shifts are less than 3
            if (shiftWorkers[shift] < 3 && shiftWorkers["24hrs"] < 1){
                return errorMsg
            }else if (shiftWorkers[shift] < 3){
                console.log(shiftWorkers[shift])
                //minuses from 24hr shifts considering 24hr shift workers are flexible
                const neededWorkers = 3 - shiftWorkers[shift] 
                if (shiftWorkers["24hrs"] < neededWorkers){
                    return errorMsg
                }
                shiftWorkers["24hrs"] -= neededWorkers
            }
        }
        return "Sufficient Workers"
    }
    

}

export async function ampleWorkerCheck(workerObj){
    const getLocations = await apiFuncs.workerLocationSearch("worker_id",workerObj.id)
    const workerLocations = []
    for (const object of getLocations){
        const location = await apiFuncs.findLocation("id",object.location_id)
        workerLocations.push(location[0].id)
    }
    for (const location of workerLocations){
        const shiftWorkers = {
            "6am-2pm":0,
            "2pm-10pm":0,
            "10pm-6am":0,
            "6am-6pm":0,
            "6pm-6am":0,
            "24hrs":0
        }
        const results = await apiFuncs.workerLocationSearch("location_id",location)

        for (const result of results){
            const worker = await apiFuncs.findWorker("","","","",result.worker_id)
            const shifts = worker[0].hours
            console.log(shifts)

            for (const shift of shifts){
                shiftWorkers[shift] ++
            }
        }

        for (const shift in shiftWorkers){
            const errorMsg = `Insufficient workers for shift ${shift},has ${shiftWorkers[shift]}worker(s)`
            //check if shift workers is less than 3 and 24hr shifts are less than 3
            if (shiftWorkers[shift] < 3 && shiftWorkers["24hrs"] < 1){
                return errorMsg
            }else if (shiftWorkers[shift] < 3){
                //minuses from 24hr shifts considering 24hr shift workers are flexible
                const neededWorkers = 3 - shiftWorkers[shift] 
                if (shiftWorkers["24hrs"] < neededWorkers){
                    return errorMsg
                }
                shiftWorkers["24hrs"] -= neededWorkers
            }
        }
        return "Sufficient Workers"
    }
}