import { findLocation, addLocation, findWorker, addWorker } from "../../static/javascript/backend.js";
import { errorTag, removeLocationActive } from "../../static/javascript/home.js";

async function workerSearchFunction(idNumber){
    const result = await findWorker(null,null,null,null,idNumber)
    if (Object.keys(result).includes('error')){
        return false
    }
    return true
}

export async function editLocations( errorTag, removeLocationActive ) {
    const locationInput = document.getElementById('location-input');
    const location = locationInput.value
    if (location === ""){
        errorTag.innerHTML = "Please insert a value into the search tag"
        return
    }
    const result = await findLocation("location",location)

    if (removeLocationActive){
        if (Object.keys(result).includes('error')){
            errorTag.innerHTML = "This location does not exist"
            return
        }else{
            const filteredLocations = await findLocation("location",location)
            localStorage.setItem("Locations",JSON.stringify(filteredLocations))
            window.location.href = "/remove-location"
        }
    }else{
        if (!Object.keys(result).includes('error')){
            errorTag.innerHTML = "This location already exists"
            return
        }

        const message = await addLocation(location)

        if (Object.keys(message).includes('error')){
            sessionStorage.setItem('Message',message.error)
        }else{
            sessionStorage.setItem("Message",message.message)
        }
        window.location.reload()
    }
}

export async function homeLocationHandler(removeLocationActive,errorTag){
    const locationInput = document.getElementById('location-input');
    const location = locationInput.value
    if (location === ""){
        errorTag.innerHTML = "Please insert a value into the search tag"
        return
    }
    const result = await findLocation("location",location)

    if (removeLocationActive){
        if (Object.keys(result).includes('error')){
            errorTag.innerHTML = "This location does not exist"
            return
        }else{
            const filteredLocations = await findLocation("location",location)
            localStorage.setItem("Locations",JSON.stringify(filteredLocations))
            window.location.href = "/remove-location"
        }
    }else{
        if (!Object.keys(result).includes('error')){
            errorTag.innerHTML = "This location already exists"
            return
        }

        const message = await addLocation(location)

        if (Object.keys(message).includes('error')){
            sessionStorage.setItem('Message',message.error)
        }else{
            sessionStorage.setItem("Message",message.message)
        }
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

    if (workerSearchFunction(idNumber)){
        errorTag.innerHTML = 'User already exists'
        return
    }

    const locationsArr = document.querySelectorAll(".location-check")
    locationsArr.forEach(location=>{
        if (location.checked){
            selectedLocations.push({id:location.id,location:location.value})
        };
    });

    


}  