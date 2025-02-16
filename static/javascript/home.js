import { findWorker,findLocation,addLocation,addWorker, getLocations,linkWorkerLocations, getWorkers } from "./backend.js";
import init from "../../views/home/home-init.js"
import * as interactivity from "../../views/home/home-frontend.js"
import * as homeFunctions from "../../views/home/home-functions.js"
import * as general from "./general-functions.js"

//search and remove workers logic
let gotLocations = false
export let removeWorkerBtnActive,removeLocationActive = false
const messageTag = document.getElementById("message")
export const errorTag = document.getElementById("error-tag")
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

const selectedLocations = [];

//toogles between showing the input fields for each checkbox if the checkbox is clicked or not
interactivity.toogleCheckboxes(checkboxArr)

init()

//ADD WORKER FUNCTION//
document.getElementById('add-worker-form').addEventListener("submit",async function(event){

    event.preventDefault()

    const firstName = document.getElementById('add-first-name-input').value
    const lastName = document.getElementById('add-last-name-input').value
    const middleName = document.getElementById('add-middle-name-input').value !== "" ? document.getElementById('add-middle-name-input').value : null;
    const gender = document.getElementById('add-gender-input').value !== "" ? document.getElementById('add-gender-input').value : null;
    const address = document.getElementById('add-address-input').value
    const contact = document.getElementById('add-contact-input').value !== "" ? document.getElementById('add-contact-input').value : null;
    const age = Number(document.getElementById('add-age-input').value)
    const idNumber = Number(document.getElementById('add-id-number-input').value)

    const locationsArr = document.querySelectorAll(".location-check")
    locationsArr.forEach(location=>{
        if (location.checked){
            selectedLocations.push({id:location.id,location:location.value})
        };
    });

    const searchResults = await findWorker(null,null,null,null,idNumber);
    if (!Object.keys(searchResults).includes('error')){
        errorTag.innerHTML = 'user already exists'
        return
    }

    const result = await addWorker(firstName,middleName,lastName,gender,
        address,contact,age,idNumber
    )

    //duplicate search (TODO) create a function to decrease repitition
    if (selectedLocations.length > 0){
        const newSearch = await findWorker(null,null,null,null,idNumber);
        const idToJoin = newSearch[0].id
        selectedLocations.forEach(object=>{
            linkWorkerLocations(idToJoin,object.id)
        })
    }

    if (Object.keys(result).includes('error')){
        if (result.error.includes('500')){
            sessionStorage.setItem("Message","Empty ID Number Input")
        }
        else{
            sessionStorage.setItem("Message","User with the ID Already exists")
        }
        sessionStorage.setItem("Message",result.error)
    }else{
        sessionStorage.setItem("Message",result.message)
    }

    // window.location.href = '/'
})

//logic for button inside the add-worker div to display existent locations so that a worker can be assigned to locations on assignments
document.getElementById("toogle-btn").addEventListener('click',async function(event){
    event.preventDefault()

    const locationsDiv = document.getElementById("locations-input")
    locationsDiv.classList.contains("hidden")
    ? locationsDiv.classList.remove("hidden")
    : locationsDiv.classList.add("hidden")

    if (!gotLocations){
        if (!locationsDiv.classList.contains("hidden")){
            const locations = await getLocations();

            if (!locations){
                locationsDiv.innerHTML = "No Locations Found"
                return
            }

            locations.forEach(location=>{
                const label = document.createElement("label")
                const input = document.createElement("input")
                const span = document.createElement("span")

                span.innerHTML = location.location

                input.id = location.id
                input.value = location.location
                input.type = "checkbox"
                input.className = "location-check"

                label.for = location.id
                label.appendChild(input)
                label.appendChild(span)

                locationsDiv.appendChild(label)
            })
        }
        gotLocations = true
    }
});

// if the id or id number checkbox is clicked then i wont want to search by any other field,
// therefore this function disables the other fields if the id or the id number checkbox is checked
for (const checkbox of [idCheckbox,idNumberCheckbox]){
    checkbox.addEventListener('click',function(){
        if (this.id === "id"){
            const tempCheckboxArr = [...checkboxArr].slice(1)
            const tempInputArr = [...inputsArr].slice(1)
            general.disableElements(idCheckbox,tempCheckboxArr,tempInputArr)
        }else{
            const tempCheckboxArr = [...checkboxArr].slice(0,-1)
            const tempInputArr = [...inputsArr].slice(0,-1)
            general.disableElements(idNumberCheckbox,tempCheckboxArr,tempInputArr)
        }
    })
}

//Helper function to assign values to the variables based on the input of input fields and if the checkbox is checked
function assignVariables(input,checkbox){
    if (input.value !== "" && checkbox.checked) return input.value
    return null
}


