const locationDiv = document.getElementById("add-location-div")
const input = document.getElementById("location-input")

export const toogleStates = {
    "find-location":false,
    "add-location":false
}

export function toogleDiv(btnId){
    if (toogleStates["find-location"] || toogleStates["add-location"]){
        locationDiv.classList.add("hidden")
        toogleStates["find-location"] = false
        toogleStates["add-location"] = false
        input.value = ""
    }else{
        locationDiv.classList.remove("hidden")
        toogleStates[btnId] = true
    }
}