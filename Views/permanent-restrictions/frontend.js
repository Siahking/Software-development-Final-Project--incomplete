const findRestrictionDiv = document.getElementById("find-restriction-div")

const checkboxes = ["dayOfWeekCheckbox","newStartTimeCheckbox","newEndTimeCheckbox"]

checkboxes.forEach(id=>{
    const checkbox = document.getElementById(id)
    const dayRadioBtns = document.querySelectorAll('[name="newDay"]')

    checkbox.addEventListener("click",(event)=>{
        let toogleTagId
        switch (event.target.id){
            case "dayOfWeekCheckbox":
                toogleTagId = "dayOfWeekOptions"
                break
            case "newStartTimeCheckbox":
                toogleTagId = "newRestrictionStart"
                break
            case "newEndTimeCheckbox":
                toogleTagId = "newRestrictionEnd"
                break
        }

        const toogleTag = document.getElementById(toogleTagId)

        if (event.target.checked){
            toogleTag.classList.remove("specified-hidden")
        }else{
            toogleTag.classList.add("specified-hidden")
            if (event.target.id === "dayOfWeekCheckbox"){
                dayRadioBtns.forEach(btn => btn.checked = false);
            }
        }

    })
})

export function toogleRestrictonDivs(currentDiv,otherDiv){
    if (currentDiv.classList.contains("specified-hidden")){
        currentDiv.classList.remove("specified-hidden")
        otherDiv.forEach(div => div.classList.add("specified-hidden"));
    }else{
        currentDiv.classList.add("specified-hidden")
    }
}

