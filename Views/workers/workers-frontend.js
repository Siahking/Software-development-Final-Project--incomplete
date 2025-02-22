const showLocationsBtn = document.getElementById('toogle-btn')
const selectLocationsDiv = document.getElementById('locations-input')

showLocationsBtn.addEventListener("click",()=>{
    selectLocationsDiv
})

export function toogleDisplay(div){
    if (div.classList.contains("hidden")){
        div.classList.remove("hidden")
    }else{
        div.classList.add("hidden")
    }
}