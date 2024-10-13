import { removeEntry } from "./backend.js";

window.addEventListener("DOMContentLoaded", ()=>{
    const workerData = JSON.parse(localStorage.getItem("workerData"));
    const table = document.getElementById("table");

    if (!workerData){
        console.error("No worker data found in the localStorage")
        return
    }

    workerData.forEach(object =>{
        const container = document.createElement("tr")

        const firstNameRow = document.createElement("td")
        const lastNameRow = document.createElement("td")
        const middleNameRow = document.createElement("td")
        const ageRow = document.createElement("td")
        const contactRow = document.createElement("td")
        const genderRow = document.createElement("td")
        const addressRow = document.createElement("td")
        const idNumberRow = document.createElement("td")
        const removeButton = document.createElement("button")

        firstNameRow.innerHTML = object.first_name
        lastNameRow.innerHTML = object.last_name
        middleNameRow.innerHTML = object.middle_name ? object.middle_name : "Null";
        ageRow.innerHTML = object.age
        genderRow.innerHTML = object.gender ? object.gender : "Null";
        addressRow.innerHTML = object.address
        contactRow.innerHTML = object.contact ? object.contact : "Null";
        idNumberRow.innerHTML = object.id_number

        for (const row of [firstNameRow,lastNameRow,middleNameRow,ageRow,genderRow,addressRow,contactRow,idNumberRow]){
            container.appendChild(row)
        }

        removeButton.setAttribute("id",object.id)
        removeButton.innerHTML = "Remove Worker"
        removeButton.classList.add("remove-button")

        container.appendChild(removeButton)

        table.appendChild(container)
    })

    const buttons = document.getElementsByClassName("remove-button")
    Array.from(buttons).forEach(button=>{
        button.addEventListener("click",async function (){
            const id = this.id
            const results = await removeEntry(id,"workers")
            
            sessionStorage.setItem("Message",results.message)

            window.location.href = "/";
        })
    })
});
