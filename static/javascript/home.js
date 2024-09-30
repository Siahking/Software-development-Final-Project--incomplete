import { findWorker,findLocation,getData,deleteLocation,newLocaton } from "./backend.js";

let searchBtnActive = false
let removeWorkerBtnActive = false
const findWorkerBtn = document.getElementById("remove-worker")
const searchBtn = document.getElementById("find-worker")
const searchDiv = document.getElementById("find-workers")
const idCheckbox = document.getElementById("id")
const firstNameCheckbox = document.getElementById("first-name")
const lastNameCheckbox = document.getElementById("last-name")
const middleNameCheckbox = document.getElementById("middle-name")
const idInput = document.getElementById("id-input")
const firstNameInput =  document.getElementById("first-name-input")
const lastNameInput =  document.getElementById("last-name-input")
const middleNameInput =  document.getElementById("middle-name-input")

//array of checkbox ids for later use
const arr = [idCheckbox,firstNameCheckbox,lastNameCheckbox,middleNameCheckbox];

// if the id checkbox is clicked then i wont want to search by any other field,
// therefore this function disables the other fields if the id checkbox is checked
document.getElementById("id").addEventListener("click",function(){
    const checkboxArr = [firstNameCheckbox,lastNameCheckbox,middleNameCheckbox]
    const inputsArr = [firstNameInput,lastNameInput,middleNameInput]

    if (this.checked){
        checkboxArr.forEach(checkbox=>{
            checkbox.setAttribute("disabled","true")
        })
        inputsArr.forEach(input=>{
            input.value = ""
            if (!input.classList.contains("hidden")){
                input.classList.add("hidden")
            }
        })
    }else{
        checkboxArr.forEach((checkbox)=>{
            checkbox.removeAttribute("disabled");
            checkbox.checked = false
        })
    };
});

//toogles between showing the input fields for each checkbox if the checkbox is clicked or not
arr.forEach((element)=>{
    const inputField = document.getElementById(element.id + "-input")
    element.addEventListener("click",function(){
        if (this.checked){
            inputField.classList.remove("hidden")
        }else{
            inputField.classList.add("hidden");
            inputField.value = ""
        }
    })
})

function toogleValues(currentBtn){
    //create ternary operator and place this code inside the displaySearchDiv function
    if (currentBtn){
        searchDiv.classList.remove("hidden")
    }else{
        searchDiv.classList.add("hidden")
    }
    return currentBtn
}

function displaySearchDiv(){
    [searchBtn,findWorkerBtn].forEach(btn=>{
        btn.addEventListener("click",function (){
            if (this.id === "remove-worker" ){
                //fix the ternary operator
                if (removeWorkerBtnActive){
                    removeWorkerBtnActive = false
                }else{
                    removeWorkerBtnActive = true
                }
                // removeWorkerBtnActive = false ? removeWorkerBtnActive : true;
                searchBtnActive = false
                toogleValues(removeWorkerBtnActive)
            }else{
                if (searchBtnActive){
                    searchBtnActive = false
                }else{
                    searchBtnActive = true
                }
                // searchBtnActive = false ? !searchBtnActive : true;
                removeWorkerBtnActive = false
                toogleValues(searchBtnActive)
            }
        })
    })
}

//Helper function to assign values to the variables based on the input of input fields and if the checkbox is checked
function assignVariables(input,checkbox){
    if (input.value !== "" && checkbox.checked) return input.value
    return null
}

//checks for empty input fields and unchecked boxes, if no fields are filled returns an error
function checkForNullValues(){
    
    console.log('passed outside')
    
    return [id,firstName,lastName,middleName]
}

displaySearchDiv();
document.getElementById("workerSearchForm").addEventListener("submit",async function (event){

    event.preventDefault()

    const errorMsg = "Please make sure to check a box and fill out the input field before submitting the form"
    const errorTag = document.getElementById("error-tag")
    const id = assignVariables(idInput,idCheckbox)
    const firstName = assignVariables(firstNameInput,firstNameCheckbox)
    const lastName = assignVariables(lastNameInput,lastNameCheckbox)
    const middleName = assignVariables(middleNameInput,middleNameCheckbox)
    const tempArr = [id,firstName,lastName,middleName]

    for (let i = 0;i < tempArr.length;i++) {
        if (tempArr[i] !== null)break
        else if (i === (tempArr.length - 1) && tempArr[i] === null){
            errorTag.innerHTML = errorMsg
            return
        }
    }

    const results = await findWorker(id,firstName,lastName,middleName)

    console.log(results)
})
