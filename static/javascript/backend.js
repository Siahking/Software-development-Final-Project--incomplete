export async function getLocations() {
    try{
        const data = await fetch("http://localhost:8080/locations")
        .then((data)=> data.json())
        .then((data) => data);
        return data
    }catch (error){
        console.error("Error fetching locations:",error);
    };
};

export async function addLocation(locationName) {
    try{
        const response = await fetch(`http://localhost:8080/locations/${locationName}`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            }
        })

        const result = await response.json()

        if (!response.ok){
            throw new Error(result.Error || `Error: ${response.status} ${response.statusText}`)
        }

        return result
    }catch(error){
        return {"error":error.message}
    }
};

export async function addWorker(first_name,middle_name,last_name,gender,address,contact,age,id_number){
    const neededValuesArr = [first_name,last_name,gender,address,age,id_number]
    for (const value of neededValuesArr){
        if (!value){
            return {"error":"Vacant input for required field"}
        }
    }
    try {

        const response = await fetch("http://localhost:8080/workers/add-worker",{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                first_name,
                last_name,
                middle_name,
                gender,
                address,
                contact,
                age,
                id_number
            })
        });

        const result = await response.json();

        if(!response.ok){
            throw new Error(result.Error ||`Error: ${response.status} ${response.statusText}`);
        }

        return result;
    }catch (error) {    
        return { error: error.message };
    }
}

export async function findLocation(column,value){
    const result = await fetch(`http://localhost:8080/locations/${column}/${value}`,{
        method: "GET"
    })
    const data = await result.json()
    return data
}

export async function getWorkers(){
    try{
        const workers = await fetch("http://localhost:8080/workers")
        .then((workers) => workers.json())
        .then((workers) => workers);
        return workers
    }catch(error){
        console.error("Error in getting the workers:",error)
    };
}

export async function findWorker(firstName="",lastName="",middleName="",idNumber="",id=null){
    const url = new URL("http://localhost:8080/find-worker")
    if (id) {
        url.searchParams.append("id",id)
    }else if(idNumber){
        url.searchParams.append("id_number",idNumber)
    }else{
        if (firstName) url.searchParams.append("first_name", firstName);
        if (lastName) url.searchParams.append("last_name", lastName);
        if (middleName) url.searchParams.append("middle_name", middleName);
    };
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error("An error occurred while fetching workers:", error.message);
            if (error.message.includes("404")) {
                return { error: "Worker not found"};
            }else if (error.message.includes("500")){
                return { error: "Server error, please try again later"};
            }else{
                return { error: "An unexpected error occurred" };
            }
        });
}

export async function removeEntry(id,table){
    const url = new URL(`http://localhost:8080/delete/${table}/${id}`)

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok){
            throw new Error(result.Error||`Error: ${response.statusText}`)
        }

        return result;
    } catch (error){
        console.error("Failed to delete worker", error);
        return {error:error.message};
    }
}

export async function linkWorkerLocations(workerId,locationId){
    const result = await fetch(`http://localhost:8080/assign-location/${workerId}/${locationId}`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        }
    })
    .then((data)=> data.json())
    .then((data) => data)
    return result
}

export async function workerLocationSearch(column,id){
    try{
        const response = await fetch(`http://localhost:8080/get-worker-location-connections/${column}/${id}`,{
            method:"GET"
        })

        const data = await response.json();

        if(!response.ok) {
            return data || `Error : ${response.status} ${response.statusText}`
        }

        return data;
    } catch (error) {
        console.error("Error fetching worker location connections:",error.message);
        return { error: error.message };
    }
}

export async function removeConnections(column,id){
    const url = new URL(`http://localhost:8080/remove-connection/${column}/${id}`)

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok){
            throw new Error(result.Error || `Error : ${response.statusText}`)
        }

        return result;
    } catch (error){
        console.error("Failed to delete connection", error);
        return {error:error.message};
    }
}

