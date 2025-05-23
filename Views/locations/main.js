import * as frontend from "./frontend.js"
import * as funcs from "./functions.js"

const locationForm = document.getElementById("location-form")
const addLocationBtn = document.getElementById("add-location")
const findLocationBtn = document.getElementById("find-location")
const editLocationBtn = document.getElementById("edit-location")
const editLocationForm = document.getElementById("edit-location-form")

funcs.loadLocations()

for (const btn of [addLocationBtn,findLocationBtn]){
    btn.addEventListener("click",(event)=>
        frontend.toogleDiv(event.target.id)
    )
}

locationForm.addEventListener("submit",(event)=>{
    event.preventDefault()
    if(frontend.toogleStates["add-location"]){
        funcs.newLocation()
    }else{
        funcs.findlocation()
    }
})

editLocationBtn.addEventListener("click",frontend.toogleEditDiv)

editLocationForm.addEventListener("submit",(event)=>funcs.editLocation(event))