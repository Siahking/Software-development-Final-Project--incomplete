import * as apiFuncs from "../backend.js"

const table = document.getElementById("constraints-data")

async function removeConstraint(id){
    const result = await apiFuncs.deleteConstraints(id)
    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
    }else{
        sessionStorage.setItem("Message",result.message)
        window.location.href = "/"
    }
}

export async function displayConstraints(){
    const constraints = JSON.parse(localStorage.getItem("Constraints"));

    for(const constraint of constraints){
        const worker1Id = constraint.worker1_id
        const worker2Id = constraint.worker2_id

        const worker1 = await apiFuncs.findWorker("","","","",worker1Id)
        const worker2 = await apiFuncs.findWorker("","","","",worker2Id)

        const worker1Info = `${worker1[0].first_name} ${worker1[0].last_name}`
        const worker2Info = `${worker2[0].first_name} ${worker2[0].last_name}`

        const tableRow = document.createElement("tr")
        const IDData = document.createElement("td")
        const worker1Data = document.createElement("td")
        const worker2Data = document.createElement("td")
        const summaryData = document.createElement("td")
        const deleteCell = document.createElement("td")
        const deleteBtn = document.createElement("button")

        deleteBtn.innerHTML = "Delete Constraint"
        deleteBtn.value = constraint.id
        deleteBtn.id = `deleteBtn-${constraint.id}`
        deleteBtn.classList.add("delete-btn")
        deleteBtn.addEventListener("click",(event)=>removeConstraint(event.target.value))
        deleteCell.appendChild(deleteBtn)

        IDData.innerHTML = constraint.id
        worker1Data.innerHTML = worker1Info
        worker2Data.innerHTML = worker2Info
        summaryData.innerHTML = constraint.note

        for (const value of [IDData,worker1Data,worker2Data,summaryData]){
            tableRow.appendChild(value)
        }
        tableRow.appendChild(deleteBtn)
        table.appendChild(tableRow)
    }
}