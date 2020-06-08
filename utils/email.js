const sgMail = require('@sendgrid/mail');
const htmlToText = require('html-to-text')
const ejs = require('ejs') 

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async(options, html)=> {
    const msgOptions = {
        to: "entrymanagement124@gmail.com",
        from: 'jayeshagarwal58@gmail.com',
        subject: options.subject,
        text: htmlToText.fromString(html),
        html: ""+html+""
    };
    await sgMail.send(msgOptions);
}

const sendWelcomeEmail = async (template, options)=> {
    const html = await ejs.renderFile(`${__dirname}/../views/email/${template}.ejs`, {
        name: options.name,
        url: options.url,
        subject: options.subject
    })
    await sendMail(options, html)
}

const sendResetMail = async (template, options)=> {
    const html = await ejs.renderFile(`${__dirname}/../views/email/${template}.ejs`, {
        name: options.name,
        url: options.url,
        subject: options.subject
    })
    await sendMail(options, html)
}

module.exports = {
    sendWelcomeEmail,
    sendResetMail
}


// const nodemailer = require("nodemailer");

// const sendMail = async (options) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME, 
//             pass: process.env.EMAIL_PASSWORD 
//     }});
//     const mailOptions = {
//         from: 'jayeshagarwal58@gmail.com',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     };
//     await transporter.sendMail(mailOptions)
// }