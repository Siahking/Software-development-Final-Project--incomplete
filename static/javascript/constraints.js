import { editConstraints } from "./backend.js"

const errorTag = document.getElementById("error-tag")

window.addEventListener("DOMContentLoaded", async function () {
    const worker1Data = JSON.parse(localStorage.getItem("worker1Data"))
    const worker2Data = JSON.parse(localStorage.getItem("worker2Data"))
    const notes = JSON.parse(localStorage.getItem("notes"))

    const notesTextarea = document.getElementById("notes")
    notesTextarea.innerHTML = notes

    const worker1Table = document.getElementById("worker1-table")
    const worker2Table = document.getElementById("worker2-table")

    for (const data of worker1Data){
        const worker1Row = document.createElement("tr")
        const firstName = document.createElement("td")
        const middleName = document.createElement("td")
        const lastName = document.createElement("td")
        const location = document.createElement("td")
        const radioInput = document.createElement("input")
        const label = document.createElement("label")
        const radioId = `worker1-${data.id}`

        firstName.innerHTML = data.first_name
        lastName.innerHTML = data.last_name
        middleName.innerHTML = data.middle_name ? data.middleName : "Null"
        location.innerHTML = data.location

        radioInput.setAttribute("id",radioId)
        radioInput.setAttribute("type","radio")
        radioInput.setAttribute("value",data.id)
        radioInput.setAttribute("name","worker1-option")

        label.setAttribute("for",radioId)
        label.innerHTML = "Select"
        label.appendChild(radioInput)

        const arr = [firstName,middleName,lastName,location,label]

        for (const element of arr){
            worker1Row.appendChild(element)
        };
        worker1Table.appendChild(worker1Row)
    }

    for (const data of worker2Data){
        const worker2Row = document.createElement("tr")
        const firstName = document.createElement("td")
        const middleName = document.createElement("td")
        const lastName = document.createElement("td")
        const location = document.createElement("td")
        const radioInput = document.createElement("input")
        const label = document.createElement("label")
        const radioId = `worker2-${data.id}`

        firstName.innerHTML = data.first_name
        lastName.innerHTML = data.last_name
        middleName.innerHTML = data.middle_name ? data.middleName : "Null"
        location.innerHTML = data.location

        radioInput.setAttribute("id",radioId)
        radioInput.setAttribute("type","radio")
        radioInput.setAttribute("value",data.id)
        radioInput.setAttribute("name","worker2-option")

        label.setAttribute("for",radioId)
        label.innerHTML = "Select"
        label.appendChild(radioInput)

        const arr = [firstName,middleName,lastName,location,label]

        for (const element of arr){
            worker2Row.appendChild(element)
        };
        worker2Table.appendChild(worker2Row)
    }
})

document.getElementById("form").addEventListener("submit",async function(event){

    event.preventDefault()

    const inputTags = document.querySelectorAll("input")
    const notes = document.getElementById("notes").value

    let worker1,worker2

    for (const input of inputTags){
        if (input.checked){
            if (input.name === "worker1-option"){
                worker1 = parseInt(input.value)
            }else{
                worker2 = parseInt(input.value)
            }
        }
    }

    console.log(`Worker1 is ${worker1}`)
    console.log(`Worker2 is ${worker2}`)
    console.log(`notes is ${notes}`)

    const results = await editConstraints(worker1,worker2,notes,"add")
    console.log(results)

    if (Object.keys(results).includes("error")){
        errorTag.innerHTML = results.error
        return
    }else{
        sessionStorage.setItem("Message",results.message)
        window.location.href = "/";
    }
})