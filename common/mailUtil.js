const nodemailer = require('nodemailer');
const { MAIL_AUTH } = require('./constants');

exports.sendMail = (content, to_email, subject) => {
    let transporter = nodemailer.createTransport({
        // host: "mail.test.com",
        // port: 587,
        // secure: false, // true for 465, false for other ports
        service: 'gmail',
        auth: {
          user: MAIL_AUTH.email, // generated ethereal user
          pass: MAIL_AUTH.password, // generated ethereal password
        }
      });

    var mailOptions = {
        from: `VASTUM <${MAIL_AUTH.email}>`,
        to: to_email,
        subject: subject,
        html: content
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (err, info) => {
        if (err)
            throw new Error(err);
        console.log("[INFO] email content:", content);
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    });
}

