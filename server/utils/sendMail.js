const nodemailer = require('nodemailer');


async function sendMail(email, header, body){
    try{
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.NODE_EMAIL,
            pass: process.env.NODE_EMAIL_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.NODE_EMAIL,
        to: email,
        subject: header,
        text: body
      });

      console.log("message sent to client successfully")
    }
    catch(err){
        console.log(err.message)
        console.log("message not sent")
    }
};

module.exports = {sendMail};