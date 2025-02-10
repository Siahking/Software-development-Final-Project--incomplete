import { findLocation, addLocation } from "../../static/javascript/backend.js";
import { errorTag, removeLocationActive } from "../../static/javascript/home.js";



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

export async function 