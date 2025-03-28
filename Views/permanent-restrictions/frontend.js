const findRestrictionDiv = document.getElementById("find-restriction-div")

export function toogleRestrictonDivs(currentDiv,otherDiv){
    if (currentDiv.classList.contains("specified-hidden")){
        currentDiv.classList.remove("specified-hidden")
        otherDiv.classList.add("specified-hidden")
    }else{
        currentDiv.classList.add("specified-hidden")
    }
}

