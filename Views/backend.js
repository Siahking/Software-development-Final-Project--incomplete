const BASEURL = "http://localhost:8080/"

async function apiRequest(endpoint, method = "GET", body = null){
    const url = `${BASEURL}${endpoint}`
    const options = {
        method,
        headers: { "Content-Type": "application/json" },
    };

    if (body){
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok){
            throw new Error(result?.error || `Error: ${response.status} ${response.statusText}`)
        }

        return result
    }catch(error) {
        return { error: error.message }
    }
}

export async function getLocations() {
    return apiRequest("locations")
};

export async function addLocation(locationName) {
    const url = `locations/${locationName}`
    return apiRequest(url,"POST")
};

export async function addWorker(first_name,middle_name,last_name,gender,address,contact,age,id_number,availability,hours){
    const neededValuesArr = [first_name,last_name,gender,address,age,id_number,availability,hours]
    for (const value of neededValuesArr){
        if (!value){
            return {"error":"Vacant input for required field"}
        }
    }

    return apiRequest("workers/add-worker","POST",{
        first_name,last_name,middle_name,gender,address,contact,age,id_number,availability,hours
    })
}

export async function findLocation(column,value){
    const url = `locations/${column}/${value}`
    return apiRequest(url)
}

export async function getWorkers(){
    return apiRequest("workers")
}

export async function findWorker(firstName="",lastName="",middleName="",idNumber="",id=null){
    const url = new URL(`${BASEURL}find-worker`)
    if (id) {
        url.searchParams.append("id",id)
    }else if(idNumber){
        url.searchParams.append("id_number",idNumber)
    }else{
        if (firstName) url.searchParams.append("first_name", firstName);
        if (lastName) url.searchParams.append("last_name", lastName);
        if (middleName) url.searchParams.append("middle_name", middleName);
    };

    const response = await fetch(url)
    const data = await response.json()

    return data
}

export async function removeEntry(id,table){
    if (!id || !table)return {"error":"ID and Table required"}
    const url = `delete/${table}/${id}`
    return apiRequest(url,"DELETE")
}

export async function linkWorkerLocations(workerId,locationId){
    const url = `assign-location/${workerId}/${locationId}`
    return apiRequest(url,"POST")
}

export async function workerLocationSearch(column,id){
    const url = `get-worker-location-connections/${column}/${id}`
    return apiRequest(url)
}

export async function removeConnections(column,id){
    const url = `remove-connection/${column}/${id}`
    return apiRequest(url,"DELETE")
}

export async function createConstraint(worker1IdStr,worker2IdStr,note=""){
    let worker1_id,worker2_id
    try{
        worker1_id = parseInt(worker1IdStr)
        worker2_id = parseInt(worker2IdStr)
    }catch{
        return "Please Insert Valid Values" 
    }

    return apiRequest("create-constraint","POST",{
        worker1_id,worker2_id,note
    })
}

export async function getConstraints(
    id=null,worker1FirstName=null,worker1LastName=null,worker2FirstName=null,worker2LastName=null
){ //complete
    let result
    const url = new URL(`${BASEURL}find-constraints`)
    // if (id || worker1 || worker2){
    if (id){
        url.searchParams.append("id",id)
    }else {
        if (worker1FirstName){
            if (!worker1LastName)return {"error":"Both the firstname and the lastname is required"}
            url.searchParams.append("worker1_firstname",worker1FirstName)
            url.searchParams.append("worker1_lastname",worker1LastName)
        }
        if (worker2FirstName){
            if (!worker1LastName)return {"error":"Both the firstname and the lastname is required"}
            url.searchParams.append("worker2_firstname",worker2FirstName)
            url.searchParams.append("worker2_lastname",worker2LastName)
        }
    }
    result = await fetch(url)
    const data = await result.json()

    return data
}

export async function editConstraints(id,worker1IdStr="",worker2IdStr="",note=""){ // working
    let worker1Id,worker2Id

    if (!id){
        return {"error":"Id required"}
    }    

    try{
        worker1Id = parseInt(worker1IdStr)
        worker2Id = parseInt(worker2IdStr)
    }catch{
        errorTag.innerText = "Invalid insertion values for input areas"
        return
    }

    const jsonValues = {}
    const inputValues = [
        {"worker1_id":worker1Id},
        {"worker2_id":worker2Id},
        {"note":note}
    ]

    for (const param of inputValues){
        for (const key in param){
            if (param[key]){
                jsonValues[key] = param[key]
            }
        }
    }

    const url = `edit-constraints/${id}`
    return apiRequest(url,"PATCH",jsonValues)
}

export async function deleteConstraints(id){ //working
    if (!id)return {"error":"No parameter provided!"}

    const url = `delete-constraint/${id}`
    return apiRequest(url,"DELETE")
}

export async function addDaysOff(workerIdStr,start_date,end_date){ //working
    let worker_id
    try{
        worker_id = parseInt(workerIdStr)
    }catch{
        return {"error":"Invalid worker id input"}
    }
    return apiRequest("add-days-off","POST",{
        worker_id,start_date,end_date
    })
}

export async function getDaysOff(column="",value=""){ //working
    let url
    if (column && value){
        url = `${BASEURL}get-days-off/${column}/${value}`
    }else{
        url = `${BASEURL}get-days-off`
    }

    const results = await fetch(url)
    const data = await results.json()

    return data
}

export async function removeDaysOff(breakId){ //complete
    const url = `remove-days/${breakId}`

    if (!breakId){
        return {"error":"Id required"}
    }

    return apiRequest(url,"DELETE")
}

export async function createRestriction(worker_id,day_of_week,start_time,end_time){
    try{
        worker_id = parseInt(worker_id)
    }catch{
        return {"error":"Please provide a valid worker id"}
    }
    if (!day_of_week){
        day_of_week = "Any"
    }

    return apiRequest("create-restriction","POST",{
        worker_id,day_of_week,start_time,end_time
    })
}

export async function getPermanentRestrictions(){
    return apiRequest("get-restrictions")
}

export async function findPermanentRestrictions(column,id) {
    if (!column || !id){
        return {"error":"Please insert valid values"}
    }

    const url = `find-restriction/${column}/${id}`
    return apiRequest(url)
}

export async function deletePermanentRestrictions(id){
    if (!id){
        return {"error":"Please insert a valid id"}
    }

    const url = `delete-restriction/${id}`
    return apiRequest(url,"DELETE")
}

export async function retrieveWorkerOrLocations(column,id){
    const url = `retrieve-workers-locations/${column}/${id}`
    return apiRequest(url)
}

export async function createOccupancy(worker_id,event_date,note){
    if (!worker_id || !event_date){
        return{"error":"Invalid Params"}
    }

    return apiRequest("create-occupancy","POST",{
        worker_id,event_date,note
    })
}

export async function retrieveOccupancies(column="",value=""){
    let url
    if (!column && !value){
        url = `retrieve-occupancies`
    }else{
        url = `retrieve-occupancies/${column}/${value}`
    }

    return apiRequest(url)
}

export async function removeOccupancy(id){
    if (!id)return {"error":"Please insert a valid ID"}

    return apiRequest(`delete-occupancy/${id}`,"DELETE")
}

export async function clearOccupancies(){
    return apiRequest("clear-occupancies","DELETE")
}

// async function tester() {
//     const result = await getConstraints("","william","evans","sophia","brown")
//     console.log(result)
// }

// tester()