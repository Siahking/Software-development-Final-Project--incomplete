export function toggleDiv(itemId){
    const container = document.getElementById("info-container");
    const passwordInput = document.getElementById("password")
    const usernameInput = document.getElementById("username")
    if (!container.classList.contains("specified-hidden")){
        usernameInput.value = ""
        passwordInput.value = ""
        container.classList.add("specified-hidden");
        passwordInput.setAttribute("type","text")
    }else if (itemId === "login-button"){
        container.classList.remove("specified-hidden");
        passwordInput.setAttribute("type","password")
    }else{
        container.classList.remove("specified-hidden");
    }
}