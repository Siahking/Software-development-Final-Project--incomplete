export const toogleStates = {
    addWorkerState:false,
    addLocationState:false,
    removeWorkerState:false,
    removeLocationState:false
}

function toogleStateFunc(value){
    const keys = Object.keys(toogleStates)
    keys.forEach((key)=>{
        if (key === value){
            toogleStates[key] = !toogleStates[key]
        }else{
            toogleStates[key] = false
        }
    })
}

export function toogleCheckboxes(array){
    array.forEach((element)=>{
        const inputField = document.getElementById(element.id + "-input")
        element.addEventListener("click",function(){
            if (this.checked){
                inputField.classList.remove("hidden");
            }else{
                inputField.classList.add("hidden");
                inputField.value = ""
            }
        })
    })
}

export function hideShowButton(errorTag,messageTag,id,divId,btnDiv,inputDivIdArr){
    switch (id){
        case "remove-worker":
            toogleStateFunc("removeWorkerState")
            break
        case "remove-location":
            toogleStateFunc("removeLocationState")
            break
        case "add-location":
            toogleStateFunc("addLocationState")
            break
        case "add-worker":
            toogleStateFunc("addWorkerState")
            break
        default:
            console.log("Unknown id")
    }

    if (btnDiv.classList.contains('hidden')){
        btnDiv.classList.remove('hidden')
    }else{
        btnDiv.classList.add('hidden')
    }

    const arr = []
    for (const arrId of inputDivIdArr){
        if (arrId !== divId){
            arr.push(arrId)
        }
    }
    arr.forEach(item=>{
        const currentDiv = document.getElementById(item)
        if (!currentDiv.classList.contains('hidden')){
            currentDiv.classList.add('hidden')
        }
    })

    const textInputs = document.querySelectorAll('input[type="text"]');
    textInputs.forEach(input=>input.value = "")

    errorTag.innerHTML = ""
    messageTag.innerHTML = ""
}