import { findWorker,findLocation,getWorkers,addLocation } from "./backend.js";

//sarch and remove workers logic
let addLocationBtnActive = false
let addWorkerBtnActive = false
let searchBtnActive = false
let removeWorkerBtnActive = false
const messageContainer = document.getElementById("message")
const errorTag = document.getElementById("error-tag")
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

//general functions
function hideOrShowActivity(btnActivity,div,inputElements=null){
    btnActivity = !btnActivity
    if (btnActivity){
        div.classList.remove('hidden')
        if (inputElements){
            inputElements.forEach(element=>{
                if (element.classList.contains('hidden')){
                    element.classList.remove('hidden')
                }
            })
        };
    }else{
        div.classList.add('hidden')
        if (inputElements){
            inputElements.forEach(element=>{
                if (!element.classList.contains('hidden')){
                    element.classList.add('hidden')
                }
            })
        };
    }
    return btnActivity
};

//add location logic
document.getElementById('add-location').addEventListener('click',function(){
    const submitBtn = document.getElementById('add-location-submit-btn')
    const addLocationDiv = document.getElementById('add-location-div')
    addLocationBtnActive = hideOrShowActivity(addLocationBtnActive,addLocationDiv)

    submitBtn.addEventListener('click',async function(){
        const locationInput = document.getElementById('location-input');
        const location = locationInput.value
        if (location === ""){
            errorTag.innerHTML = "Please insert a value into the search tag"
            return
        }
        const result = await findLocation(location)
        if (!Object.keys(result).keys().includes('error')){
            errorTag.innerHTML = "This location already exists"
            return
        }
        const message = await addLocation(location)
        messageContainer.innerHTML = message
    })
});

//add worker logic
document.getElementById('add-worker').addEventListener('click',function(){
    const submitBtn = document.getElementById('add-worker-submit-btn')
    const addWorkerDiv = document.getElementById('add-worker-div');
    addWorkerBtnActive = hideOrShowActivity(addWorkerBtnActive,addWorkerDiv)
})

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

//helper function for the displaySearchDiv function
function toogleValues(currentBtn){
    [idInput,firstNameInput,lastNameInput,middleNameInput].forEach(input=>input.value = "")
    currentBtn ? searchDiv.classList.remove("hidden") : searchDiv.classList.add("hidden")
    return currentBtn
}

// toogles between showing the input tags whether the search button was clicked or the remove worker
// button was clicked
function displaySearchDiv(){
    [searchBtn,findWorkerBtn].forEach(btn=>{
        btn.addEventListener("click",function (){
            if (this.id === "remove-worker" ){
                removeWorkerBtnActive = !removeWorkerBtnActive
                searchBtnActive = false
                toogleValues(removeWorkerBtnActive)
            }else{
                searchBtnActive = !searchBtnActive
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

displaySearchDiv();
document.getElementById("workerSearchForm").addEventListener("submit",async function (event){

    event.preventDefault()

    const errorMsg = "Please make sure to check a box and fill out the input field before submitting the form"
    const id = assignVariables(idInput,idCheckbox)
    const firstName = assignVariables(firstNameInput,firstNameCheckbox)
    const lastName = assignVariables(lastNameInput,lastNameCheckbox)
    const middleName = assignVariables(middleNameInput,middleNameCheckbox)
    const tempArr = [id,firstName,lastName,middleName]

// makes sure that atleast one checkbox and input field is filled and returns an error if not
    for (let i = 0;i < tempArr.length;i++) {
        if (tempArr[i] !== null)break
        else if (i === (tempArr.length - 1) && tempArr[i] === null){
            errorTag.innerHTML = errorMsg
            return
        }
    }

    const results = await findWorker(id,firstName,lastName,middleName)
    if (Object.keys(results).includes("error")){
        errorTag.innerHTML = results.errorMsg
        return
    }

    localStorage.setItem("workerData", JSON.stringify(results));

// redirects the user to the search page or the remove worker page depending on which button is clicked
    window.location.reload()
    if (searchBtnActive){
        window.location.href = "/worker-details";
    }else{
        window.location.href = "/remove-worker";
    }
})

//add message from deleting worker
window.addEventListener("DOMContentLoaded",()=>{
    const message = sessionStorage.getItem("Message")

    if (message)
        messageContainer.innerHTML = message
})