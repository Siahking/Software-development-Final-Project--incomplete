import * as apiFuncs from "../backend.js";

const tableHeadArray = ["ID","FirstName","LastName","MiddleName","Gender","Address",
                        "Contact","Age","Id Number","Availability","Hours","Locations"]

const table = document.getElementById("table");
const firstRow = document.createElement("tr");
const showLocationsDiv = document.getElementById('locations-input')
const errorTag = document.getElementById('error-tag')
const idInput = document.getElementById("id-input")
const firstNameInput =  document.getElementById("first-name-input")
const lastNameInput =  document.getElementById("last-name-input")
const middleNameInput =  document.getElementById("middle-name-input")
const idNumberInput = document.getElementById("id-number-input")

const availabilityOptions = document.querySelectorAll('input[name="availability"]')
const hoursOptions = document.querySelectorAll('.hours-options')

tableHeadArray.forEach((item) => {
    const tableHead = document.createElement("th")
    tableHead.innerHTML = item;
    firstRow.appendChild(tableHead);
})
table.appendChild(firstRow)

function assignHours(){
    let option
    const hours = []
    for (const value of availabilityOptions){
        if (value.checked){
            option = value
            break
        }
    }

    switch (option.value){
        case "Day":
            hours.push("6am-6pm","6am-2pm")
            break
        case "Night":
            hours.push("6pm-6am","10pm-6am")
            break
        case "Eclipse":
            hours.push("24hrs")
            break
        case "Specified":
            for(const hour of hoursOptions){
                if (hour.checked){
                    hours.push(hour.id)
                }
            }
            if (!hours.length){
                errorTag.innerText = "Need to select hours to work after selecting specified"
                return [false,[]]
            }
    }
    return [option.value,hours]
}

export async function displayLocations(){
    const locations = await apiFuncs.getLocations();
    
    if (!locations){
        showLocationsDiv.innerHTML = "No Locations Found"
    }

    locations.forEach(location=>{
        const label = document.createElement("label")
        const input = document.createElement("input")
        const span = document.createElement("span")

        span.innerHTML = location.location

        input.id = location.id
        input.value = location.location
        input.type = "checkbox"
        input.className = "location-check"

        label.for = location.id
        label.appendChild(input)
        label.appendChild(span)

        showLocationsDiv.appendChild(label)
    })
}

export async function showWorkers (){
    const workers = await apiFuncs.getWorkers();

    if (Object.keys(workers).includes("error")){
        errorTag.innerText = workers.error
        return
    }

    for (const worker of workers){
        const workerArr = [
            worker.id,worker.first_name,worker.last_name,worker.middle_name,
            worker.gender,worker.address,worker.contact,worker.age,worker.id_number,
            worker.availability,worker.hours
        ]

        const tableRow = document.createElement("tr")

        for (const [index,field] of workerArr.entries()){
            const tableData = document.createElement("td")
            if (field){
                tableData.innerHTML = field
            }else{
                tableData.innerHTML = "Null"
            }

            switch (index){
                case 5:
                    tableData.classList.add("addressClass")
                    break
                case 6:
                    tableData.classList.add("contactClass")
                    break
                case 9:
                    tableData.classList.add("availablityClass")
                    break
            }

            tableRow.append(tableData)
        }
        const locationsRow = document.createElement("td")
        const locationResults = await apiFuncs.workerLocationSearch("worker_id",worker.id)

        if (!Object.keys(locationResults).includes('error')){
            const tempArr = []
            for (const location of locationResults){
                const locationInfo = await apiFuncs.findLocation("id",location.location_id)
                const locationName = locationInfo[0].location
                tempArr.push(locationName)
            }
            locationsRow.innerHTML = tempArr.join(', ')
        }else{
            locationsRow.innerHTML = "Unassigned"
        }

        tableRow.appendChild(locationsRow)

        const deleteCell = document.createElement('td')
        const deleteBtn = document.createElement("button")
        deleteBtn.innerHTML = "Delete"
        deleteBtn.classList.add("delete-btn")
        deleteBtn.value = worker.id
        deleteBtn.setAttribute("name",`delete_id${worker.id}`)
        deleteBtn.addEventListener("click",(event)=>deleteWorker(event))

        deleteCell.appendChild(deleteBtn)

        tableRow.append(deleteCell)
        table.append(tableRow)
    }
}

export async function addWorkerHandler(event){

    event.preventDefault()

    const firstName = document.getElementById('add-first-name-input').value
    const lastName = document.getElementById('add-last-name-input').value
    const middleName = document.getElementById('add-middle-name-input').value !== "" ? document.getElementById('add-middle-name-input').value : null;
    const gender = document.getElementById('add-gender-input').value !== "" ? document.getElementById('add-gender-input').value : null;
    const address = document.getElementById('add-address-input').value
    const contact = document.getElementById('add-contact-input').value !== "" ? document.getElementById('add-contact-input').value : null;
    const age = Number(document.getElementById('add-age-input').value)
    const idNumber = Number(document.getElementById('add-id-number-input').value)
    const [availability,hours] = assignHours()
    if (!availability)return

    const result = await apiFuncs.addWorker(firstName,middleName,lastName,gender,address,contact,age,idNumber,availability,hours)
    const selectedLocations = []

    if (Object.keys(result).includes("error")){
        errorTag.innerText = result.error
        return
    }

    const locationsArr = document.querySelectorAll(".location-check")
    locationsArr.forEach(location=>{
        if (location.checked){
            selectedLocations.push({id:location.id,location:location.value})
        };
    });

    if (selectedLocations.length>0) {
        //find the worker using the idNumber then assign the worker to a location using worker and location id
        const newWorker = await apiFuncs.findWorker("","","",idNumber)
        const newWorkerId = newWorker[0].id
        selectedLocations.forEach((location)=>{
            apiFuncs.linkWorkerLocations(newWorkerId,location.id)
        })
    }    

    sessionStorage.setItem("Message",result.message)

    window.location.href = '/'
}

export async function findWorkers(event){

    event.preventDefault()

    const id = idInput.value || null
    const firstName = firstNameInput.value || null
    const lastName = lastNameInput.value || null
    const middleName = middleNameInput.value || null
    const idNumber = idNumberInput.value || null
    let emptyValues = false

    for (const value of [id,firstName,lastName,middleName,idNumber]){
        if (value){
            emptyValues = true
        }
    }

    if (!emptyValues){
        errorTag.innerText = "Please Fillout atleast one field to search for workers"
        return
    }

    const results = await apiFuncs.findWorker(firstName,lastName,middleName,idNumber,id)
    console.log(results)
    return
    if (Object.keys(results).includes("error")){
        console.log("passed here")
        errorTag.innerText = results.error
        return
    }

    localStorage.setItem("workerData",JSON.stringify(results))
    window.location.href = "/find-workers"
}

export async function deleteWorker(event){
    const workerId = event.target.value
    const worker = await apiFuncs.findWorker("","","","",workerId)
    const firstName = worker[0].first_name
    const lastName = worker[0].last_name
    
    const confirmation = confirm(`Are you sure you want to delete ${firstName} ${lastName} ?`)
    if (confirmation){
        const result = await apiFuncs.removeEntry(workerId,"workers")
        sessionStorage.setItem("Message",result.message)
        window.location.href = '/'
    }else{
        errorTag.innerText = "Failed to delete worker"
    }
}

