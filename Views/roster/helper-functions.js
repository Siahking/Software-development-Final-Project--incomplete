export function retrieveWorkers(day,month,year,workers,daysOff,restrictions,hours){
    let array = []
    const excludedWorkers = dayOffCheck(day,month,daysOff)
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
    if (workersToExclude.length > 0){
        console.log(workersToExclude)
    }
}

export function checkShifts(strShift,shift){
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

function dayOffCheck(day,month,daysOff){
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