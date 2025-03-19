import * as apiFuncs from "../../static/javascript/backend.js"

const WORKERS = await apiFuncs.getWorkers()

export function assignWorkers(dayNumber,dayBlock,afternoonBlock,nightBlock){
    const [shift1,shift2] = rosterWorkers()

    let dayWorker1 = document.createElement("p")
    let dayWorker2 = document.createElement("p")
    let afternoonWorker1 = document.createElement("p")
    let afternoonWorker2 = document.createElement("p")
    let nightWorker1 = document.createElement("p")
    let nightWorker2 =document.createElement("p")
    
    dayWorker1 = setDayNightWorker(dayWorker1,"dayWorker",shift1,"day")
    dayWorker2 = setDayNightWorker(dayWorker2,"dayWorker",shift2,"day")
    if (shift1["afternoonWorker"]){
        afternoonWorker1 = setAfternoonWorker(afternoonWorker1,shift1)
    }
    if (shift2["afternoonWorker"]){
        afternoonWorker2 = setAfternoonWorker(afternoonWorker2,shift2)
    }
    nightWorker1 = setDayNightWorker(nightWorker1,"nightWorker",shift1,"night")
    nightWorker2 = setDayNightWorker(nightWorker2,"nightWorker",shift2,"night")

    dayWorker1.setAttribute("id",`${dayNumber}-dayworker1`)
    dayWorker2.setAttribute("id",`${dayNumber}-dayworker2`)
    afternoonWorker1.setAttribute("id",`${dayNumber}-afternoonworker1`)
    afternoonWorker2.setAttribute("id",`${dayNumber}-afternoonworker2`)
    nightWorker1.setAttribute("id",`${dayNumber}-nightworker1`)
    nightWorker2.setAttribute("id",`${dayNumber}-nightworker2`)

    for (const tag of [dayWorker1,dayWorker2]){
        dayBlock.appendChild(tag)
    }

    for (const tag of [afternoonWorker1,afternoonWorker2]){
        afternoonBlock.appendChild(tag)
    }

    for (const tag of [nightWorker1,nightWorker2]){
        nightBlock.appendChild(tag)
    }
}

export function rosterWorkers(){
    const shifts = ["8hr","12hr"]
    const workerObject = {}
    const sixToSixDayArray = retrieveWorkers("6am-6pm")
    const sixToTwoArray = retrieveWorkers("6am-2pm")
    const twoToTenArray = retrieveWorkers("2pm-10pm")
    const sixToSixNightArray = retrieveWorkers("6pm-6am")
    const tenToSixArray = retrieveWorkers("10pm-6am")
    let shiftOne,shiftTwo

    const shiftOneShift = shifts[Math.floor(Math.random() * shifts.length)]
    const shiftTwoShift = shifts[Math.floor(Math.random() * shifts.length)]

    console.log("Shift 1")
    if (shiftOneShift== "8hr"){
        const dayWorker = sixToTwoArray.pop()
        setWorkerToUnavailable(dayWorker.id,[sixToSixDayArray])
        // addWorkerToObject(workerObject,`worker-${dayWorker.id}`,"6am-2pm")
        
        const afternoonWorker = twoToTenArray.pop()
        setWorkerToUnavailable(afternoonWorker.id,[sixToSixDayArray,sixToSixNightArray])
        // addWorkerToObject(workerObject,`worker-${afternoonWorker.id}`,"2pm-10pm")
    
        const nightWorker = tenToSixArray.pop()
        setWorkerToUnavailable(nightWorker.id,[sixToSixNightArray])
        // addWorkerToObject(workerObject,`worker-${nightWorker.id}`,"10pm-6am")
    
        shiftOne = {
            "shift":"8hr",
            "dayWorker":dayWorker,
            "afternoonWorker":afternoonWorker,
            "nightWorker":nightWorker,
        }
    }else{
        const dayWorker = sixToSixDayArray.pop()
        setWorkerToUnavailable(dayWorker.id,[sixToTwoArray,twoToTenArray])
        // addWorkerToObject(workerObject,`worker-${dayWorker.id}`,"6am-6pm")
        const nightWorker = sixToSixNightArray.pop()
        setWorkerToUnavailable(nightWorker.id,[tenToSixArray,twoToTenArray])
        // addWorkerToObject(workerObject,`worker-${nightWorker.id}`,"6pm-6am")

        shiftOne = {
            "shift":"12hr",
            "dayWorker":dayWorker,
            "nightWorker":nightWorker
        }

    }
 
    console.log("Shift 2")
    if (shiftTwoShift== "8hr"){
        const dayWorker = sixToTwoArray.pop()
        const afternoonWorker = twoToTenArray.pop()
        const nightWorker = tenToSixArray.pop()

        shiftTwo = {
            "shift":"8hr",
            "dayWorker":dayWorker,
            "afternoonWorker":afternoonWorker,
            "nightWorker":nightWorker,
        }
    }else{
        const dayWorker = sixToSixDayArray.pop()
        const nightWorker = sixToSixNightArray.pop()

        shiftTwo = {
            "shift":"12hr",
            "dayWorker":dayWorker,
            "nightWorker":nightWorker
        }
    }
    return [shiftOne,shiftTwo]
}

function retrieveWorkers(hours){
    let array = []
    for (const worker of WORKERS){
        if (worker.hours.includes(hours) || worker.hours.includes("24hrs")){
            array.push(worker)
        }
    }
    return array.sort(() => Math.random() - 0.5);
    
}

function setDayNightWorker(tag,worker,shift,time){
    console.log("worker is")
    console.log(worker)
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

function setAfternoonWorker(tag,shift){
    tag.innerText = `${shift.afternoonWorker.first_name[0]}.${shift.afternoonWorker.last_name}\n`
    tag.innerText += "(2pm-10pm)"
    return tag
}

function setWorkerToUnavailable(workerId,arrayOfArrays){
    for (const array of arrayOfArrays){
        for (const [index,worker] of array.entries()){
            if(worker.id === workerId){
                array.splice(index,1)
                break
            }
        }
    }
}