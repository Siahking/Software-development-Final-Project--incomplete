//function which returns true if an object key includes error and false otherwise
export default function objectCheck(object){
    if(Object.keys(object).includes("error"))return true
    return false
}