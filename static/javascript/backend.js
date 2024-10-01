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

export async function addLocaton(locationName) {
    const data = {
        location : locationName
    };
    const result = await fetch("http://localhost:8080/locations",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(data)
    })
        .then((data)=> data.json())
        .then((data) => data);
    console.log(result);
};

export async function addWorker(firstName,middleName,lastName,gender,address,contact,age){
    
}

export async function deleteLocation(id) {
    const data = await fetch(`http://localhost:8080/locations/${id}`,{
        method: "DELETE"
    })
        .then((data) => data.json())
        .then((data) => data);
    console.log(data);
}

export async function findLocation(name){
    const data = await fetch(`http://localhost:8080/locations/${name}`,{
        method: "GET"
    })
        .then((data) => data.json())
        .then((data) => data);
    let dataKey;
    dataKey = Object.keys(data)[0]
    if (dataKey === 'error'){
        console.log("location not found")
    }else{
        console.log(`location id is ${data.id} and location is ${data.location}`)
    }
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

export async function findWorker(id,firstName,lastName,middleName){

    const url = new URL("http://localhost:8080/find-worker")
    if (id) {
        url.searchParams.append("id",id)
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

        if (!response.ok){
            throw new Error(`Error: ${response.statusText}`)
        }

        const result = await response.json();
        console.log(result)

        return result;
    } catch (error){
        console.error("Failed to delete worker", error);
        return {error:error.message};
    }
}

