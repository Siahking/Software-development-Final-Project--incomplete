import { getWorkers, workerLocationSearch,findLocation } from "./backend.js";

const tableHeadArray = ["ID","FirstName","LastName","MiddleName","Gender","Address","Contact","Age","Id Number","Locations"]
const table = document.getElementById("table");
const firstRow = document.createElement("tr");

tableHeadArray.forEach((item) => {
    const tableHead = document.createElement("th")
    tableHead.innerHTML = item;
    firstRow.appendChild(tableHead);
})
table.appendChild(firstRow)

async function showWorkers (){

    const workers = await getWorkers();

    for (const worker of workers){
        const workerArr = [
            worker.id,worker.first_name,worker.last_name,worker.middle_name,
            worker.gender,worker.address,worker.contact,worker.age,worker.id_number
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

        const locations = await workerLocationSearch("worker_id",worker.id)
        let locationStringOutput;

        if (locations){
            const tempArr = []
            for (const location of locations){
                const locationInfo = await findLocation("id",location.location_id)
                const locationName = locationInfo[0].location
                tempArr.push(locationName)
            }
            locationsRow.innerHTML = tempArr.join(', ')
        }else{
            locationsRow.innerHTML = "Unassigned"
        }

        tableRow.appendChild(locationsRow)
        table.append(tableRow)
    }
}

showWorkers()