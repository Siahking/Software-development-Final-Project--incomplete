import * as frontend from "./frontend.js"
import * as funcs from "./functions.js"

const messageTag = document.getElementById("message")
const errorTag = document.getElementById("error-tag")
const rosterBtn = document.getElementById("create-roster")
const rosterDiv = document.getElementById("roster-div")

funcs.loadLocations()

rosterDiv.addEventListener("submit",(event)=>{
    event.preventDefault()

    funcs.saveDateAndLocations()
})

// //add message to the main div
window.addEventListener("DOMContentLoaded",()=>{
    const message = sessionStorage.getItem("Message")

    errorTag.innerHTML = ""

    if (message)
        messageTag.innerHTML = message
        sessionStorage.removeItem("Message")
        localStorage.removeItem("Message")
})

rosterBtn.addEventListener("click",frontend.toogleDiv)