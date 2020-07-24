const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRIP_API_KEY);

//For when an user is created
const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'dliendo05@gmail.com',
    subject: 'Test',
    text: `Welcom to app ${name}`,
  });
};

//For when an user is deleted
const sendByeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'dliendo05@gmail.com',
    subject: 'Goodbye My Lover',
    text: `Would like to tell us why you left? ${name}`,
  });
};
module.exports = {
  sendWelcomeEmail,
  sendByeEmail,
};
