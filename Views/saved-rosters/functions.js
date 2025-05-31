import * as apiFuncs from "../backend.js"

export async function saveRoster(workersDetail){
    
    for (const workerDetail of workersDetail){
        const workerid = workerDetail.getAttribute("workerid")
        if (!workerid)continue
        const shiftType = workerDetail.getAttribute("shifttype")
        const locationId = workerDetail.getAttribute("locationid")
        const day = workerDetail.getAttribute("day")
        const monthYear = workerDetail.getAttribute("monthyear")
        const [month,year] = monthYear.split("-")
        console.log(day,month,year)

        // const createRosterResults = await apiFuncs.saveRoster(locationId,)
    }

}