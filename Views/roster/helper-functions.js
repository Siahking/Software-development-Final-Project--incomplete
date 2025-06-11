import * as apiFuncs from "../backend.js"
import { adjustEditDiv } from "./frontend.js"
import { objectCheck } from "../general-helper-funcs.js"
import { restrictions } from "./functions.js"

export async function retrieveWorkers(day,month,year,workers,daysOff,hours){
    let array = []
    const excludedWorkers = await dayOffCheck(day,month,year,daysOff)
    const stringDay = getDayName(`${year}-${month}-${day}`)

    for (const worker of workers){
        if (
            excludedWorkers[`${worker.id}`] ||
            !restrictionCheck(stringDay,worker.id,hours,restrictions)
        )continue
        if (worker.hours.includes(hours) || worker.hours.includes("24hrs")){
            array.push(worker)
        }
    }
    return array.sort(() => Math.random() - 0.5);
}

export function setDayNightWorker(idStart,tag,worker,shift,time){
    //selecting the first index of each first name to get the first letter in the name
    const pTag = document.createElement("p")
    const workerName = document.createElement("span")
    const shiftType = document.createElement("span")
    const editBtn = document.createElement("button")
    workerName.innerText = `${shift[worker].first_name[0]}.${shift[worker].last_name}`
    tag.setAttribute("workerId",shift[worker].id)
    if (time === "day"){
        if (shift.shift === "12hr"){
            shiftType.innerText = "(6am-6pm)"
            tag.setAttribute("shiftType","6am-6pm")
        }else{
            shiftType.innerText = "(6am-2pm)"
            tag.setAttribute("shiftType","6am-2pm")
        }
    }else{
        if (shift.shift === "12hr"){
            shiftType.innerText = "(6pm-6am)"
            tag.setAttribute("shiftType","6pm-6am")
        }else{
            shiftType.innerText = "(10pm-6am)"
            tag.setAttribute("shiftType","10pm-6am")
        }
    }
    workerName.setAttribute("id",`${idStart}-${time}-worker`)
    shiftType.setAttribute("id",`${idStart}-${time}-shift`)

    editBtn.innerText = "✏️"
    editBtn.classList.add("editBtn")
    editBtn.setAttribute("id",`${idStart}-${time}-editBtn`)
    editBtn.addEventListener("click",(event)=>adjustEditDiv(event))

    pTag.innerText = ""
    pTag.appendChild(workerName)
    pTag.appendChild(shiftType)
    tag.appendChild(pTag)
    tag.appendChild(editBtn)
    tag.classList.add("workerContainer")
    return tag
}

export function setAfternoonWorker(idStart,tag,shift){
    const pTag = document.createElement("p")
    const workerName = document.createElement("span")
    const shiftType = document.createElement("span")
    const editBtn = document.createElement("button")
    workerName.innerText = `${shift.afternoonWorker.first_name[0]}.${shift.afternoonWorker.last_name}`
    shiftType.innerText = "(2pm-10pm)"
    tag.setAttribute("workerId",shift.afternoonWorker.id)
    tag.setAttribute("shiftType","2pm-10pm")

    workerName.setAttribute("id",`${idStart}-afternoon-worker`)
    shiftType.setAttribute("id",`${idStart}-afternoon-shift`)

    editBtn.innerText = "✏️"
    editBtn.classList.add("editBtn")
    editBtn.setAttribute("id",`${idStart}-afternoon-editBtn`)

    pTag.innerText = ""
    pTag.appendChild(workerName)
    pTag.appendChild(shiftType)
    tag.appendChild(pTag)
    tag.appendChild(editBtn)
    tag.classList.add("workerContainer")
    return tag
}

export function setWorkerToUnavailable(workerId,arrayOfArrays,constraints){
    const workersToExclude = []
    const worker1Constraints = constraints.worker1Constraints[workerId]
    const worker2Constraints = constraints.worker2Constraints[workerId]
    if (worker1Constraints){
        for (const constraint of worker1Constraints){
            workersToExclude.push(constraint.worker2_id)
        }
    }
    if (worker2Constraints){
        for (const constraint of worker2Constraints){
            workersToExclude.push(constraint.worker1_id)
        }
    }
    for (const array of arrayOfArrays){
        for (const [index,worker] of array.entries()){
            if(worker.id === workerId || workersToExclude.includes(worker.id)){
                array.splice(index,1)
                break
            }
        }
    }
}

export function checkShifts(strShift,shift){
    if (shift.length < 3){
        return {"error":strShift}
    }
    return {"success":""}
}

function getDayName(dateString){
    const date = new Date(dateString);
    const options = { weekday: 'long' };
    return date.toLocaleDateString('en-US',options);
}

