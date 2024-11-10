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
    const result = await fetch(`http://localhost:8080/locations/${locationName}`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        }
    })
    .then((data)=> data.json())
    .then((data) => data)
    return result
};

export async function addWorker(first_name,middle_name,last_name,gender,address,contact,age,id_number){
    console.log(first_name,middle_name,last_name,gender,address,contact,age,id_number)
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

        if(!response.ok){
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    }catch (error) {    
        console.error("Error adding worker:", error);
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

export async function findWorker(id,firstName,lastName,middleName,idNumber){
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

    console.log(url)

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

        if (!response.ok){
            throw new Error(`Error: ${response.statusText}`)
        }

        const result = await response.json();

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
    const result = await fetch(`http://localhost:8080/get-worker-location-connections/${column}/${id}`,{
        method:"GET"
    })
    const data = await result.json();
    return data
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

        if (!response.ok){
            throw new Error(`Error: ${response.statusText}`)
        }

        const result = await response.json();

        return result;
    } catch (error){
        console.error("Failed to delete connection", error);
        return {error:error.message};
    }
}

// async function tester() {
//     const result = await findWorker(null,null,null,null,17382)
//     console.log(result)
// }

// tester()