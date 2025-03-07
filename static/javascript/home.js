const messageTag = document.getElementById("message")
const errorTag = document.getElementById("error-tag")

// //add message to the main div
window.addEventListener("DOMContentLoaded",()=>{
    const message = sessionStorage.getItem("Message")

    errorTag.innerHTML = ""

    if (message)
        messageTag.innerHTML = message
        sessionStorage.removeItem("Message")
        localStorage.removeItem("Message")
})