import * as funcs from "./functions.js"
import * as apiFuncs from "../backend.js"
import { setLoadingContainer } from "./helper-functions.js"
import { objectCheck } from "../general-helper-funcs.js"

export async function generateCalender(month,year){
    await apiFuncs.clearOccupancies()
    let constraints = {
        "worker1Constraints":{},
        "worker2Constraints":{}
    }
    let restrictions = {}
    let daysOff = await apiFuncs.getDaysOff()
    const constraintsArray = await apiFuncs.getConstraints()
    const restrictionsArray = await apiFuncs.getPermanentRestrictions()
    if (objectCheck(daysOff)){
        daysOff = []
    }
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

    for (const location of locations){
        const WORKERS = []
        const results = await apiFuncs.workerLocationSearch("location_id",location.id)
        const headerContainer = document.createElement("div")
        const locationName = document.createElement("h2")
        const locationErrorTag = document.createElement("p")
        locationErrorTag.classList.add("error-tag")
        locationName.innerText = location.location
        headerContainer.appendChild(locationName)
        headerContainer.classList.add("location-header-div")
        if (objectCheck(results)){
            locationErrorTag.innerText = "No workers found for this Location"
            headerContainer.appendChild(locationErrorTag)
            container.appendChild(headerContainer)
            continue
        }

        const loadingContainer = setLoadingContainer()
        headerContainer.appendChild(loadingContainer)
        
        for (const result of results){
            const worker = await apiFuncs.findWorker("","","","",result.worker_id)
            WORKERS.push(worker[0])
        }

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
                container.appendChild(headerContainer)
                loadingContainer.classList.add("specified-hidden")
                container.appendChild()
                return
            }else if(Object.keys(results).includes("Insufficient Workers")){
                locationErrorTag.innerText = "Insufficient Workers for locations:"
                const unorderedList = document.createElement("ul")
                for (const location of results["Insufficient Workers"]){
                    const li = document.createElement("li")
                    li.innerText = location
                    unorderedList.appendChild(li)
                }
                headerContainer.appendChild(locationErrorTag)
                headerContainer.appendChild(unorderedList)
                loadingContainer.classList.add("specified-hidden")
                container.appendChild(headerContainer)
                return
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
        calendarContainer.classList.remove("specified-hidden")
        loadingContainer.classList.add("specified-hidden")
    }
}