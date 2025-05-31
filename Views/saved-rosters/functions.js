import * as apiFuncs from "../backend.js"
import { displayError, objectCheck } from "../general-helper-funcs.js"

export async function saveRoster(errorTagId,LocationId,workersDetail){

    const MonthYear = workersDetail[0].getAttribute("monthyear")
    const [Month,Year] = MonthYear.split("-")

    const newRoster = await apiFuncs.saveRoster(LocationId,Month,Year)
    if (objectCheck(newRoster)){
        displayError(errorTagId,newRoster.error)
        return
    }
    const RosterResult = await apiFuncs.retrieveRosters("",LocationId,Month,Year)
    
    for (const workerDetail of workersDetail){
        const workerid = workerDetail.getAttribute("workerid")
        if (!workerid)continue
        const shiftType = workerDetail.getAttribute("shifttype")
        let day = workerDetail.getAttribute("day")
        const monthYear = workerDetail.getAttribute("monthyear")
        const [month,year] = monthYear.split("-")

        if (parseInt(day) < 10)day = `0${day}`

        console.log(RosterResult[0].roster_id,workerid,`${year}-${month}-${day}`,shiftType)

        const createRosterResults = await apiFuncs.newRosterEntry(RosterResult[0].roster_id,workerid,`${year}-${month}-${day}`,shiftType)
        console.log(createRosterResults)

        if(objectCheck(createRosterResults)){
            displayError(errorTagId,createRosterResults.error)
            return
        }
    }
}