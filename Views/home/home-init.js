import * as funcs from "./home-functions.js"
import * as interactivity from "./home-frontend.js";

let removeWorkerBtnActive,removeLocationActive = false
const messageTag = document.getElementById("message")
const errorTag = document.getElementById("error-tag")
const inputDivIds = ['add-location-div','add-worker-div','find-worker-div']
const hideButtons = ['add-worker','add-location','remove-worker','find-worker','remove-location']

export default function homeInit(){

    // toogle between showing buttons and hiding them on click //
    hideButtons.forEach(buttonId =>{
        const button = document.getElementById(buttonId)
        const divId =   buttonId === "remove-worker" ? "find-worker-div"
                    :   buttonId === "remove-location" ? "add-location-div"
                    :   buttonId + '-div'
        const buttonDiv = document.getElementById(divId)
        button.addEventListener('click', () => interactivity
            .hideShowButton(errorTag,messageTag,buttonId,divId,buttonDiv,inputDivIds)
        )
    })

    //ADD OR REMOVE LOCATION//
    document.getElementById('location-submit-btn')
            .addEventListener(
                'click',() => funcs.homeLocationHandler( errorTag,removeLocationActive)
    )

    

}