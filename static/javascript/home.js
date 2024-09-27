import { findLocation,getData,deleteLocation,newLocaton } from "./backend.js";

const arr = ["id","first-name","last-name","middle-name"];

document.getElementById("id").addEventListener("click",function(){
    const firstnameInput =  document.getElementById("first-name")
    const lastnameInput =  document.getElementById("last-name")
    const middlenameInput =  document.getElementById("middle-name")

    if (this.checked){
        [firstnameInput,lastnameInput,middlenameInput].forEach(value=>{
            value.setAttribute("disabled","true")
        })
    }else{
        [firstnameInput,lastnameInput,middlenameInput].forEach((variable)=>{
            variable.removeAttribute("disabled");
            variable.checked = false
        })
    };
});

arr.forEach((value)=>{
    const element = document.getElementById(value)
    const inputField = document.getElementById(value+"-input")
    element.addEventListener("click",function(){
        if (this.checked){
            inputField.classList.remove("hidden")
        }else{
            inputField.classList.add("hidden");
        }
    })
})