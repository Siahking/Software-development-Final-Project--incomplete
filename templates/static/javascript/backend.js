import fetch from "node-fetch";

export async function getData() {
    const results = await fetch("http://localhost:8080/locations")
        .then((data)=> data.json())
        .then((data) => data);

    for (const result of results){
        console.log(result);
    }
};

export async function newLocaton(locationName) {
    const data = {
        location : locationName
    };
    const result = await fetch("http://localhost:8080/locations",{
        method:"POST",
        headers:{
            "content-Type":"application/json"
        },
        body: JSON.stringify(data)
    })
        .then((data)=> data.json())
        .then((data) => data);
    console.log(result);
};

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