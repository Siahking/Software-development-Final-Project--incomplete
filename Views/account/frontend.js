const editOptions = document.getElementById("edit-options-container")

export function toggleContainer(check=false){
    if (check && editOptions.classList.contains("hidden")){
        editOptions.classList.remove("hidden")
    }else{
        editOptions.classList.add('hidden')
    }
}