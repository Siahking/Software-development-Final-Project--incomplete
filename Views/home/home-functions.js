import { findLocation, addLocation, findWorker, addWorker, linkWorkerLocations, removeEntry } from "../../static/javascript/backend.js";
import {toogleStates} from "./home-frontend.js";
const errorTag = document.getElementById("error-tag")

export async function editLocations() {
    const locationInput = document.getElementById('location-input');
    const rawLocation = locationInput.value
    let location
    try{
        location = rawLocation.toLowerCase()
    }catch{
        errorTag.innerHTML = "Invalid input"
        return
    }
    let returnMessage
    if (location === ""){
        errorTag.innerHTML = "Please insert a value into the search tag"
        return
    }
    if (toogleStates.removeLocationState){
        const result = await findLocation("location",location)
        if (Object.keys(result).includes('error')){
            errorTag.innerHTML = "This location does not exist"
            return
        }
        const locationId = result[0].id
        returnMessage = await removeEntry(locationId,'locations')

    }else if (toogleStates.addLocationState){
        returnMessage = await addLocation(location)
    }

    if (Object.keys(returnMessage).includes('error')){
        errorTag.innerHTML = returnMessage.error
    }else{
        sessionStorage.setItem("Message",returnMessage.message)
        window.location.reload()
    }
}

export async function addWorkerHandler(event){

    event.preventDefault()

    const firstName = document.getElementById('add-first-name-input').value
    const lastName = document.getElementById('add-last-name-input').value
    const middleName = document.getElementById('add-middle-name-input').value !== "" ? document.getElementById('add-middle-name-input').value : null;
    const gender = document.getElementById('add-gender-input').value !== "" ? document.getElementById('add-gender-input').value : null;
    const address = document.getElementById('add-address-input').value
    const contact = document.getElementById('add-contact-input').value !== "" ? document.getElementById('add-contact-input').value : null;
    const age = Number(document.getElementById('add-age-input').value)
    const idNumber = Number(document.getElementById('add-id-number-input').value)
    const result = await addWorker(firstName,middleName,lastName,gender,address,contact,age,idNumber)
    const selectedLocations = []

    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
        return
    }

    const locationsArr = document.querySelectorAll(".location-check")
    locationsArr.forEach(location=>{
        if (location.checked){
            selectedLocations.push({id:location.id,location:location.value})
        };
    });

    if (selectedLocations.length>0) {
        //find the worker using the idNumber then assign the worker to a location using worker and location id
        const newWorker = await findWorker("","","",idNumber)
        const newWorkerId = newWorker[0].id
        console.log(newWorker)
        selectedLocations.forEach((location)=>{
            linkWorkerLocations(newWorkerId,location.id)
        })
    }    

    sessionStorage.setItem("Message",result.message)

    window.location.href = '/'
}  