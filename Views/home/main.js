import * as frontend from "./frontend.js"
import * as funcs from "./functions.js"

const messageTag = document.getElementById("message")
const rosterBtn = document.getElementById("create-roster")
const rosterDiv = document.getElementById("roster-div")

funcs.loadContents()

rosterDiv.addEventListener("submit",(event)=>{
    funcs.saveDateAndLocations(event)
})

// //add message to the main div
window.addEventListener("DOMContentLoaded",()=>{
    const message = sessionStorage.getItem("Message")

    if (message)
        messageTag.innerText = message
        sessionStorage.removeItem("Message")
        localStorage.removeItem("Message")
})

rosterBtn.addEventListener("click",frontend.toogleDiv)