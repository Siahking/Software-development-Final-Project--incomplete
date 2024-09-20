import { findLocation,getData,deleteLocation,newLocaton } from "./backend";

const list = document.getElementById("list");

const jacks = await getData();
console.log(jacks)


document.getElementById("get-locations").addEventListener("click" ,async () => {
    console.log("here")
    const locations = await getData();
    console.log(locations)

    locations.forEach(data=>{
        const item = document.createElement("li")
        item.innerHTML = data.location
        list.appendChild(item)
    })
})