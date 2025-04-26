import * as apiFuncs from "../backend.js"
import { deleteConfirmation, displayError, objectCheck } from "../general-helper-funcs.js";

const errorTagId = "locations-error"
const input = document.getElementById("location-input")
const list = document.getElementById("list");
const locationsErrorTag = document.getElementById("no-results-error-tag")

const valueCheck = ()=>{
    if (!input.value){
        displayError(errorTagId,"Please insert a valid search param")
        return false
    }
    return true
}

export async function loadLocations(){
    const locations = await apiFuncs.getLocations();

    if (objectCheck(locations)){
        locationsErrorTag.classList.remove("specified-hidden")
        return
    }
    
    locations.forEach(data=>{
        const listItem = document.createElement("li")
        listItem.classList.add("custom-list")
        const text = document.createTextNode(data.location)

        const deleteBtn = document.createElement("button")
        deleteBtn.innerText = "Delete"
        deleteBtn.classList.add("delete-btn")
        deleteBtn.value = data.id
        deleteBtn.id = `delete-${data.id}`

        deleteBtn.addEventListener("click",(event)=>
            deleteLocation(event.target.value)
        )

        listItem.appendChild(text)
        listItem.appendChild(deleteBtn)

        list.appendChild(listItem)
    })
}

export async function deleteLocation(id){
    if (deleteConfirmation("location")){
        const result = await apiFuncs.removeEntry(id,"locations")
        if (objectCheck(result)){
            displayError(errorTagId,result.error)
        }else{
            sessionStorage.setItem("Message",result.message)
            window.location.href = "/"
        }
    }else{
        console.log("passed here")
        displayError(errorTagId,"Operation Cancled")
    }
}

export async function newLocation(){
    if (!valueCheck())return false
    const result = await apiFuncs.addLocation(input.value)
    if (objectCheck(result)){
        displayError(errorTagId,result.error)
    }else{
        sessionStorage.setItem("Message",result.message)
        window.location.href = "/"
    }
}

export async function findlocation(){
    if (!valueCheck())return false
    const results = await apiFuncs.findLocation("location",input.value)
    if (objectCheck(results)){
        displayError(errorTagId,results.error)
        return
    }
    localStorage.setItem("locationsData",JSON.stringify(results))
    window.location.href = "/find-locations"
}