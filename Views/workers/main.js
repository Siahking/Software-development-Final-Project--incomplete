import * as backendFuncs from "./workers-functions.js"
import * as frontendFuncs from "./workers-frontend.js"

const addWorkerBtn = document.getElementById("add-worker")
const addWorkerDiv = document.getElementById('add-worker-div')
const toogleLocationsBtn = document.getElementById('toogle-btn')
const showLocationsDiv = document.getElementById('locations-input')
const addWorkerForm = document.getElementById('add-worker-form')
const findWorkersBtn = document.getElementById('find-worker')
const findWorkersDiv = document.getElementById('find-worker-div')
const searchForm = document.getElementById('workerSearchForm')
const specifiedCheckbox = document.getElementById("specified-option")
const dayCheckbox = document.getElementById("day-option")
const nightCheckbox = document.getElementById("night-option")
const eclipseCheckbox = document.getElementById("eclipse-option")

backendFuncs.displayLocations()
backendFuncs.showWorkers()
addWorkerBtn.addEventListener(
    "click",() => frontendFuncs.toogleDisplay(addWorkerDiv,findWorkersDiv)
)

toogleLocationsBtn.addEventListener(
    "click",() => frontendFuncs.toogleDisplay(showLocationsDiv)
)

addWorkerForm.addEventListener(
    "submit",backendFuncs.addWorkerHandler
)

findWorkersBtn.addEventListener(
    "click",() => frontendFuncs.toogleDisplay(findWorkersDiv,addWorkerDiv)
)

searchForm.addEventListener(
    "submit",(event) => backendFuncs.findWorkers(event)
)

for(const checkbox of [specifiedCheckbox,dayCheckbox,nightCheckbox,eclipseCheckbox]){
    checkbox.addEventListener(
        "change",(event)=>frontendFuncs.displayHours(event)
    )
}





