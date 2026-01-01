require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!authToken || authToken === '[AuthToken]') {
  console.error('Error: TWILIO_AUTH_TOKEN is missing in .env file.');
  process.exit(1);
}

const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        from: 'whatsapp:+14155238886',
        contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
        contentVariables: '{"1":"12/1","2":"3pm"}',
        to: 'whatsapp:+923461144479' // You might want to make this dynamic as well
    })
    .then(message => console.log('Message sent! SID:', message.sid))
    .catch(error => console.error('Error sending message:', error))
    // .done(); // done() is deprecated in newer promise implementations or not always needed, standard catch is better
