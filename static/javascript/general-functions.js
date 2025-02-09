export function disableElements(checkbox,checkboxArr,inputsArr){
    if(checkbox.checked){
        checkboxArr.forEach(checkbox=>{
            checkbox.setAttribute("disabled","true")
        })
        inputsArr.forEach(input=>{
            input.value = ""
            if (!input.classList.contains("hidden")){
                input.classList.add("hidden")
            }
        })
    }else{
        checkboxArr.forEach((checkbox)=>{
            checkbox.removeAttribute("disabled");
            checkbox.checked = false
        })
    };
};

export function checkContraintsInput(worker1Firstname,worker1Lastname,worker2Firstname,worker2Lastname){
    if ((worker1Firstname || worker1Lastname) && (worker2Firstname || worker2Lastname)){
        return "both workers"
    }else if (worker1Firstname || worker1Lastname){
        return 'worker one'
    }else if ( worker2Firstname || worker2Lastname ){
        return 'worker two'
    }else{
        return 'all constraints'
    }
}