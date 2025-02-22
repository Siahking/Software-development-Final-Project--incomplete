import * as backendFuncs from "./workers-functions.js"
import * as frontendFuncs from "./workers-frontend.js"

const addWorkerBtn = document.getElementById("add-worker")
const addWorkerDiv = document.getElementById('add-worker-div')
const toogleLocationsBtn = document.getElementById('toogle-btn')
const showLocationsDiv = document.getElementById('locations-input')
const addWorkerForm = document.getElementById('add-worker-form')

backendFuncs.displayLocations()
backendFuncs.showWorkers()
addWorkerBtn.addEventListener(
    "click",() => frontendFuncs.toogleDisplay(addWorkerDiv)
)

toogleLocationsBtn.addEventListener(
    "click",() => frontendFuncs.toogleDisplay(showLocationsDiv)
)

addWorkerForm.addEventListener(
    "submit",backendFuncs.addWorkerHandler
)





