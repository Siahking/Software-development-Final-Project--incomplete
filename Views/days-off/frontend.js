const valueLabel = document.getElementById("value-label")

const editChecboxIds = ["newWorkerId","newStartTime","newEndTime"]

editChecboxIds.forEach(id=>{
    const checkbox = document.getElementById(id)
    const input = document.getElementById(id+ "-value")

    checkbox.addEventListener("click",(event)=>{
        if (event.target.checked){
            input.classList.remove("specified-hidden")
        }else{
            input.classList.add("specified-hidden")
        }
    })
})

export function toogleDivs(currentDiv,otherDivs){
    if (currentDiv.classList.contains("specified-hidden")){
        currentDiv.classList.remove("specified-hidden")
        otherDivs.forEach(div => {
            div.classList.add("specified-hidden")
        });
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

export function toogleEditDivs(){

}