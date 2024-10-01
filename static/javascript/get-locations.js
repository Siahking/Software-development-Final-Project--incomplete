import { getLocations } from "./backend.js";

const list = document.getElementById("list");

async function getData(){
    const locations = await getLocations();

    locations.forEach(data=>{
        const item = document.createElement("li")
        item.innerHTML = data.location
        list.appendChild(item)
    })
};

getData();