export async function createConstraint(worker1IdStr,worker2IdStr,notes=""){
    let worker1_id,worker2_id
    try{
        worker1_id = parseInt(worker1IdStr)
        worker2_id = parseInt(worker2IdStr)
    }catch{
        return "Please Insert Valid Values" 
    }
    
    try {
        const response = await fetch("http://localhost:8080/create-constraint",{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                worker1_id,
                worker2_id,
                notes
            })
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            console.error("JSON Parsing Error:", error.message);
            result = null;
        }

        if (!response.ok) {
            throw new Error(result?.Error || `Error: ${response.status} ${response.statusText}`);
        }

        return result;
    }catch (error) { 
        console.log("Error creating constraint:",error.message)   
        return { error: error.message };
    }
}

export async function getConstraints(id=null,worker1=null,worker2=null){ //complete
    let result
    const url = new URL("http://localhost:8080/find-constraints")
    if (id || worker1 || worker2){
        if (id){
            url.searchParams.append("id",id)
        }else {
            if (worker1){
                url.searchParams.append("worker1",worker1)
            }
            if (worker2){
                url.searchParams.append("worker2",worker2)
            }
        }
    }
    result = await fetch(url)
    const data = await result.json()

    return data
}

export async function editConstraints(id,worker1IdStr="",worker2IdStr="",note=""){ // working
    let worker1Id,worker2Id

    if (!id){
        return {"Error":"Id required"}
    }    

    try{
        worker1Id = parseInt(worker1IdStr)
        worker2Id = parseInt(worker2IdStr)
    }catch{
        errorTag.innerHTML = "Invalid insertion values for input areas"
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

    try{
        const response = await fetch(`http://localhost:8080/edit-constraints/${id}`,{
            method: "PATCH",
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify(jsonValues)
        });

        const result = await response.json();

        if (!response.ok){
            throw new Error(result.Error || `Error: ${response.status} ${response.statusText}`);
        }

        return result
    }catch (error){
        console.error("Error in editing constraints: \n",error);
        return { "error":error.message };
    }
}

export async function deleteConstraints(id){ //working
    const url = new URL(`http://localhost:8080/delete-constraint/${id}`)

    if (!id)return "No parameter provided!"

    try{
        const response = await fetch(url,{
            method: 'DELETE',
            headers:{
                'Content-Type':'application/json'
            }
        });

        const result = await response.json()

        if (!response.ok){
            console.log("in the if statement")
            throw new Error(result.Error || `Error: ${response.statusText}`)
        }

        return result
    }catch(error){
        console.error("Failed to delete worker",error);
        return {error:error.message}
    }
    
}

export async function addDaysOff(workerIdStr,startDate,endDate){ //working
    try{
        const worker_id = parseInt(workerIdStr)
        const response = await fetch(`http://localhost:8080/add-days-off`,{
            method:'POST',
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                "worker_id":worker_id,
                "start_date":startDate,
                "end_date":endDate
            })
        });

        const result = await response.json();

        if (!response.ok){
            throw new Error(result.Error || `Error: ${response.status} ${response.statusText}`);
        }

        return result
    }catch(error){
        console.error("Error in creating days off: \n",error)
        return {"error":error.message}
    }
}

export async function getDaysOff(column="",value=""){ //working
    let url
    if (column && value){
        url = `http://localhost:8080/get-days-off/${column}/${value}`
    }else{
        url = "http://localhost:8080/get-days-off"
    }

    const results = await fetch(url)
    const data = await results.json()

    return data
}

export async function removeDaysOff(breakId){ //complete
    const url = new URL(`http://localhost:8080/remove-days/${breakId}`)

    if (!breakId){
        return {"Error":"Id required"}
    }
    
    try{
        const response = await fetch(url,{
            method: 'DELETE',
            headers:{
                'Content-Type':'application/json'
            }
        });

        const result = await response.json()

        if (!response.ok){
            throw new Error(result.Error || `Error: ${response.statusText}`)
        }

        return result
    }catch(error){
        console.error("Failed to delete day off",error);
        return {error:error.message}
    }
}

// async function tester() {
//     const result = await addDaysOff(2,"2025-12-02","2025-12-02")
//     console.log(result)
// }

// tester()