const worker1Input = document.getElementById("worker1Id-input")
const worker2Input = document.getElementById("worker2Id-input")
const summary = document.getElementById("summary-input")

export function toogleDiv(currentDiv,otherDivs){
    if (currentDiv.classList.contains("hidden")){
        currentDiv.classList.remove("hidden")
        otherDivs.forEach(div => {
            div.classList.add("hidden")
        });
    }else{
        currentDiv.classList.add("hidden")
    }
}

export function toogleInputTags(event){
    if (event.target.checked){
        switch(event.target.id){
            case "worker1-checkbox":
                worker1Input.classList.remove("specified-hidden")
                break
            case "worker2-checkbox":
                worker2Input.classList.remove("specified-hidden")
                break
            case "summary-checkbox":
                summary.classList.remove("specified-hidden")
                break
        }
    }else{
        switch(event.target.id){
            case "worker1-checkbox":
                worker1Input.classList.add("specified-hidden")
                break
            case "worker2-checkbox":
                worker2Input.classList.add("specified-hidden")
                break
            case "summary-checkbox":
                summary.classList.add("specified-hidden")
                break
        }
    }
}