function restrictionCheck(day,workerId,hours){
    //returns true if a worker has a restriction which obstructs the roster hours, else returns false
    let restrictionStartTime,restrictionEndTime,shiftStart,shiftEnd
    if (restrictions[workerId]){
        const workerRestrictions = restrictions[workerId]
        for (const restriction of workerRestrictions){
            if (restriction.day_of_week === day){
                if (!restrictionStartTime && !restrictionEndTime){
                    return false
                }
                const strStartTime = restriction.start_time.split(":")[0]
                const strEndTime = restriction.end_time.split(":")[0]
                restrictionStartTime = parseInt(strStartTime)
                restrictionEndTime = parseInt(strEndTime)

                switch (hours){
                    case "6am-6pm":
                        shiftStart = 6;
                        shiftEnd = 18;
                        break
                    case "6am-2pm":
                        shiftStart = 6;
                        shiftEnd = 14;
                        break
                    case "2pm-10pm":
                        shiftStart = 14;
                        shiftEnd = 22;
                        break
                    case "6pm-6am":
                        shiftStart = 18;
                        shiftEnd = 6;
                        break
                    case "10pm-6am":
                        shiftStart = 22;
                        shiftEnd = 6;
                        break
                }

                if (
                    (restrictionStartTime > shiftStart && restrictionEndTime < shiftEnd) ||
                    (restrictionEndTime > shiftStart && restrictionEndTime < shiftEnd) ||
                    (restrictionStartTime < shiftStart && restrictionEndTime > shiftEnd) ||
                    (restrictionStartTime > shiftEnd && restrictionEndTime < shiftEnd)
                ){
                    return false
                }
            }
        }
    }
    
    return true
}

 async function dayOffCheck(day,month,year,daysOff){
    const occupancies = await apiFuncs.retrieveOccupancies("event_date",`${year}-${month}-${day}`)

    //stores all workers off on this day
    //stores the workers which requested days off first
    const obj = {}
    for (const result of daysOff){
        const startDate = new Date(result.start_date)
        const endDate = new Date(result.endDate)
        const currentDate = new Date(year, month, day);

        if (currentDate >= startDate && currentDate <= endDate ) {
            obj[result.worker_id] = true;
        }
    }

    //stores all workers already working on this day
    if (!objectCheck(occupancies)){
        for (const occupancy of occupancies){
            obj[occupancy.worker_id] = true;
        }
    }

    return obj
}

export function dateToString(day,month,year){
    const newDay = day < 10 ?`0${day}` : `${day}`
    const newMonth = month < 10 ? `0${month}` : `${month}`

    return `${year}-${newMonth}-${newDay}`
}

export async function setWorkerForShift(workerArray,date,shiftWorkersArray,constraints){
    while(true){
        const worker = workerArray.pop()
        const result = await apiFuncs.createOccupancy(worker.id,date,"Work") 
        setWorkerToUnavailable(worker.id,shiftWorkersArray,constraints)
        if (!objectCheck(result)){
            return worker
        }
    }
}

export function displayDataDiv(dataDiv,loadDiv){
    dataDiv.classList.remove("specified-hidden")
    loadDiv.classList.add("specified-hidden")
}

export function setLoadingContainer(){
    const loadingContainer = document.createElement("div")
    const loadingMessage = document.createElement("p")
    loadingMessage.innerText = "Loading"
    loadingMessage.classList.add("loading-message")
    loadingContainer.classList.add("loading-container")
    loadingContainer.appendChild(loadingMessage)
    return loadingContainer
}

export function setAttributes(tag,tagName,locationId,monthYear,dayNumber){
    tag.classList.add(`${dayNumber}-${locationId}-worker`)
    tag.setAttribute("locationId",locationId)
    tag.setAttribute("day",dayNumber)
    tag.setAttribute("monthYear",monthYear)
    tag.setAttribute("name",`${locationId}-workerDetails`)
    tag.setAttribute("id",`${dayNumber}-${locationId}-${tagName}`)
}

export async function filterWorkers(workerId,shiftType,locationId,date,dayName,otherWorkers){

    const [year,month,day] = date.split('-')

    const [workers,occupiedWorkers,daysOff,restrictions,constraints] = await Promise.all([
        apiFuncs.retrieveWorkerOrLocations("location_id",locationId),
        apiFuncs.retrieveOccupancies(date,"",""),
        apiFuncs.getDaysOff("worker_id",workerId),
        apiFuncs.getConstraints(workerId)
    ])

    let excludedWorkers = []

    if (!objectCheck(daysOff)){
        excludedWorkers = await dayOffCheck(day,month,year,daysOff)
    }
        
    
    const shiftWorkers = []
    const workerOptions = []
    
    for (const worker of workers){
        if(worker["hours"].includes(shiftType)){
            shiftWorkers.push(worker)
        }
    }

    for (const worker of shiftWorkers) {
        const wId = worker.id
        
        if (excludedWorkers[`${workerId}`]) continue

        const isRestricted = restrictionCheck(dayName,workerId,shiftType)
        if (isRestricted)continue

        const isOccupied = occupiedWorkers.some(entry=> entry.worker_id === wId)
        if (isOccupied) continue

        workerOptions.push(worker)
    }

    console.log(workerOptions)

}

function validateConstraint(constraints,workerOptions,otherWorkers){
    if (constraints.length === 0)return  workerOptions
    const validCandidates = []
    for (const candidate of otherWorkers){
        let hasConstraint = false;

        for (const worker of workerOptions){
            for (const constraint of constraints){
                const worker1 = constraint.worker1_id
                const worker2 = constraint.worker2_id

                if (
                    (worker1 === candidate && worker2 === worker) || 
                    (worker2 === candidate && worker1 === worker)
                ){
                    hasConstraint = true
                    break
                }

            }
            if (hasConstraint)break
        }

        if (!hasConstraint) validCandidates.push(candidate)
    }

    console.log(validCandidates)
}