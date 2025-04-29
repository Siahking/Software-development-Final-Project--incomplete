//function which returns true if an object key includes error and false otherwise
export function objectCheck(object){
    if(Object.keys(object).includes("error"))return true
    return false
}

export function displayError(errorTagId,message){
    const errorTag = document.getElementById(errorTagId+"-tag")
    const errorContainer = document.getElementById(errorTagId+"-container")
    errorContainer.classList.remove("specified-hidden")
    errorTag.innerText = message
}

export function deleteConfirmation(item){
    const confirmation = confirm(`Are you sure you want to delete this ${item}? This action cannot be undone.`)
    return confirmation
}