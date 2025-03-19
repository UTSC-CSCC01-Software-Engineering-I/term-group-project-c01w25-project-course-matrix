const Brevo = require("@getbrevo/brevo");

const brevoApiInstance = new Brevo.TransactionalEmailsApi();
const apiKey = brevoApiInstance.authentications.apiKey = process.env.BREVO_API_KEY;

const brevoSendSmtpEmail = new Brevo.SendSmtpEmail();

export { brevoApiInstance, brevoSendSmtpEmail };
