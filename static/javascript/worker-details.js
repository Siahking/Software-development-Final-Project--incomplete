// import { workerLocationSearch,findLocation } from "./backend.js";

// window.addEventListener("DOMContentLoaded", async function(){
//     const workerData = JSON.parse(localStorage.getItem("workerData"));
//     const table = document.getElementById("table");

//     if (!workerData){
//         console.error("No worker data found in the localStorage")
//         return
//     }
//     for (const object of workerData){
//         const container = document.createElement("tr")

//         const firstNameRow = document.createElement("td")
//         const lastNameRow = document.createElement("td")
//         const middleNameRow = document.createElement("td")
//         const ageRow = document.createElement("td")
//         const contactRow = document.createElement("td")
//         const genderRow = document.createElement("td")
//         const addressRow = document.createElement("td")
//         const idNumberRow = document.createElement("td")
//         const locationRow = document.createElement("td")

//         firstNameRow.innerHTML = object.first_name
//         lastNameRow.innerHTML = object.last_name
//         middleNameRow.innerHTML = object.middle_name ? object.middle_name : "Null";
//         ageRow.innerHTML = object.age
//         genderRow.innerHTML = object.gender ? object.gender : "Null";
//         addressRow.innerHTML = object.address
//         contactRow.innerHTML = object.contact ? object.contact : "Null";
//         idNumberRow.innerHTML = object.id_number

//         const locations = await workerLocationSearch("worker_id",object.id)
//         if (!locations){
//             locationRow.innerHTML = "Was not assigned to a location"
//         }else if (Object.keys(locations).includes("error")){
//             locationRow.innerHTML = "Error"
//         }else{
//             const locationNames = []
//             for (const location of locations){
//                 const result = await findLocation('id',location.location_id)
//                 locationNames.push(result[0].location)
//             }
//             const locationsStringForm = Object.values(locationNames).join(", ")
//             locationRow.innerHTML = locationsStringForm
//         }

//         for (const row of [firstNameRow,lastNameRow,middleNameRow,ageRow,genderRow,addressRow,contactRow,idNumberRow,locationRow]){
//             container.appendChild(row)
//         } 

//         table.appendChild(container)
//     }
// });