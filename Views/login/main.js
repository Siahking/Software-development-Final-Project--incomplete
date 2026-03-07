import { toggleDiv } from "./frontend.js";
import { storeCredentials,checkCredentials } from "./functions.js";

const loginBtn = document.getElementById("login-button")
const signupBtn = document.getElementById("signup-button")
const submitBtn = document.getElementById("submit-button")
const usernameTag = document.getElementById("username")
const passwordTag = document.getElementById("password")

loginBtn.addEventListener("click",()=>{
    toggleDiv("login-button")
})

signupBtn.addEventListener("click",()=>{
    toggleDiv("signup-button")
})

submitBtn.addEventListener("click",()=>{
    if (passwordTag.type === "password"){
        checkCredentials(usernameTag.value,passwordTag.value)
    }else{
        storeCredentials(usernameTag.value,passwordTag.value)
    }
})