import { removeEntry,addLocation,findLocation,getLocations } from "../../static/javascript/backend.js"

const errorTag = document.getElementById("error-tag")
const input = document.getElementById("location-input")
const list = document.getElementById("list");

const valueCheck = ()=>{
    if (!input.value){
        errorTag.innerHtml = "Please insert a valid value"
        return false
    }
    return true
}

export async function loadLocations(){
    const locations = await getLocations();
    
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
    console.log(id)
    const result = await removeEntry(id,"locations")
    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
    }else{
        sessionStorage.setItem("Message",result.message)
        window.location.href = "/"
    }
}

export async function newLocation(){
    if (!valueCheck())return false
    const result = await addLocation(input.value)
    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
    }else{
        sessionStorage.setItem("Message",result.message)
        window.location.href = "/"
    }
}

export async function findlocation(){
    console.log("passed here")
    if (!valueCheck())return false
    const results = await findLocation("location",input.value)
    if (Object.keys(results).includes("error")){
        errorTag.innerHTML = results.error
        return
    }
    localStorage.setItem("locationsData",JSON.stringify(results))
    window.location.href = "/find-locations"
}