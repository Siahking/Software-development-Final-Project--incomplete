const findRestrictionDiv = document.getElementById("find-restriction-div")

export function toogleRestrictonDivs(currentDiv,otherDiv){
    if (currentDiv.classList.contains("hidden")){
        currentDiv.classList.remove("hidden")
        otherDiv.classList.add("hidden")
    }else{
        currentDiv.classList.add("hidden")
    }
}

