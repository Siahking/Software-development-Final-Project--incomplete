import * as apiFuncs from "../backend.js"
import { objectCheck } from "../general-helper-funcs.js"

export async function retrieveWorkers(day,month,year,workers,daysOff,restrictions,hours){
    let array = []
    const excludedWorkers = await dayOffCheck(day,month,year,daysOff)
    const stringDay = getDayName(`${year}-${month}-${day}`)

    for (const worker of workers){
        if (
            excludedWorkers[`${worker.id}`] ||
            !restrictionCheck(stringDay,worker,hours,restrictions)
        )continue
        if (worker.hours.includes(hours) || worker.hours.includes("24hrs")){
            array.push(worker)
        }
    }
    return array.sort(() => Math.random() - 0.5);
}

export function setDayNightWorker(tag,worker,shift,time){
    //selecting the first index of each first name to get the first letter in the name
    tag.innerText = `${shift[worker].first_name[0]}.${shift[worker].last_name}\n`
    if (time === "day"){
        if (shift.shift === "12hr"){
            tag.innerText += "(6am-6pm)"
        }else{
            tag.innerText += "(6am-2pm)"
        }
    }else{
        if (shift.shift === "12hr"){
            tag.innerText += "(6pm-6am)"
        }else{
            tag.innerText += "(10pm-6am)"
        }
    }
    return tag
}

export function setAfternoonWorker(tag,shift){
    tag.innerText = `${shift.afternoonWorker.first_name[0]}.${shift.afternoonWorker.last_name}\n`
    tag.innerText += "(2pm-10pm)"
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

function restrictionCheck(day,worker,hours,restrictions){
    //returns true if a worker has a restriction which obstructs the roster hours, else returns false
    let startTime,endTime,shiftStart,shiftEnd
    if (restrictions[worker.id]){
        const workerRestrictions = restrictions[worker.id]
        for (const restriction of workerRestrictions){
            if (restriction.day_of_week === day){
                const strStartTime = restriction.start_time.split(":")[0]
                const strEndTime = restriction.end_time.split(":")[0]
                startTime = parseInt(strStartTime) == 24 ? 1 : parseInt(strStartTime)
                endTime =  parseInt(strEndTime) == 24 ? 1 : parseInt(strEndTime)

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
                    startTime === 0 && endTime === 0 ||
                    startTime === 0 && endTime < endTime ||
                    endTime === 0 && startTime < endTime ||
                    startTime > shiftStart && startTime < shiftEnd ||
                    endTime > shiftStart && endTime < shiftEnd ||
                    startTime < shiftStart && endTime > shiftEnd
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