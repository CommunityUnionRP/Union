module.exports.Init = () => {
    mp.mailer = {};
    mp.mailer.sendMail = (to, subject, message) => {
        var nodemailer = require("nodemailer");
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gtav.union@gmail.com',
                pass: '123456789gtav'
            }
        });
        message += "<br /><br /> С Уважением, Команда Union RolePlay.";
        const mailOptions = {
            from: 'no-replay@unionrp.com',
            to: to,
            subject: subject,
            html: message
        };
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) console.log(err)
            else console.log(info);
        });
    }
}
