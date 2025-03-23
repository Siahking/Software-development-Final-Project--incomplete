import * as apiFuncs from "../backend.js"

const errorTag = document.getElementById("error-tag")
const input = document.getElementById("location-input")
const list = document.getElementById("list");
const locationsErrorTag = document.getElementById("locations-error-tag")

const valueCheck = ()=>{
    if (!input.value){
        errorTag.innerHTML = "Please insert a valid search param"
        return false
    }
    return true
}

export async function loadLocations(){
    const locations = await apiFuncs.getLocations();

    if (Object.keys(locations).includes("error")){
        locationsErrorTag.classList.remove("hidden")
        return
    }
    
    locations.forEach(data=>{
        const listItem = document.createElement("li")
        const text = document.createTextNode(data.location)

        const deleteBtn = document.createElement("button")
        deleteBtn.innerHTML = "Delete"
        deleteBtn.value = data.id
        deleteBtn.id = `delete-${data.id}`

        deleteBtn.addEventListener("click",(event)=>
            deleteLocation(event.target.value)
        )

        listItem.appendChild(text)
        listItem.appendChild(deleteBtn)

        list.appendChild(listItem)
    })
}

export async function deleteLocation(id){
    const result = await apiFuncs.removeEntry(id,"locations")
    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
    }else{
        sessionStorage.setItem("Message",result.message)
        window.location.href = "/"
    }
}

export async function newLocation(){
    if (!valueCheck())return false
    const result = await apiFuncs.addLocation(input.value)
    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
    }else{
        sessionStorage.setItem("Message",result.message)
        window.location.href = "/"
    }
}

export async function findlocation(){
    if (!valueCheck())return false
    const results = await apiFuncs.findLocation("location",input.value)
    if (Object.keys(results).includes("error")){
        errorTag.innerHTML = results.error
        return
    }
    localStorage.setItem("locationsData",JSON.stringify(results))
    window.location.href = "/find-locations"
}