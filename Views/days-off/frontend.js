const valueLabel = document.getElementById("value-label")

export function toogleDivs(currentDiv,otherDiv){
    if (currentDiv.classList.contains("specified-hidden")){
        currentDiv.classList.remove("specified-hidden")
        otherDiv.classList.add("specified-hidden")
    }else{
        currentDiv.classList.add("specified-hidden")
    }
}

export function toogleCheckboxes(event){
    if (event.target.checked){
        valueLabel.classList.remove("specified-hidden")
    }else{
        valueLabel.classList.add("specified-hidden")
    }

}