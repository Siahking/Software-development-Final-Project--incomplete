import * as apiFuncs from "../backend.js"
import { displayError } from "../general-helper-funcs.js"

const messageTag = document.getElementById("error-tag");

export async function checkCredentials(username,password){
    const result = await apiFuncs.login(username,password)
    if (result.error){
        displayError("error",result.error)
    }else{
        sessionStorage.setItem("Message","Login Successful")
        window.location.href = "/"
    }
}

export async function storeCredentials(username,password){
    const results = await apiFuncs.createAccount(username,password)
    if (results.error){
        messageTag.style.color = "red"
        displayError("error",results.error)
    }else{
        messageTag.style.color = "green"
        displayError("error",results.message)

        document.body.style.cursor = "wait"

        setTimeout(() => {
            window.location.href = "/login"
        }, 5000)
        window.location.href = "/login"
    }
}