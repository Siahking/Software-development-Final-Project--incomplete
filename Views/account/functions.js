import { editAccount,findAccount,logout } from "../backend.js"

const errorTag = document.querySelector(".error-tag")

export async function editInfo(){
    const newUsername = document.getElementById("new-username").value
    const newPassword = document.getElementById("new-password").value
    const username = sessionStorage.getItem("Username")

    const results = await findAccount(username)

    console.log(results)

    if (newPassword || newUsername){
        editAccount()
    }else{

    }

    return
}

export async function accountLogout(){
    const results = await logout()
    console.log(results)
    if (results.error){
        errorTag.innerText = results.error
    }else{
        sessionStorage.setItem("Message",results.message)
        window.location = "/login"
    }
}

