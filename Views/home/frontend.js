const rosterDiv = document.getElementById("roster-div")

export function toogleDiv(){
    if(rosterDiv.classList.contains("hidden")){
        rosterDiv.classList.remove("hidden")
        rosterDiv.classList.add("visible")
    }else{
        rosterDiv.classList.remove("visible")
        rosterDiv.classList.add("hidden")
    }
}