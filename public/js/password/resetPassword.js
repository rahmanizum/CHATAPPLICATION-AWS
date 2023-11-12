import helperFunctions from "/js/password/helperFunctions.mjs";
const parts = window.location.href.split('/'); 
const lastPart = parts[parts.length - 1];

console.log(lastPart);
submitBtn.addEventListener('click',onReset)
async function onReset(e) {
    try {
        if (e.target && resetpasswordform.checkValidity()) {
            e.preventDefault();
            if(password.value!==confirm_password.value){
                helperFunctions.alertFunction(alert1);
            }else{
                const data = {
                    resetid: lastPart,
                    newpassword: password.value,
                };
               await axios.post("/user/password-reset", data);
               resetpasswordform.reset();
               helperFunctions.alertFunction(alert2);
               setTimeout(()=>{
                window.location="/";
               },1500)
            }
        }

    } catch (error) {
        alert(error.response.data.message);
        window.location="/";

    }
}
