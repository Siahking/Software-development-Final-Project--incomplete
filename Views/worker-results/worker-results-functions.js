import * as apiFuncs from '../backend.js'
import { deleteWorker } from "../../views/workers/workers-functions.js"

export async function showWorkers (){

    const workers = JSON.parse(localStorage.getItem("workerData"));
    
    for (const worker of workers){
        const workerArr = [
            worker.id,worker.first_name,worker.last_name,worker.middle_name,
            worker.gender,worker.address,worker.contact,worker.age,worker.id_number,
            worker.availability,worker.hours
        ]

        const tableRow = document.createElement("tr")

        for (const field of workerArr){
            const tableData = document.createElement("td")
            if (field){
                tableData.innerHTML = field
            }else{
                tableData.innerHTML = "Null"
            }
            tableRow.append(tableData)
        }
        const locationsRow = document.createElement("td")
        const locationsResults = await apiFuncs.workerLocationSearch("worker_id",worker.id)

        if (!Object.keys(locationsResults).includes('error')){
            const tempArr = []
            for (const location of locationsResults){
                const locationInfo = await apiFuncs.findLocation("id",location.location_id)
                const locationName = locationInfo[0].location
                tempArr.push(locationName)
            }
            locationsRow.innerHTML = tempArr.join(', ')
        }else{
            locationsRow.innerHTML = "Unassigned"
        }

        tableRow.appendChild(locationsRow)

        const deleteCell = document.createElement('td')
        const deleteBtn = document.createElement("button")
        deleteBtn.innerHTML = "Delete"
        deleteBtn.value = worker.id
        deleteBtn.addEventListener("click",(event)=>deleteWorker(event))

        deleteCell.appendChild(deleteBtn)

        tableRow.append(deleteCell)
        table.append(tableRow)
    }
}
