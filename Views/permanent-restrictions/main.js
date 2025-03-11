import * as funcs from './functions.js'
import * as frontend from "./frontend.js"

const addRestrictionBtn = document.getElementById("add-restriction-btn")
const findRestrictionBtn = document.getElementById("find-restriction-btn")
const addRestrictionDiv = document.getElementById("add-restriction-div")
const findRestrictionDiv = document.getElementById("find-restriction-div")
const addRestrictionForm = document.getElementById("add-restriction-form")
const findRestrictionForm = document.getElementById("find-restriction-form")

funcs.displayRestrictions()

findRestrictionBtn.addEventListener("click",()=>
    frontend.toogleRestrictonDivs(findRestrictionDiv,addRestrictionDiv)
)

addRestrictionBtn.addEventListener("click",()=>
    frontend.toogleRestrictonDivs(addRestrictionDiv,findRestrictionDiv)
)

addRestrictionForm.addEventListener("submit",(event)=>{
    event.preventDefault()
    funcs.addRestriction()
})

findRestrictionForm.addEventListener("submit",(event)=>{
    event.preventDefault()
    funcs.findRestriction()
})

