import { toggleContainer } from "./frontend.js"
import { accountLogout } from "./functions.js"

// editAccount,deleteAccoutn,


const editBtn = document.getElementById("edit-account-btn")
const deleteBtn = document.getElementById("delete-account-btn")
const logoutBtn = document.getElementById("logout")


editBtn.addEventListener("click",()=>{
    toggleContainer(true)
})

deleteBtn.addEventListener("click",()=>{
    toggleContainer()
})

logoutBtn.addEventListener("click",async ()=>{
    toggleContainer()
    await accountLogout()
})