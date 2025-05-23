const locationDiv = document.getElementById("add-location-div")
const input = document.getElementById("location-input")
const editLocationDiv = document.getElementById("edit-location-div")

export const toogleStates = {
    "find-location":false,
    "add-location":false
}

export function toogleDiv(btnId){
    editLocationDiv.classList.add("specified-hidden")
    if (btnId === "find-location"){
        if(toogleStates["add-location"]){
            toogleStates["add-location"] = false
        }
    }
    else {
        if(toogleStates["find-location"]){
            toogleStates["find-location"] = false
        }
    }
    toogleStates[btnId] = !toogleStates[btnId]
    if (!toogleStates["find-location"] && !toogleStates["add-location"]){
        locationDiv.classList.add("specified-hidden")
    }else{
        locationDiv.classList.remove("specified-hidden")
    }
    input.value = ""
}

export function toogleEditDiv(){
    console.log("passed here")
    toogleStates["add-location"] = false
    toogleStates["find-location"] = false

    locationDiv.classList.add("specified-hidden")

    if(editLocationDiv.classList.contains("specified-hidden")){
        editLocationDiv.classList.remove("specified-hidden")
    }else{
        editLocationDiv.classList.add("specified-hidden")
    }
}