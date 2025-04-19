import { getWorker } from '../permanent-restrictions/functions.js'

const table = document.getElementById("table")

export async function displayRestrictions() {
    const restrictions = JSON.parse(localStorage.getItem("Restrictions"))

    for (const restriction of restrictions){
        const workerData = await getWorker(restriction.worker_id)
        const tableRow = document.createElement("tr")
        const idData = document.createElement("td")
        const firstNameData = document.createElement("td")
        const lastNameData = document.createElement("td")
        const dayOfWeekData= document.createElement("td")
        const startTimeData = document.createElement("td")
        const endTimeData = document.createElement("td")
        
        idData.innerText  = restriction.id
        firstNameData.innerText = workerData.first_name
        lastNameData.innerText = workerData.last_name
        dayOfWeekData.innerText = restriction.day_of_week
        startTimeData.innerText = restriction.start_time == "00:00:00" ?  "--" :  restriction.start_time
        endTimeData.innerText = restriction.end_time == "00:00:00" ?  "--" :  restriction.end_time
        
        for (const data of [idData,firstNameData,lastNameData,dayOfWeekData,startTimeData,endTimeData]){
            tableRow.appendChild(data)
        }

        table.appendChild(tableRow)
    }
}