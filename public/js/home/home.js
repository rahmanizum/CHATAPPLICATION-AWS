import helperFunctions from "/js/home/helperFunctions.mjs";

//ON  SIGNUP
const signupElements = {
    name: signup_form.querySelector('input[name="Name"]'),
    email: signup_form.querySelector('input[name="Email"]'),
    phoneNo: signup_form.querySelector('input[name="PhoneNumber"]'),
    password1: signup_form.querySelector('input[name="Password1"]'),
    password2: signup_form.querySelector('input[name="Password2"]'),
    signup_btn: signup_form.querySelector('input[type="submit"]'),
    alert1: signup_form.querySelector('#alert1'),
    alert2: signup_form.querySelector('#alert2'),
    alert3: signup_form.querySelector('#alert3'),
}

signupElements.signup_btn.addEventListener('click', on_Signup);
async function on_Signup(e) {
    try {
        if (signup_form.checkValidity()) {
            e.preventDefault();
            if (signupElements.password1.value === signupElements.password2.value) {
                const data = {
                    name: signupElements.name.value,
                    email: signupElements.email.value,
                    phonenumber: signupElements.phoneNo.value,
                    imageUrl:Math.floor(Math.random() * 1000),
                    password: signupElements.password1.value
                }
               await axios.post("user/signup", data);

                signup_form.reset();
                helperFunctions.alertFunction(signupElements.alert3);
                setTimeout(() => {
                    window.location.href = "/user";
                }, 3000)
            } else {
                helperFunctions.alertFunction(signupElements.alert2);
            }
        }

    } catch (error) {
        if (error.response && error.response.status === 409) {
            e.preventDefault();
            console.log("Authentication failed. User is already exist.");
            helperFunctions.alertFunction(signupElements.alert1);
        } else {
            alert("Something went wrong - signup agin")
            console.error("An error occurred:", error);
        }
    }
}

//ON  SIGN IN 
const SigninElements = {
    email: signin_form.querySelector('input[name="Email"]'),
    password: signin_form.querySelector('input[name="Password"]'),
    signin_btn: signin_form.querySelector('input[type="submit"]'),
    alert1: signin_form.querySelector('#alert1'),
    alert2: signin_form.querySelector('#alert2'),
    alert3: signin_form.querySelector('#alert3'),

}
SigninElements.signin_btn.addEventListener('click', onSignin);
async function onSignin(e) {
    try {
        if (signin_form.checkValidity()) {
            e.preventDefault();
            const data = {
                email: SigninElements.email.value,
                password: SigninElements.password.value
            }
            const signinResponse = await axios.post("user/signin", data);
            signin_form.reset();
            helperFunctions.alertFunction(SigninElements.alert3);
            setTimeout(() => {
                window.location.href = "/user";
            }, 3000)
        }

    } catch (error) {
        if (error.response && error.response.status === 401) {
            helperFunctions.alertFunction(SigninElements.alert2)
        } else if (error.response && error.response.status === 409) {
            helperFunctions.alertFunction(SigninElements.alert1)
        } else {
            alert("Something went wrong - Sign in again");
            console.log(error);
        }

    }
}

//ON  FORGOTPASSWORD 

const ForgotModalELements = {
    email: forgot_form.querySelector('input[name="Email"]'),
    submit_btn: forgot_form.querySelector('input[type="submit"]'),
    alert1: forgot_form.querySelector('#alert1'),
    alert2: forgot_form.querySelector('#alert2'),
}
ForgotModalELements.submit_btn.addEventListener('click', Forgotpassword);
async function Forgotpassword(e) {
    try {
        if (e.target && e.target.classList.contains("submit") && forgot_form.checkValidity()) {
            e.preventDefault();
            const data = {
                email: ForgotModalELements.email.value
            }
            await axios.post('user/forgotpassword', data);
            helperFunctions.alertFunction(ForgotModalELements.alert2);
            forgot_form.reset();
            setTimeout(()=>{
                $('#forgotPassword_modal').modal('hide');
            },1500)
        }


    } catch (error) {
        if (error.response && error.response.status === 404) {
            helperFunctions.alertFunction(ForgotModalELements.alert1);

        } else {
            console.log("Error occured while sending mail.", error);
            alert(error.response.data.message);
        }
    }
}