import * as apiFuncs from "../backend.js"
import { deleteConfirmation, displayError, objectCheck } from "../general-helper-funcs.js";

const errorTagId = "locations-error"
const input = document.getElementById("location-input")
const list = document.getElementById("list");
const locationsErrorTag = document.getElementById("no-results-error-tag")
const resultsContainer = document.getElementById("search-items")
const locationsArr = []

const valueCheck = ()=>{
    if (!input.value){
        displayError(errorTagId,"Please insert a valid value")
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
        locationsArr.push(data)
    })
}

export async function deleteLocation(id){
    if (deleteConfirmation("location")){
        const result = await apiFuncs.removeEntry(id,"locations")
        if (objectCheck(result)){
            displayError(errorTagId,result.error)
        }else{
            sessionStorage.setItem("Message",result.message)
            window.location.href = "/home"
        }
    }else{
        displayError(errorTagId,"Operation Canceled")
    }
}

export async function newLocation(){
    if (!valueCheck())return false
    //capitalize the name before adding it to the backend
    const nameArray = input.value.split(' ')
    const capitalizedName = nameArray.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    const result = await apiFuncs.addLocation(capitalizedName)
    if (objectCheck(result)){
        displayError(errorTagId,result.error)
    }else{
        sessionStorage.setItem("Message",result.message)
        window.location.href = "/home"
    }
}

export function displayOptions(){
    const value = input.value.toLowerCase()
    let matches

    resultsContainer.innerHTML = ""
    resultsContainer.classList.add("hidden")

    if (value){
        matches = locationsArr.filter(location=>location.location.toLowerCase().includes(value))
        matches.map(result=>{
            const item = document.createElement("p")
            item.setAttribute("id",`${result.id}-option`)
            item.classList.add("search-item")
            item.innerText = result.location
            item.addEventListener("click",()=>selectOption(`${result.location}`))
            resultsContainer.appendChild(item)
        })
        if (matches.length>0)resultsContainer.classList.remove("hidden")
    }
}

function selectOption(value){
    input.value = value
    resultsContainer.classList.add("hidden")
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

export async function editLocation(event){

    event.preventDefault()

    const locationId = document.getElementById("targetId").value
    const locationName = document.getElementById("newLocationName").value

    if (!locationId){
        displayError(errorTagId,"Location ID required")
        return
    }

    const results = await apiFuncs.editLocation(locationId, locationName)

    if (!results) {
        displayError(errorTagId, "Location update failed. Please try again.")
        return
    }

    if (objectCheck(results) && results.error) {
        displayError(errorTagId, results.error)
        return
    }

    if (results.message) {
        sessionStorage.setItem("Message", results.message)
        window.location.href = "/home"
        return
    }

    // Fallback for unknown but non-error response
    displayError(errorTagId, "Location update completed.")
    console.log("editLocation response:", results)
}