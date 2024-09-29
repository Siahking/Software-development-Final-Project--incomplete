import { findWorker,findLocation,getData,deleteLocation,newLocaton } from "./backend.js";

let searchBtnActive = false
let removeWorkerBtnActive = false
const findWorkerBtn = document.getElementById("remove-worker")
const searchBtn = document.getElementById("find-worker")
const searchDiv = document.getElementById("find-workers")

//array of checkbox ids for later use
const arr = ["id","first-name","last-name","middle-name"];

// if the id checkbox is clicked then i wont want to search by any other field,
// therefore this function disables the other fields if the id checkbox is checked
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

//toogles between showing the input fields for each checkbox if the checkbox is clicked or not
arr.forEach((value)=>{
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

function displaySearchDiv(){
    [searchBtn,findWorkerBtn].forEach(btn=>{
        btn.addEventListener("click",function (){
            //checks if both buttons were clicked and hides the search div upon the next click
            if (searchBtnActive && removeWorkerBtnActive){
                searchBtnActive = false;
                removeWorkerBtnActive = false;
                searchDiv.classList.add("hidden")
            }else{
                // if the "remove worker" button is clicked, handle if the div is shown or not
                if (this.id === "remove-worker" ){
                    removeWorkerBtnActive = true ? !removeWorkerBtnActive : false;
                    if (removeWorkerBtnActive){
                        searchDiv.classList.remove("hidden")
                    }else{
                        searchDiv.classList.add("hidden")
                    }
                }else{
                    // if the "search" button is clicked, handle if the div is shown or not
                    searchBtnActive = true ? !searchBtnActive : false;
                    if (searchBtnActive){
                        searchDiv.classList.remove("hidden")
                    }else{
                        searchDiv.classList.add("hidden")
                    }
                }
            }
        })
    })
}

displaySearchDiv();
