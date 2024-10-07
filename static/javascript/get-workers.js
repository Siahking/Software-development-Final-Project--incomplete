import { getWorkers } from "./backend.js";

const tableHeadArray = ["ID","FirstName","LastName","MiddleName","Gender","Address","Contact","Age","Id Number","Location_ID"]
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

    console.log(workers)

    workers.forEach((worker)=>{
        const workerArr = [
            worker.id,worker.first_name,worker.last_name,worker.middle_name,
            worker.gender,worker.address,worker.contact,worker.age,worker.id_number,worker.location_id
        ]

        const tableRow = document.createElement("tr")

        workerArr.forEach((field)=>{
            const tableData = document.createElement("td")
            if (field){
                tableData.innerHTML = field
            }else{
                tableData.innerHTML = "Null"
            }
            tableRow.append(tableData)
        })
        table.append(tableRow)
    })
}

showWorkers()