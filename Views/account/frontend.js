const editOptions = document.getElementById("edit-options-container")

const newPassword = document.getElementById("new-password")
const confirmPasswordLabel = document.getElementById("confirmation-label")
const confirmPasswordInput = document.getElementById("confirm-password")
newPassword.addEventListener("input",()=>{

    if(newPassword.value.trim()!== ""){
        confirmPasswordLabel.classList.remove("hidden")
    }else{
        confirmPasswordInput.value = ""
        confirmPasswordLabel.classList.add("hidden")
    }
})

export function toggleContainer(check=false){
    if (check && editOptions.classList.contains("hidden")){
        editOptions.classList.remove("hidden")
    }else{
        editOptions.classList.add('hidden')
    }
}