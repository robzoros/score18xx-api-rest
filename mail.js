var nodemailer = require("nodemailer"),
    email      = require("./config/email");

function sendMail (user, nuevaPassword, cb) {
    
    // Use Smtp Protocol to send Email
    var smtpTransport = nodemailer.createTransport(email.gmail_chain);

    var texto = "Se ha reseteado su password.\r\n Usuario: " + user.name + "\r\n Password: " + nuevaPassword;
    var html = "Se ha reseteado su password.<br> <b>Usuario:</b> " + user.name + "<br> <b>Password:</b> " + nuevaPassword;
    var mail = {
        from: email.gmail_user,
        to: user.email,
        subject: email.subject_reset,
        text: texto,
        html: html
    };

    smtpTransport.sendMail(mail, function(error, response){
        if(error){
            console.log(error);
            cb(error);
        }else{
            console.log("Message sent: " + response.message);
            cb(null);
        }
        smtpTransport.close();
    });
}
    
module.exports.sendMail = sendMail;