
const User = require('../models/users');
const ForgotPasswords = require('../models/forgot-password');
const bcrypt = require('bcrypt');
const Sib = require('sib-api-v3-sdk');
const client = Sib.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();

exports.userResetpasswordMail = async (request, response, next) => {
    try {
        
        const { email } = request.body;
        const user= await User.findOne({
            where: {
                email: email
            }
        });
        if (user) {
            const sender = {
                email: 'ramanizum@gmail.com',
                name: 'From Mufil Rahman Pvt.Ltd'
            }
            const receivers = [
                {
                    email: email
                }
            ]
            const resetresponse = await user.createForgotpassword({});
            const { id } = resetresponse;
            const mailresponse = await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: "Chat Application password assistance",
                htmlContent: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <h1 class="text-center">Reset Your Password</h1>
                                    <p class="text-center">Follow this link to reset your account password at Chat Application.If you didnt request a new password, you can safetely delete this email.</p>
                                    <div class="text-center">
                                        <a href="${process.env.WEBSITE}/user/reset/{{params.role}}" class="btn btn-primary">Reset Password</a>
                                    </div>
                                    <div class="text-center">
                                        <hr>
                                        <p>If you have any questions, contact us at <a href="mailto:mufilrahman.a@gmail.com">mufilrahman.a@gmail.com</a></p>
                
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </body>
                </html>`,
                params: {
                    role: id
                }
            })
            response.status(200).json({ message: 'Password reset email sent' });
        } else {
            response.status(404).json({ message: 'customer not found' });
        }


    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Interenal Server Error' });
    }
}
exports.userResetpasswordform = async (request, response, next) => {
    try {
        let forgotId = request.params.forgotId;
        const passwordreset = await ForgotPasswords.findByPk(forgotId);
        if (passwordreset.isactive) {
            passwordreset.isactive = false;
            await passwordreset.save();
            response.sendFile('reset.html',{root:'views'})
        } else {
            return response.status(401).json({ message: "Link has been expired" })
        }

    } catch (error) {

    }
}

exports.userResetpassword = async (request, response, next) => {
    try {
        const { resetid, newpassword } = request.body;
        const passwordreset = await ForgotPasswords.findByPk(resetid);
        const currentTime = new Date();
        const createdAtTime = new Date(passwordreset.createdAt);
        const timeDifference = currentTime - createdAtTime;
        const timeLimit = 5 * 60 * 1000; 
        if(timeDifference <= timeLimit){
            const hashedPassword = await bcrypt.hash(newpassword, 10);
          await User.update(
                {
                    password: hashedPassword
                },
                {
                    where: { id: passwordreset.UserId }
                }
            );
            response.status(200).json({ message: "Password reset successful." });
        }else{
            response.status(403).json({ message: "Link has expired Generate a new link"});
        }



    } catch (error) {
        console.error("Error resetting password:", error);
        response.status(500).json({ message: "Internal server error" });
    }
};
