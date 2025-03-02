import * as funcs from "./functions.js"
import * as frontend from "./frontend.js"

const addDaysOffBtn = document.getElementById("add-days-off")
const findDaysOffBtn = document.getElementById("find-days-off")
const addDaysOffDiv = document.getElementById("add-days-off-div")
const findDaysOffDiv = document.getElementById("find-days-off-div")
const workerIdCheckbox = document.getElementById("workerid-radio")
const breakIdCheckbox = document.getElementById("breakid-radio")
const form = document.getElementById("find-days-off-form")

funcs.displayDaysOff()

addDaysOffBtn.addEventListener("click",()=>
    frontend.toogleDivs(addDaysOffDiv,findDaysOffDiv)
)

findDaysOffBtn.addEventListener("click",()=>
    frontend.toogleDivs(findDaysOffDiv,addDaysOffDiv)
)

addDaysOffDiv.addEventListener("submit",(event)=>
    funcs.newDaysOff(event)
)

for (const checkbox of [workerIdCheckbox,breakIdCheckbox]){
    checkbox.addEventListener("change",(event)=>
        frontend.toogleCheckboxes(event)
    )
}

form.addEventListener("submit",(event)=>
    funcs.findDaysOff(event)
)



