import * as backendFuncs from "./functions.js"
import * as frontendFuncs from "./frontend.js"

const addWorkerBtn = document.getElementById("add-worker")
const addWorkerDiv = document.getElementById('add-worker-div')
const toogleLocationsBtn = document.getElementById('toogle-btn')
const showLocationsDiv = document.getElementById('locations-input')
const addWorkerForm = document.getElementById('add-worker-form')
const findWorkersBtn = document.getElementById('find-worker')
const findWorkersDiv = document.getElementById('find-worker-div')
const editWorkerBtn = document.getElementById("edit-worker")
const editWorkerDiv = document.getElementById("edit-worker-div")
const searchForm = document.getElementById('workerSearchForm')
const specifiedCheckbox = document.getElementById("specified-option")
const dayCheckbox = document.getElementById("day-option")
const nightCheckbox = document.getElementById("night-option")
const eclipseCheckbox = document.getElementById("eclipse-option")
const editWorkerForm = document.getElementById("edit-worker-form")

backendFuncs.displayLocations()
backendFuncs.showWorkers()
addWorkerBtn.addEventListener(
    "click",() => frontendFuncs.toogleDisplay(addWorkerDiv,[findWorkersDiv,editWorkerDiv])
)

toogleLocationsBtn.addEventListener(
    "click",() => frontendFuncs.toogleDisplay(showLocationsDiv)
)

addWorkerForm.addEventListener(
    "submit",backendFuncs.addWorkerHandler
)

findWorkersBtn.addEventListener(
    "click",() => frontendFuncs.toogleDisplay(findWorkersDiv,[addWorkerDiv,editWorkerDiv])
)

searchForm.addEventListener(
    "submit",(event) => backendFuncs.findWorkers(event)
)

for(const checkbox of [specifiedCheckbox,dayCheckbox,nightCheckbox,eclipseCheckbox]){
    checkbox.addEventListener(
        "change",(event)=>frontendFuncs.displayHours(event)
    )
}

editWorkerBtn.addEventListener(
    "click",() => frontendFuncs.toogleDisplay(editWorkerDiv,[addWorkerDiv,findWorkersDiv])
)

editWorkerForm.addEventListener(
    "submit",(event)=>{
        console.log("form submitted")
        backendFuncs.editWorker(event)}
)


