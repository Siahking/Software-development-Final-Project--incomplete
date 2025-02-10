let removeWorkerBtnActive,removeLocationActive = false

export function toogleCheckboxes(array){
    array.forEach((element)=>{
        const inputField = document.getElementById(element.id + "-input")
        element.addEventListener("click",function(){
            console.log('passed here')
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
    console.log('interactivity working')
    if (id === "remove-worker"){
        removeWorkerBtnActive = !removeWorkerBtnActive
        removeLocationActive = false
    }else if(id === "remove-location"){
        removeLocationActive = !removeLocationActive
        removeWorkerBtnActive = false
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