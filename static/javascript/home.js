import { findWorker,findLocation,getData,deleteLocation,newLocaton } from "./backend.js";

function removeHidden(id){
    const tag = document.getElementById(id)
    tag.classList.remove("hidden")
}

["id","first-name","last-name","middle-name"].forEach((value)=>{
    const element = document.getElementById(value)
    const inputField = document.getElementById(value+"-input")
    element.addEventListener("click",function(){
        if (this.checked){
            inputField.classList.remove("hidden")
        }else{
            inputField.classList.add("hidden");
            inputField.value = ""
        }
    })
})

document.getElementById("id").addEventListener("click",function(){
    const firstnamecheckbox =  document.getElementById("first-name")
    const lastnamecheckbox =  document.getElementById("last-name")
    const middlenamecheckbox =  document.getElementById("middle-name")
    const firstnameInput = document.getElementById("first-name-input")
    const lastnameInput = document.getElementById("last-name-input")
    const middlenameInput = document.getElementById("middle-name-input")

    if (this.checked){
        [firstnamecheckbox,lastnamecheckbox,middlenamecheckbox].forEach(value=>{
            value.setAttribute("disabled","true")
        })
        for (const value of [firstnameInput,lastnameInput,middlenameInput]){
            if (!value.classList.contains("hidden")){
                value.classList.add("hidden")
            }
        }
    }else{
        [firstnamecheckbox,lastnamecheckbox,middlenamecheckbox].forEach((variable)=>{
            variable.removeAttribute("disabled");
            variable.checked = false
        })
    };
});

document.getElementById("find-worker").addEventListener("click",()=>{
    removeHidden("find-worker-div")
})

document.getElementById("workerSearchForm").addEventListener("submit",async function(event){

    event.preventDefault()
    const errorTag = document.getElementById("error-tag")
    const isIdChecked = document.getElementById("id").checked
    const isFirstNameChecked = document.getElementById("first-name").checked
    const isLastNameChecked = document.getElementById("last-name").checked
    const isMiddleNameChecked = document.getElementById("middle-name").checked

    const id = isIdChecked ? document.getElementById("id-input").value : null;
    const firstName = isFirstNameChecked ? document.getElementById("first-name-input").value : null;
    const lastName = isLastNameChecked ? document.getElementById("last-name-input").value : null;
    const middleName = isMiddleNameChecked ? document.getElementById("middle-name-input").value : null;

    const temporaryArray = [id,firstName,lastName,middleName]

    for (let i = 0;i < temporaryArray.length;i++){
        if (temporaryArray[i])break
        else if (i === (temporaryArray.length)-1 && !temporaryArray[i]){
            errorTag.innerHTML = "No Fields clicked or no input provided, please populate the fields for search!"
            return
        } 
    }

    const results = await findWorker(id,firstName,lastName,middleName)
    if (Object.keys(results).includes("error")){
        errorTag.innerHTML = results.error+"!"
    }else{
        localStorage.setItem("workerData",JSON.stringify(results));
        window.location.href = "/worker-details"
    }
})