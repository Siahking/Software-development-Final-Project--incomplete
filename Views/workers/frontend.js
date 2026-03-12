const idCheckbox = document.getElementById("id")
const firstNameCheckbox = document.getElementById("first-name")
const lastNameCheckbox = document.getElementById("last-name")
const middleNameCheckbox = document.getElementById("middle-name")
const idNumberCheckbox = document.getElementById("id-number")
const idInput = document.getElementById("id-input")
const firstNameInput =  document.getElementById("first-name-input")
const lastNameInput =  document.getElementById("last-name-input")
const middleNameInput =  document.getElementById("middle-name-input")
const hoursDiv = document.getElementById("hours-div")
const hoursOptions = document.getElementsByClassName("hours-options")
const hoursContainer = document.getElementById("hours-container")

const unimportantCheckboxArr =[firstNameCheckbox,lastNameCheckbox,middleNameCheckbox]
const unimportantInputArr = [firstNameInput,lastNameInput,middleNameInput]
const fieldsArr = ['id','first-name','middle-name','last-name','id-number']

const editIdArray = [
    "newFirstName","newLastName","newMiddleName","newAddress","newContact","newIdNumber","newAvailability","newGender"
]

const availabilityOptions = document.querySelectorAll('[name="edit-availability"]')

availabilityOptions.forEach(option=>{
    option.addEventListener("click",()=>{
        if (option.id === "specified-availability"){
            hoursContainer.classList.remove("hidden")
        }else{
            hoursContainer.classList.add("hidden")
        }
    })
})

editIdArray.forEach(inputId=>{
    toogleEditCheckboxes(inputId)
})

for (const field of fieldsArr){
    const checkbox = document.getElementById(field)
    const input = document.getElementById(`${field}-input`)
    checkbox.addEventListener("click",()=>
        toogleInputs(checkbox,input)
    )
}

function toogleInputs(checkbox,input){
    if (checkbox.id === "id" || checkbox.id === 'id-number'){
        let otherCheckbox,otherInput
        if (checkbox.id === "id"){
            otherCheckbox = idNumberCheckbox
            otherInput = idInput
        }else{
            otherCheckbox = idCheckbox
            otherInput = idInput
        }
        if (checkbox.checked){
            for (const value of [...unimportantCheckboxArr,otherCheckbox]){
                value.setAttribute("disabled","true")
                value.checked = false
            }
            for (const item of [...unimportantInputArr,otherInput]){
                item.value = ""
                item.classList.add("hidden")
            }
            input.classList.remove("hidden")
        }else{
            for (const checkbox of [...unimportantCheckboxArr,otherCheckbox]){
                checkbox.removeAttribute('disabled')
            }
            input.classList.add("hidden")
        }
        
    }else if (checkbox.checked){
        input.classList.remove("hidden")
    }else{
        input.classList.add("hidden")
        input.innerText = ""
    }
}

export function toogleDisplay(div,otherDivs=""){
    if (div.classList.contains("hidden")){
        div.classList.remove("hidden")
        if (otherDivs){
            otherDivs.forEach(div => {
                div.classList.add("hidden")
            });

            div.scrollIntoView({
                behavior:"smooth",
                block:"start"
            })
        }
    }else{
        div.classList.add("hidden")
    }
}

export function displayHours(event){
    if (event.target.id === "specified-option"){
        hoursDiv.classList.remove("hidden")
    }else{
        hoursDiv.classList.add("hidden")
        for (const checkbox of hoursOptions){
            checkbox.checked = false
        }
    }
}

function toogleEditCheckboxes(Id){
    const checkbox = document.getElementById(Id + "Checkbox")
    let toogleItem
    if (Id === "newAvailability"){
        toogleItem = document.getElementById("availabilities-container")
    }else{
        toogleItem = document.getElementById(Id)
    }

    checkbox.addEventListener("click",()=>{
        if (checkbox.checked){
            toogleItem.classList.remove("hidden")
        }else{
            toogleItem.classList.add("hidden")
            if (checkbox.id === "newAvailabilityCheckbox"){
                hoursContainer.classList.add("hidden")
                availabilityOptions.forEach(option=>{
                    option.checked = false
                })
            }
        }
    })
}