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

        firstNameRow.innerHTML = object.first_name
        lastNameRow.innerHTML = object.last_name
        middleNameRow.innerHTML = object.middle_name.Valid ? object.middle_name.String : "Null";
        ageRow.innerHTML = object.age
        genderRow.innerHTML = object.gender.Valid ? object.gender.String : "Null";
        addressRow.innerHTML = object.address
        contactRow.innerHTML = object.contact.Valid ? object.contact.String : "Null";
        idNumberRow.innerHTML = object.id_number

        for (const row of [firstNameRow,lastNameRow,middleNameRow,ageRow,genderRow,addressRow,contactRow,idNumberRow]){
            container.appendChild(row)
        }

        table.appendChild(container)
    })
});