import { toggleDiv } from "./frontend.js";

const loginBtn = document.getElementById("login-button")
const SignupBtn = document.getElementById("signup-button")

loginBtn.addEventListener("click",()=>{
    toggleDiv("login-button")
} 
)
SignupBtn.addEventListener("click",()=>{
    toggleDiv("signup-button")
}
)