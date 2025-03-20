const locationDiv = document.getElementById("add-location-div")
const input = document.getElementById("location-input")

export const toogleStates = {
    "find-location":false,
    "add-location":false
}

export function toogleDiv(btnId){
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
        locationDiv.classList.add("hidden")
    }else{
        locationDiv.classList.remove("hidden")
    }
    input.value = ""
}