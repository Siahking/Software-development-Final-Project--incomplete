import * as frontendFuncs from "./locations-frontend.js"
import * as backendFuncs from "./locations-functions.js"
import { toogleStates } from "./locations-frontend.js"

const submitBtn = document.getElementById("location-submit-btn")
const addLocationBtn = document.getElementById("add-location")
const findLocationBtn = document.getElementById("find-location")

backendFuncs.loadLocations()

for (const btn of [addLocationBtn,findLocationBtn]){
    btn.addEventListener("click",(event)=>
        frontendFuncs.toogleDiv(event.target.id)
    )
}

submitBtn.addEventListener("click",()=>{
    console.log("clicked")
    if(toogleStates["add-location"]){
        backendFuncs.newLocation()
    }else{
        backendFuncs.findlocation()
    }
})