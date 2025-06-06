import * as funcs from "./functions.js"
import * as apiFuncs from "../backend.js"
import { setLoadingContainer } from "./helper-functions.js"
import { objectCheck } from "../general-helper-funcs.js"
import { saveRoster } from "../saved-rosters/functions.js"

export async function generateCalender(month,year){
    const [
        _clearOccupancies,daysOffResult,constraintsArray,restrictionsArray
    ] = await Promise.all([
        apiFuncs.clearOccupancies(),
        apiFuncs.getDaysOff(),
        apiFuncs.getConstraints(),
        apiFuncs.getPermanentRestrictions()
    ])

    await _clearOccupancies
    let constraints = {
        "worker1Constraints":{},
        "worker2Constraints":{}
    }
    let restrictions = {}
    const daysOff = !objectCheck(daysOffResult) ? daysOffResult : []

    if (!objectCheck(constraintsArray)){
        for (const constraint of constraintsArray){
            const worker1Key = constraint.worker1_id
            const worker2Key = constraint.worker2_id
            const generalData = {
                id:constraint.id,
                note:constraint.note
            }
            const worker1Data = {...generalData,...{worker2_id:constraint.worker2_id}}
            const worker2Data = {...generalData,...{worker1_id:constraint.worker1_id}}
            if (constraints.worker1Constraints[worker1Key]){
                constraints.worker1Constraints[worker1Key].push(worker1Data)         
            }else{
                constraints.worker1Constraints[worker1Key] = [worker1Data]
            }
            
            if (constraints.worker2Constraints[worker2Key]){
                constraints.worker2Constraints[worker2Key].push(worker2Data)
            }else{
                constraints.worker2Constraints[worker2Key] = [worker2Data]
            }
            
        }
    }
    if (!objectCheck(restrictionsArray)){  
        for (const restriction of restrictionsArray){
            const key = restriction.worker_id
            const restrictionObject = {
                id:restriction.id,
                day_of_week:restriction.day_of_week,
                start_time:restriction.start_time,
                end_time:restriction.end_time
            }
            if (restrictions[key]){
                restrictions[key].push(restrictionObject)
            }else{
                restrictions[key] = [restrictionObject]
            }
        }
    }
    
    const locations = JSON.parse(localStorage.getItem("Locations"))
    const container = document.getElementById("container")

    const locationFragment = document.createDocumentFragment();
    for (const location of locations){
        let errorFound = false
        const WORKERS = await apiFuncs.retrieveWorkerOrLocations("location_id",location.id)
        const headerContainer = document.createElement("div")
        const locationName = document.createElement("h2")
        const locationErrorTag = document.createElement("p")
        const saveRosterBtn = document.createElement("button")
        const saveRosterContainer = document.createElement("div")
        const errorContainer = document.createElement("div")
        const errorTag = document.createElement("p")
        const saveTag = document.createElement("p")
        saveRosterBtn.innerText = `Save ${location.location} Roster`
        saveRosterBtn.setAttribute("id",location.id)
        saveRosterBtn.classList.add("green-btn")

        saveRosterBtn.addEventListener("click",(event)=>{
            const locationId = event.target.id
            const errorTagId = `location-${location.id}-error`
            const workerDetails = document.querySelectorAll(`[name="${locationId}-workerDetails"]`)
            saveRoster(errorTagId,locationId,workerDetails)
        })

        saveRosterContainer.setAttribute("id","save-roster-container")
        saveRosterContainer.appendChild(saveRosterBtn)

        errorTag.setAttribute("id",`location-${location.id}-error-tag`)
        errorTag.classList.add("error-tag")
        errorContainer.classList.add("specified-hidden","error-container")
        errorContainer.setAttribute("id",`location-${location.id}-error-container`)
        errorContainer.appendChild(errorTag)

        saveTag.setAttribute("id",`${location.id}-message`)
        saveTag.classList.add("specified-hidden")

        locationErrorTag.classList.add("error-tag")
        locationName.innerText = location.location
        headerContainer.appendChild(locationName)
        headerContainer.classList.add("location-header-div")
        if (objectCheck(WORKERS)){
            locationErrorTag.innerText = "No workers found for this Location"
            headerContainer.appendChild(locationErrorTag)
            locationFragment.appendChild(headerContainer)
            continue
        }

        const loadingContainer = setLoadingContainer()
        headerContainer.appendChild(loadingContainer)

        const calendarContainer = document.createElement("div")
        calendarContainer.classList.add("specified-hidden")
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const date = new Date(year, month - 1, 1);
        const firstDayOfWeek = date.getDay();
        const daysInMonth = new Date(year, month, 0).getDate();

        calendarContainer.setAttribute("id",`${location.location}-roster`)
        calendarContainer.classList.add("calendar-container")

        // Add day headers (Sunday, Monday, etc.)
        daysOfWeek.forEach(day => {
            const header = document.createElement("div");
            header.className = "calendar-item calendar-header";
            header.textContent = day;
            calendarContainer.appendChild(header);
        });

        // Create empty spaces before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "calendar-item empty-cell";
            calendarContainer.appendChild(emptyCell);
        }

        // Add day numbers and shift blocks
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement("div");
            dayCell.className = "calendar-item calendar-day";

            // Create a span for the day number (top-right corner)
            const dayNumber = document.createElement("span");
            dayNumber.className = "day-number";
            dayNumber.textContent = day;

            // Create divs for shift blocks
            const morningShiftBlock = document.createElement("div");
            morningShiftBlock.className = "shift-block shift-1";

            const eveningShiftBlock = document.createElement("div");
            eveningShiftBlock.className = "shift-block shift-2";

            const nightShiftBlock = document.createElement("div");
            nightShiftBlock.className = "shift-block shift-3";

            const assignWorkerParams = {
                dayNumber:day,
                month:month,
                year:year,
                WORKERS:WORKERS,
                location:location,
                dayBlock:morningShiftBlock,
                afternoonBlock:eveningShiftBlock,
                nightBlock:nightShiftBlock,
                daysOff:daysOff,
                restrictions:restrictions,
                constraints:constraints
            }

            const results = await funcs.assignWorkers(assignWorkerParams)
            if (objectCheck(results)){
                locationErrorTag.innerText = results.error
                headerContainer.appendChild(locationErrorTag)
                loadingContainer.classList.add("specified-hidden")
                locationFragment.appendChild(headerContainer)
                errorFound = true
                break
            }else if(Object.keys(results).includes("Insufficient Workers")){
                locationErrorTag.innerText = "Insufficient Workers for shifts:"
                const unorderedList = document.createElement("ul")
                for (const location of results["Insufficient Workers"]){
                    const li = document.createElement("li")
                    li.innerText = location
                    unorderedList.appendChild(li)
                }
                headerContainer.appendChild(locationErrorTag)
                headerContainer.appendChild(unorderedList)
                loadingContainer.classList.add("specified-hidden")
                locationFragment.appendChild(headerContainer)
                errorFound = true
                break
            }

            // Append elements inside the day cell
            dayCell.appendChild(dayNumber);
            dayCell.appendChild(morningShiftBlock);
            dayCell.appendChild(eveningShiftBlock);
            dayCell.appendChild(nightShiftBlock);

            calendarContainer.appendChild(dayCell);

            container.appendChild(headerContainer)
            container.appendChild(calendarContainer)
        }
        if (errorFound)continue
        calendarContainer.classList.remove("specified-hidden")
        loadingContainer.classList.add("specified-hidden")

        locationFragment.appendChild(headerContainer)
        locationFragment.appendChild(calendarContainer)
        locationFragment.appendChild(saveRosterContainer)
        locationFragment.appendChild(saveTag)
        locationFragment.appendChild(errorContainer)
        container.appendChild(locationFragment)
    }
}