import { 
    getWorkers, workerLocationSearch,findLocation,getLocations,addWorker,findWorker,linkWorkerLocations,removeEntry
} from "../../static/javascript/backend.js";

const tableHeadArray = ["ID","FirstName","LastName","MiddleName","Gender","Address","Contact","Age","Id Number","Locations"]
const table = document.getElementById("table");
const firstRow = document.createElement("tr");
const showLocationsDiv = document.getElementById('locations-input')
const errorTag = document.getElementById('error-tag')
const idInput = document.getElementById("id-input")
const firstNameInput =  document.getElementById("first-name-input")
const lastNameInput =  document.getElementById("last-name-input")
const middleNameInput =  document.getElementById("middle-name-input")
const idNumberInput = document.getElementById("id-number-input")

tableHeadArray.forEach((item) => {
    const tableHead = document.createElement("th")
    tableHead.innerHTML = item;
    firstRow.appendChild(tableHead);
})
table.appendChild(firstRow)

export async function displayLocations(){
    const locations = await getLocations();
    
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
    const workers = await getWorkers();

    for (const worker of workers){
        const workerArr = [
            worker.id,worker.first_name,worker.last_name,worker.middle_name,
            worker.gender,worker.address,worker.contact,worker.age,worker.id_number
        ]

        const tableRow = document.createElement("tr")

        for (const field of workerArr){
            const tableData = document.createElement("td")
            if (field){
                tableData.innerHTML = field
            }else{
                tableData.innerHTML = "Null"
            }
            tableRow.append(tableData)
        }
        const locationsRow = document.createElement("td")
        const locationsResults = await workerLocationSearch("worker_id",worker.id)

        if (!Object.keys(locationsResults).includes('Error')){
            const tempArr = []
            for (const location of locationsResults){
                const locationInfo = await findLocation("id",location.location_id)
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
    const result = await addWorker(firstName,middleName,lastName,gender,address,contact,age,idNumber)
    const selectedLocations = []

    if (Object.keys(result).includes("error")){
        errorTag.innerHTML = result.error
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
        const newWorker = await findWorker("","","",idNumber)
        const newWorkerId = newWorker[0].id
        selectedLocations.forEach((location)=>{
            linkWorkerLocations(newWorkerId,location.id)
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
        errorTag.innerHTML = "Please Fillout atleast one field to search for workers"
        return
    }

    const results = await findWorker(firstName,lastName,middleName,idNumber,id)
    if (Object.keys(results).includes("error")){
        errorTag.innerHTML = results.error
        return
    }

    localStorage.setItem("workerData",JSON.stringify(results))
    window.location.href = "/worker-details"
}

export async function deleteWorker(event){
    const workerId = event.target.value
    const worker = await findWorker("","","","",workerId)
    const firstName = worker[0].first_name
    const lastName = worker[0].last_name
    
    const confirmation = confirm(`Are you sure you want to delete ${firstName} ${lastName} ?`)
    if (confirmation){
        const result = await removeEntry(workerId,"workers")
        sessionStorage.setItem("Message",result.message)
        window.location.href = '/'
    }else{
        errorTag.innerHTML = "Failed to delete worker"
    }
}

