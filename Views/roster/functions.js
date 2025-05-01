import * as helperFuncs from "./helper-functions.js"
import { objectCheck } from "../general-helper-funcs.js"

export async function assignWorkers({ 
    dayNumber, month, year, WORKERS, daysOff, restrictions,constraints,dayBlock,afternoonBlock,
    nightBlock
 }){
    let shift1,shift2
    const results = await rosterWorkers(dayNumber,month,year,WORKERS,daysOff,restrictions,constraints)
    if (objectCheck(results) || Object.keys(results).includes("Insufficient Workers")){
        return results
    }
    //results returns an object with success as the key and the values as the value or an error object
    [shift1,shift2] = results.success

    const container = document.createElement("div")
    container.setAttribute("id",`${location}-workers-div`)

    let dayWorker1 = document.createElement("p")
    let dayWorker2 = document.createElement("p")
    let afternoonWorker1 = document.createElement("p")
    let afternoonWorker2 = document.createElement("p")
    let nightWorker1 = document.createElement("p")
    let nightWorker2 = document.createElement("p")
    
    dayWorker1 = helperFuncs.setDayNightWorker(dayWorker1,"dayWorker",shift1,"day")
    dayWorker2 = helperFuncs.setDayNightWorker(dayWorker2,"dayWorker",shift2,"day")
    //manually sets afternoon workers if the shifts ends up being 8 hr shifts
    if (shift1["afternoonWorker"]){
        afternoonWorker1 = helperFuncs.setAfternoonWorker(afternoonWorker1,shift1)
    }
    if (shift2["afternoonWorker"]){
        afternoonWorker2 = helperFuncs.setAfternoonWorker(afternoonWorker2,shift2)
    }
    nightWorker1 = helperFuncs.setDayNightWorker(nightWorker1,"nightWorker",shift1,"night")
    nightWorker2 = helperFuncs.setDayNightWorker(nightWorker2,"nightWorker",shift2,"night")

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

    return {"success":""}
}

export async function rosterWorkers(day,month,year,workers,daysOff,restrictions,constraints){ 
    const shifts = ["8hr","12hr"]
    const locationsError = []
    const dateStr = helperFuncs.dateToString(day,month,year)
    const sixToSixDayArray = await helperFuncs.retrieveWorkers(day,month,year,workers,daysOff,restrictions,"6am-6pm")
    const sixToTwoArray = await helperFuncs.retrieveWorkers(day,month,year,workers,daysOff,restrictions,"6am-2pm")
    const twoToTenArray = await helperFuncs.retrieveWorkers(day,month,year,workers,daysOff,restrictions,"2pm-10pm")
    const sixToSixNightArray = await helperFuncs.retrieveWorkers(day,month,year,workers,daysOff,restrictions,"6pm-6am")
    const tenToSixArray = await helperFuncs.retrieveWorkers(day,month,year,workers,daysOff,restrictions,"10pm-6am")
    let shiftOne,shiftTwo

    const checkArray = [
        helperFuncs.checkShifts("6am-6pm",sixToSixDayArray),
        helperFuncs.checkShifts("6pm-6am",sixToSixNightArray),
        helperFuncs.checkShifts("6am-2pm",sixToTwoArray),
        helperFuncs.checkShifts("2pm-10pm",twoToTenArray),
        helperFuncs.checkShifts("10pm-6am",tenToSixArray)
    ]

    for (const check of checkArray){
        if(objectCheck(check)){
            locationsError.push(check.error)
        }
    }

    if (locationsError.length > 0){
        return {"Insufficient Workers":locationsError}
    }

    //randomly selects a shift for the workers
    const shiftOneShift = shifts[Math.floor(Math.random() * shifts.length)]
    const shiftTwoShift = shifts[Math.floor(Math.random() * shifts.length)]

    if (shiftOneShift== "8hr"){
        console.log("shift is 8hr")
        const dayWorker = await helperFuncs.setWorkerForShift(
            sixToTwoArray,dateStr,[sixToSixDayArray,sixToTwoArray],constraints
        )
        
        const afternoonWorker = await helperFuncs.setWorkerForShift(
            twoToTenArray,dateStr,[sixToSixDayArray,sixToSixNightArray,twoToTenArray],constraints
        )
    
        const nightWorker = await helperFuncs.setWorkerForShift(
            tenToSixArray,dateStr,[sixToSixNightArray,tenToSixArray],constraints
        )
    
        shiftOne = {
            "shift":"8hr",
            "dayWorker":dayWorker,
            "afternoonWorker":afternoonWorker,
            "nightWorker":nightWorker,
        }
    }else{
        console.log("shift is 12hr")
        const dayWorker = await helperFuncs.setWorkerForShift(
            sixToSixDayArray,dateStr,[sixToTwoArray,twoToTenArray,sixToSixDayArray],constraints
        )

        const nightWorker = await helperFuncs.setWorkerForShift(
            sixToSixNightArray,dateStr,[tenToSixArray,twoToTenArray,sixToSixNightArray],constraints
        )

        shiftOne = {
            "shift":"12hr",
            "dayWorker":dayWorker,
            "nightWorker":nightWorker
        }

    }
 
    if (shiftTwoShift== "8hr"){
        console.log("shift is 8hr")
        const dayWorker = await helperFuncs.setWorkerForShift(
            sixToTwoArray,dateStr,[sixToSixDayArray,sixToTwoArray],constraints
        )
        
        const afternoonWorker = await helperFuncs.setWorkerForShift(
            twoToTenArray,dateStr,[sixToSixDayArray,sixToSixNightArray,twoToTenArray],constraints
        )
    
        const nightWorker = await helperFuncs.setWorkerForShift(
            tenToSixArray,dateStr,[sixToSixNightArray,tenToSixArray],constraints
        )

        shiftTwo = {
            "shift":"8hr",
            "dayWorker":dayWorker,
            "afternoonWorker":afternoonWorker,
            "nightWorker":nightWorker,
        }
    }else{
        console.log("shift is 12hr")
        const dayWorker = await helperFuncs.setWorkerForShift(
            sixToSixDayArray,dateStr,[sixToTwoArray,twoToTenArray,sixToSixDayArray],constraints
        )

        const nightWorker = await helperFuncs.setWorkerForShift(
            sixToSixNightArray,dateStr,[tenToSixArray,twoToTenArray,sixToSixNightArray],constraints
        )

        shiftTwo = {
            "shift":"12hr",
            "dayWorker":dayWorker,
            "nightWorker":nightWorker
        }
    }
    return {"success":[shiftOne,shiftTwo]}
}