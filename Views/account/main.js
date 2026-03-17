import { toggleContainer } from "./frontend.js"
import { accountLogout,editInfo,removeAccount } from "./functions.js"

// editAccount,deleteAccoutn,


const editBtn = document.getElementById("edit-account-btn")
const deleteBtn = document.getElementById("delete-account-btn")
const logoutBtn = document.getElementById("logout")
const saveBtn = document.getElementById("save-new-info")


editBtn.addEventListener("click",()=>{
    toggleContainer(true)
})

deleteBtn.addEventListener("click",async ()=>{
    toggleContainer()

    if (window.confirm("Would you like to proceed with deleting account?")){
        await removeAccount()
    }
})

logoutBtn.addEventListener("click",async (event)=>{

    toggleContainer()
    await accountLogout()
})

saveBtn.addEventListener("click",async (event)=>{
    event.preventDefault()
    await editInfo()
})