const valueLabel = document.getElementById("value-label")

export function toogleDivs(currentDiv,otherDiv){
    if (currentDiv.classList.contains("hidden")){
        currentDiv.classList.remove("hidden")
        otherDiv.classList.add("hidden")
    }else{
        currentDiv.classList.add("hidden")
    }
}

export function toogleCheckboxes(event){
    if (event.target.checked){
        valueLabel.classList.remove("hidden")
    }else{
        valueLabel.classList.add("hidden")
    }

}