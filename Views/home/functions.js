import * as apiFuncs from "../backend.js"
import { objectCheck,displayError } from "../general-helper-funcs.js"

const errorTagId = "home-error"
const locationsErrorTag = document.getElementById("locations-error")
const rosterForm = document.getElementById("roster-form")
const locationsDiv = document.getElementById("locations-div")

export async function loadContents(){
    const locations = await apiFuncs.getLocations()

    if (objectCheck(locations)){
        locationsErrorTag.classList.remove("specified-hidden")
        return
    }
    rosterForm.classList.remove("specified-hidden")

    for (const location of locations){
        const label = document.createElement("label")
        const input = document.createElement("input")

        input.setAttribute("type","checkbox")
        input.setAttribute("name",location.location)
        input.setAttribute("value",location.id)
        input.setAttribute("id",`location-${location.location}-option`)
        input.setAttribute("class","location-option")

        const labelText = document.createTextNode(`${location.location}`)
        label.setAttribute("for",`location-${location.location}-option`)

        label.appendChild(input)
        label.appendChild(labelText)
        locationsDiv.appendChild(label)
    }
}

export function saveDateAndLocations(event){

    event.preventDefault()

    const locationsInput = document.getElementsByClassName("location-option")
    const dateInput = document.getElementById("date")
    const locations = []
    for (const input of locationsInput){
        if (input.checked){
            locations.push({
                id:input.value,
                location:input.name
            })
        }
    }

    const selectedDate = new Date(dateInput.value + "-01");
    const currentDate = new Date();
    currentDate.setDate(1)

    if (selectedDate <= currentDate) {
        displayError(errorTagId,"Please select a subsequent month.")
        return;
    }

    if (locations.length === 0){
        displayError(errorTagId,"Please select atleast one location")
        return
    }

    const dateObject = {
        month:selectedDate.getMonth() + 1,
        year:selectedDate.getFullYear()
    }

    localStorage.setItem("Date",JSON.stringify(dateObject))
    localStorage.setItem("Locations",JSON.stringify(locations))
    window.location.href = "/create-roster"
}