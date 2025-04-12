import * as apiFuncs from "../backend.js"

const rosterForm = document.getElementById("roster-form")
const errorTag = document.getElementById("error-tag")

export async function loadLocations(){
    const locations = await apiFuncs.getLocations()

    if (Object.keys(locations).includes("error")){
        errorTag.innerHTML = "No locations found"
        return
    }

    const submitBtn = document.createElement("button")
    submitBtn.setAttribute("type","submit")
    submitBtn.innerText = "submit"
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
        rosterForm.appendChild(label)
    }
    rosterForm.appendChild(submitBtn)
}

export function saveDateAndLocations(){
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
        errorTag.innerHTML = "Please select a subsequent month."
        return;
    }

    if (locations.length === 0){
        errorTag.innerHTML = "Please select atleast one location"
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