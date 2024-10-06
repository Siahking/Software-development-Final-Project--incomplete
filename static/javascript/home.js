import { findWorker,findLocation,getWorkers,addLocation,addWorker } from "./backend.js";

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
const idNumberCheckbox = document.getElementById("id-number")
const idInput = document.getElementById("id-input")
const firstNameInput =  document.getElementById("first-name-input")
const lastNameInput =  document.getElementById("last-name-input")
const middleNameInput =  document.getElementById("middle-name-input")
const idNumberInput = document.getElementById("id-number-input")
const checkboxArr = [idCheckbox,firstNameCheckbox,lastNameCheckbox,middleNameCheckbox,idNumberCheckbox]
const inputsArr = [idInput,firstNameInput,lastNameInput,middleNameInput,idNumberInput]

//general functions
function disableElements(checkbox,checkboxArr,inputsArr){
    console.log(checkbox.checked)
    if(checkbox.checked){
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
};

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

//TODO FIND ALL WORKER ACTIVITY AND MAKE SURE THE ID_NUMBER IS INCLUDED

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
        if (!Object.keys(result).includes('error')){
            errorTag.innerHTML = "This location already exists"
            return
        }
        const message = await addLocation(location)

        window.location.reload()
    })
});

//add worker logic
document.getElementById('add-worker').addEventListener('click',function(){
    const submitBtn = document.getElementById('add-worker-submit-btn');
    const workerForm = document.getElementById('add-worker-form');
    const addWorkerDiv = document.getElementById('add-worker-div');
    addWorkerBtnActive = hideOrShowActivity(addWorkerBtnActive,addWorkerDiv)

    workerForm.addEventListener("submit",async function(event){

        event.preventDefault()

        const firstName = document.getElementById('add-first-name-input').value
        const lastName = document.getElementById('add-last-name-input').value
        const middleName = document.getElementById('add-middle-name-input').value !== "" ? document.getElementById('add-middle-name-input').value : null;
        const gender = document.getElementById('add-gender-input').value !== "" ? document.getElementById('add-gender-input').value : null;
        const address = document.getElementById('add-address-input').value
        const contact = document.getElementById('add-contact-input').value !== "" ? document.getElementById('add-contact-input').value : null;
        const age = document.getElementById('add-age-input').value
        const idNumber = document.getElementById('id-number-input').value

        const searchResults = await findWorker(null,null,null,null,idNumber);
        if (!Object.keys(searchResults).includes('error')){
            errorTag.innerHTML = 'user already exists'
            return
        }

        const result = await addWorker(firstName,middleName,lastName,gender,
            address,contact,age,idNumber
        )

        console.log(result)

    })

})

//array of checkbox ids for later use
const arr = [idCheckbox,firstNameCheckbox,lastNameCheckbox,middleNameCheckbox,idNumberCheckbox];

// if the id or id number checkbox is clicked then i wont want to search by any other field,
// therefore this function disables the other fields if the id or the id number checkbox is checked
[idCheckbox,idNumberCheckbox].forEach(checkbox=>{
    checkbox.addEventListener('click',function(){
        if (this.id === "id"){
            const tempCheckboxArr = [...checkboxArr].slice(1)
            const tempInputArr = [...inputsArr].slice(1)
            disableElements(idCheckbox,tempCheckboxArr,tempInputArr)
        }else{
            const tempCheckboxArr = [...checkboxArr].slice(0,-1)
            const tempInputArr = [...inputsArr].slice(0,-1)
            disableElements(idNumberCheckbox,tempCheckboxArr,tempInputArr)
        }
    })
})

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
    const idNumber = assignVariables(idNumberInput,idNumberCheckbox)
    const tempArr = [id,firstName,lastName,middleName,idNumber]

// makes sure that atleast one checkbox and input field is filled and returns an error if not
    for (let i = 0;i < tempArr.length;i++) {
        if (tempArr[i] !== null)break
        else if (i === (tempArr.length - 1) && tempArr[i] === null){
            errorTag.innerHTML = errorMsg
            return
        }
    }

    const results = await findWorker(id,firstName,lastName,middleName,idNumber)
    if (Object.keys(results).includes("error")){
        console.log(results)
        errorTag.innerHTML = results.error
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