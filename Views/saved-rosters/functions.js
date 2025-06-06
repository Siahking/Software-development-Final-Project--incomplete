import * as apiFuncs from "../backend.js"
import { displayError, objectCheck } from "../general-helper-funcs.js"

export async function saveRoster(errorTagId,LocationId,workersDetail){

    const messageTag = document.getElementById(`${LocationId}-message`)
    const MonthYear = workersDetail[0].getAttribute("monthyear")
    const [Month,Year] = MonthYear.split("-")

    const newRoster = await apiFuncs.saveRoster(LocationId,Month,Year)
    if (objectCheck(newRoster)){
        messageTag.classList.add("specified-hidden")
        displayError(errorTagId,newRoster.error)
        return
    }
    const RosterResult = await apiFuncs.retrieveRosters("",LocationId,Month,Year)

    document.body.style.cursor = "wait"
    document.body.style.pointerEvents = "none"
    
    try{
        for (const workerDetail of workersDetail){
            const workerid = workerDetail.getAttribute("workerid")
            if (!workerid)continue
            const shiftType = workerDetail.getAttribute("shifttype")
            let day = workerDetail.getAttribute("day")
            const monthYear = workerDetail.getAttribute("monthyear")
            const [month,year] = monthYear.split("-")

            if (parseInt(day) < 10)day = `0${day}`

            const createRosterResults = await apiFuncs.newRosterEntry(RosterResult[0].roster_id,workerid,`${year}-${month}-${day}`,shiftType)

            if(objectCheck(createRosterResults)){
                displayError(errorTagId,createRosterResults.error)
                messageTag.classList.add("specified-hidden")
                break
            }
        }
    }finally{
        document.body.style.cursor = "default"
        document.body.style.pointerEvents = "auto"
    }

    messageTag.classList.remove("specified-hidden")
    messageTag.innerText = "Roster saved successfully"

}