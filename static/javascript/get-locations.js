import { getData } from "./backend.js";

const list = document.getElementById("list");

async function getLocations(){
    const locations = await getData();

    locations.forEach(data=>{
        const item = document.createElement("li")
        item.innerHTML = data.location
        list.appendChild(item)
    })
};

getLocations();