// WORKER SEARCH FUNCTION
document.getElementById("workerSearchForm").addEventListener("submit",async function (event){

    event.preventDefault()

    const errorMsg = "Please make sure to check a box and fill out the input field before submitting the form"
    const id = assignVariables(idInput,idCheckbox)
    const firstName = assignVariables(firstNameInput,firstNameCheckbox)
    const lastName = assignVariables(lastNameInput,lastNameCheckbox)
    const middleName = assignVariables(middleNameInput,middleNameCheckbox)
    const searchIdNumber = assignVariables(idNumberInput,idNumberCheckbox)
    const tempArr = [id,firstName,lastName,middleName,searchIdNumber]

// makes sure that atleast one checkbox and input field is filled and returns an error if not
    for (let i = 0;i < tempArr.length;i++) {
        if (tempArr[i] !== null)break
        else if (i === (tempArr.length - 1) && tempArr[i] === null){
            errorTag.innerHTML = errorMsg
            return
        }
    }

    console.log([firstName,lastName,middleName])

    const results = await findWorker(firstName,lastName,middleName,searchIdNumber,id)
    if (Object.keys(results).includes("error")){
        errorTag.innerHTML = results.error
        return
    }
    localStorage.setItem("workerData", JSON.stringify(results));

// redirects the user to the search page or the remove worker page depending on which button is clicked
    if (removeWorkerBtnActive){
        window.location.href = "/remove-worker";
    }else{
        window.location.href = "/worker-details";
    }
})

//ADD CONSTRAINT FUNCTION
document.getElementById("constraint-form").addEventListener("submit",async function(event){

    event.preventDefault()

    const w1FirstName = document.getElementById("w1firstname").value
    const w1LastName = document.getElementById("w1lastname").value
    const w2FirstName = document.getElementById("w2firstname").value
    const w2LastName = document.getElementById("w2lastname").value
    const notesValue = document.getElementById("notes").value
    let worker1Results,worker2Results

    const buttonClick = event.submitter.id

    const notes = notesValue ? notesValue : "Personal Issues"

    console.log(buttonClick === 'find-constraint')

    if (buttonClick === 'find-constraint'){
        const check = general.checkContraintsInput(w1FirstName,w1LastName,w2FirstName,w2LastName)
        let worker1Result,worker2Result = ''

        switch (check){
            case 'both workers':
                worker1Result = await findWorker(w1FirstName,w1LastName)
                worker2Result = await findWorker(w2FirstName,w2LastName)
                break;
            case 'worker one' || 'worker two':
                if (check === 'worker one'){
                    worker1Result = await findWorker(w1FirstName,w1LastName)
                }else{
                    worker1Result = await findWorker(w2FirstName,w2LastName)
                }
                break;
            default:
                worker1Result = await getWorkers()
                console.log(worker1Result)
                return
        }

        localStorage.setItem("worker1Data",JSON.stringify(worker1Result))
        localStorage.setItem("worker2Data",JSON.stringify(worker2Result))
        localStorage.setItem("notes",notes)
        localStorage.setItem("buttonClicked",buttonClick)

        window.location.href = "/constraints"
        return    
    }

    console.log(!worker1EntryCheck )

    // if (!worker1EntryCheck && !worker2EntryCheck){
    //     if (buttonClick === 'find-constraint' || buttonClick === 'delete-constraint'){

    //         console.log('passed here')
    //         const searchWorker1Firstname = w1FirstName ? w1FirstName : ""
    //         const searchWorker1Lastname = w1LastName ? w1LastName : ""
    //         const searchWorker2Firstname = w2FirstName ? w2FirstName : ""
    //         const searchWorker2Lastname = w2LastName ? w2LastName : ""

    //         worker1Results = findWorker(searchWorker1Firstname,searchWorker1Lastname)
    //         worker2Results = findWorker(searchWorker2Firstname,searchWorker2Lastname)
    //     }else{
    //         errorTag.innerHTML = "Please insert values to search"
    //         return
    //     }
    // }else{
    //     worker1Results = await findWorker(w1FirstName,w1LastName)
    //     worker2Results = await findWorker(w2FirstName,w2LastName)
    // }

    // for (const value of [worker1Results,worker2Results]){
    //     if (Object.keys(value).includes("error")){
    //         errorTag.innerHTML = value.error
    //         return
    //     }
    // }

    // localStorage.setItem("worker1Data",JSON.stringify(worker1Results))
    // localStorage.setItem("worker2Data",JSON.stringify(worker2Results))
    // localStorage.setItem("notes",notes)
    // localStorage.setItem("buttonClicked",buttonClick)

    // window.location.href = "/constraints";
})

//add message to the main div
window.addEventListener("DOMContentLoaded",()=>{
    const message = sessionStorage.getItem("Message")

    errorTag.innerHTML = ""

    if (message)
        messageTag.innerHTML = message
        sessionStorage.removeItem("Message")
        localStorage.removeItem("Message")
})