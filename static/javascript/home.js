import { findWorker,findLocation,getWorkers,addLocation,addWorker } from "./backend.js";

//search and remove workers logic
let removeWorkerBtnActive,removeLocation = false
const messageTag = document.getElementById("message")
const errorTag = document.getElementById("error-tag")
const searchDiv = document.getElementById("find-workers-div")
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
const hideButtons = ['add-worker','add-location','remove-worker','find-worker','remove-location']
const inputDivIdArr = ['add-location-div','add-worker-div','find-worker-div']
const checkboxArr = [idCheckbox,firstNameCheckbox,lastNameCheckbox,middleNameCheckbox,idNumberCheckbox]
const inputsArr = [idInput,firstNameInput,lastNameInput,middleNameInput,idNumberInput]

//general functions
function disableElements(checkbox,checkboxArr,inputsArr){
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

hideButtons.forEach(id=>{
    const btn = document.getElementById(id)
    let divId;
    if (id === "remove-worker"){
        removeWorkerBtnActive = !removeWorkerBtnActive
        divId = 'find-worker-div'
    }else if (id === "remove-location"){
        removeLocation = !removeLocation
        divId = 'add-location-div'
    }else{
        divId = id+"-div"
    }
    const btnDiv = document.getElementById(divId)
    btn.addEventListener('click',function(){
        if (btnDiv.classList.contains('hidden')){
            btnDiv.classList.remove('hidden')
        }else{
            btnDiv.classList.add('hidden')
        }
        const arr = []
        for (const arrId of inputDivIdArr){
            if (arrId !== divId){
                arr.push(arrId)
            }
        }
        arr.forEach(item=>{
            const currentDiv = document.getElementById(item)
            if (!currentDiv.classList.contains('hidden')){
                currentDiv.classList.add('hidden')
            }
        })

        const textInputs = document.querySelectorAll('input[type="text"]');
        textInputs.forEach(input=>input.value = "")

        errorTag.innerHTML = ""
        messageTag.innerHTML = ""
    })
})

//ADD OF REMOVE LOCATION//
document.getElementById('add-location-submit-btn').addEventListener('click',async function(){
    const locationInput = document.getElementById('location-input');
    const location = locationInput.value
    if (location === ""){
        errorTag.innerHTML = "Please insert a value into the search tag"
        return
    }
    const result = await findLocation(location)

    console.log(removeLocation)
    if (removeLocation){
        if (Object.keys(result).includes('error')){
            errorTag.innerHTML = "This location does not exist"
            return
        }else{
            const filteredLocations = await findLocation(location)
            localStorage.setItem("Locations",JSON.stringify(filteredLocations))
            window.location.href = "/remove-location"
        }
    }else{
        if (!Object.keys(result).includes('error')){
            errorTag.innerHTML = "This location already exists"
            return
        }

        const message = await addLocation(location)

        if (Object.keys(message).includes('error')){
            localStorage.setItem('Message',message.error)
        }else{
            localStorage.setItem("Message",message.message)
        }
    }

})

document.getElementById('add-worker-form').addEventListener("submit",async function(event){

    event.preventDefault()

    const firstName = document.getElementById('add-first-name-input').value
    const lastName = document.getElementById('add-last-name-input').value
    const middleName = document.getElementById('add-middle-name-input').value !== "" ? document.getElementById('add-middle-name-input').value : null;
    const gender = document.getElementById('add-gender-input').value !== "" ? document.getElementById('add-gender-input').value : null;
    const address = document.getElementById('add-address-input').value
    const contact = document.getElementById('add-contact-input').value !== "" ? document.getElementById('add-contact-input').value : null;
    const age = Number(document.getElementById('add-age-input').value)
    const idNumber = Number(document.getElementById('id-number-input').value)

    const searchResults = await findWorker(null,null,null,null,idNumber);
    if (!Object.keys(searchResults).includes('error')){
        errorTag.innerHTML = 'user already exists'
        return
    }

    const result = await addWorker(firstName,middleName,lastName,gender,
        address,contact,age,idNumber
    )

    if (Object.keys(result).includes('error')){
        messageTag.innerHTML = result.error
    }else{
        messageTag.innerHTML = result.message
    }
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

//Helper function to assign values to the variables based on the input of input fields and if the checkbox is checked
function assignVariables(input,checkbox){
    if (input.value !== "" && checkbox.checked) return input.value
    return null
}


// displaySearchDiv();
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
        errorTag.innerHTML = results.error
        return
    }
    localStorage.setItem("workerData", JSON.stringify(results));

// redirects the user to the search page or the remove worker page depending on which button is clicked
    window.location.reload()
    if (removeWorkerBtnActive){
        window.location.href = "/remove-worker";
    }else{
        window.location.href = "/worker-details";
    }
})

//add message from deleting worker
window.addEventListener("DOMContentLoaded",()=>{
    const message = sessionStorage.getItem("Message")

    if (message)
        messageTag.innerHTML = message
})