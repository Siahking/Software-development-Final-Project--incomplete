import { removeEntry } from "./backend.js";

window.addEventListener("DOMContentLoaded",function(){
    const locationsData = JSON.parse(localStorage.getItem("Locations"))
    console.log(locationsData)
    const message = document.getElementById("messageTag")
    const list = document.getElementById('list')

    if (!locationsData){
        message.innerHTML = "No Locations found"
        return
    }

    locationsData.forEach(data=>{
        const li = document.createElement("li")
        const deleteBtn = document.createElement("button")

        li.innerHTML = data.location
        deleteBtn.id = data.id
        deleteBtn.innerText = "Delete Location"

        li.append(deleteBtn)

        list.append(li)
    })

    const buttons = document.querySelectorAll("button")

    buttons.forEach(button=>{
        button.addEventListener('click',async function(){
            const id = this.id

            const results = await removeEntry(id,'locations')
            if (Object.keys(results).includes('message')){
                localStorage.setItem("Message",results.message)
            }else{
                localStorage.setItem("Message",results.error)
            }
            window.location.href("/")
        })
    })
})