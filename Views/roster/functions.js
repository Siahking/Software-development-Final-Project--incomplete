import * as apiFuncs from "../backend.js"

export function assignWorkers(paramObject){
    let shift1,shift2
    const results = rosterWorkers(
        paramObject.dayNumber,paramObject.month,paramObject.year,paramObject.WORKERS,
        paramObject.daysOff,paramObject.restrictions
    )
    if (Object.keys(results).includes("error")){
        return results
    }
    [shift1,shift2] = results.success

    const container = document.createElement("div")
    container.setAttribute("id",`${location}-workers-div`)

    let dayWorker1 = document.createElement("p")
    let dayWorker2 = document.createElement("p")
    let afternoonWorker1 = document.createElement("p")
    let afternoonWorker2 = document.createElement("p")
    let nightWorker1 = document.createElement("p")
    let nightWorker2 = document.createElement("p")
    
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

    dayWorker1.setAttribute("id",`${paramObject.dayNumber}-dayworker1`)
    dayWorker2.setAttribute("id",`${paramObject.dayNumber}-dayworker2`)
    afternoonWorker1.setAttribute("id",`${paramObject.dayNumber}-afternoonworker1`)
    afternoonWorker2.setAttribute("id",`${paramObject.dayNumber}-afternoonworker2`)
    nightWorker1.setAttribute("id",`${paramObject.dayNumber}-nightworker1`)
    nightWorker2.setAttribute("id",`${paramObject.dayNumber}-nightworker2`)

    for (const tag of [dayWorker1,dayWorker2]){
        paramObject.dayBlock.appendChild(tag)
    }

    for (const tag of [afternoonWorker1,afternoonWorker2]){
        paramObject.afternoonBlock.appendChild(tag)
    }

    for (const tag of [nightWorker1,nightWorker2]){
        paramObject.nightBlock.appendChild(tag)
    }

    return {"success":""}
}

export function rosterWorkers(day,month,year,workers,daysOff,restrictions){
    const shifts = ["8hr","12hr"] //randomly selects a shift for the workers
    const sixToSixDayArray = retrieveWorkers(day,month,year,workers,daysOff,restrictions,"6am-6pm")
    const sixToTwoArray = retrieveWorkers(day,month,year,workers,daysOff,restrictions,"6am-2pm")
    const twoToTenArray = retrieveWorkers(day,month,year,workers,daysOff,restrictions,"2pm-10pm")
    const sixToSixNightArray = retrieveWorkers(day,month,year,workers,daysOff,restrictions,"6pm-6am")
    const tenToSixArray = retrieveWorkers(day,month,year,workers,daysOff,restrictions,"10pm-6am")
    let shiftOne,shiftTwo

    const checkArray = [
        checkShifts("6am-6pm",sixToSixDayArray),
        checkShifts("6pm-6am",sixToSixNightArray),
        checkShifts("6am-2pm",sixToTwoArray),
        checkShifts("2pm-10pm",twoToTenArray),
        checkShifts("10pm-6am",tenToSixArray)
    ]

    for (const check of checkArray){
        if(Object.keys(check).includes("error")){
            return check
        }
    }

    const shiftOneShift = shifts[Math.floor(Math.random() * shifts.length)]
    const shiftTwoShift = shifts[Math.floor(Math.random() * shifts.length)]

    if (shiftOneShift== "8hr"){
        const dayWorker = sixToTwoArray.pop()
        setWorkerToUnavailable(dayWorker.id,[sixToSixDayArray])
        
        const afternoonWorker = twoToTenArray.pop()
        setWorkerToUnavailable(afternoonWorker.id,[sixToSixDayArray,sixToSixNightArray])
    
        const nightWorker = tenToSixArray.pop()
        setWorkerToUnavailable(nightWorker.id,[sixToSixNightArray])
    
        shiftOne = {
            "shift":"8hr",
            "dayWorker":dayWorker,
            "afternoonWorker":afternoonWorker,
            "nightWorker":nightWorker,
        }
    }else{
        const dayWorker = sixToSixDayArray.pop()
        setWorkerToUnavailable(dayWorker.id,[sixToTwoArray,twoToTenArray])
        const nightWorker = sixToSixNightArray.pop()
        setWorkerToUnavailable(nightWorker.id,[tenToSixArray,twoToTenArray])

        shiftOne = {
            "shift":"12hr",
            "dayWorker":dayWorker,
            "nightWorker":nightWorker
        }

    }
 
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
    return {"success":[shiftOne,shiftTwo]}
}

function retrieveWorkers(day,month,year,workers,daysOff,restrictions,hours){
    let array = []
    const excludedWorkers = {}
    //add workers to be excluded for this day to the excluded array
    //first cehcking for days off
    for (const result of daysOff){
        const [startYear,startMonth,startDay] = result.start_date.split("-")
        const [endYear,endMonth,endDay] = result.end_date.split("-")
        if (startMonth == (month+1) && startYear == year){
            if(
                day >= parseInt(startDay) && day <= parseInt(endDay) &&
                month <= parseInt(endMonth) && year <= parseInt(endYear)
            ) {
                excludedWorkers[result.worker_id] = true
            }
        }
    }
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

function setDayNightWorker(tag,worker,shift,time){
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

function checkShifts(strShift,shift){
    if (shift.length < 3){
        return {"error":`Insufficient workers for ${strShift}`}
    }
    return {"success":""}
}

function getDayName(dateString){
    const date = new Date(dateString);
    const options = { weekday: 'long' };
    return date.toLocaleDateString('en-US',options);
}

function restrictionCheck(day,worker,hours,restrictions){
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

function dayOffCheck(daysOff){
    //add workers to be excluded for this day to the object
    const obj = {}
    for (const result of daysOff){
        const [startYear,startMonth,startDay] = result.start_date.split("-")
        const [endYear,endMonth,endDay] = result.end_date.split("-")
        if (startMonth == (month+1) && startYear == year){
            if(
                day >= parseInt(startDay) && day <= parseInt(endDay) &&
                month <= parseInt(endMonth) && year <= parseInt(endYear)
            ) {
                obj[result.worker_id] = true
            }
        }
    }
    return obj
}