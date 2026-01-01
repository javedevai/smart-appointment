require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { WebhookClient } = require("dialogflow-fulfillment");
const nodemailer = require("nodemailer");
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

// Twilio WhatsApp Configuration
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const app = express();
app.use(express.json());
app.use(cors());

// Credentials loaded from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("Dentist Appointment Booking Agent is Running!");
});

app.post("/webhook", async (req, res) => {
    console.log("Dialogflow Request Headers:", req.headers);
    console.log("Dialogflow Request Body:", JSON.stringify(req.body, null, 2));

    const agent = new WebhookClient({ request: req, response: res });

    function welcome(agent) {
        agent.add(`Welcome to Smart Dentist Clinic! I can help you book appointments for services like Cleaning, Checkup, or Root Canal. How can I help you today?`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand. Can you try again?`);
        agent.add(`I'm sorry, can you say that again?`);
    }

    async function bookAppointment(agent) {
        let { time, name, phone_number, email } = agent.parameters;
        
        // 1. Robust Parameter Extraction (Fix for [object Object])
        if (typeof name === 'object' && name !== null && name.name) {
            name = name.name;
        }
        
        if (typeof email === 'object' && email !== null) {
             // Handle if email is { email: "..." } or { value: "..." } or ["..."]
             email = email.email || email.value || (Array.isArray(email) ? email[0] : email);
        }

        if (typeof phone_number === 'object' && phone_number !== null) {
             phone_number = phone_number.phone_number || phone_number.value || (Array.isArray(phone_number) ? phone_number[0] : phone_number);
        }

        // Create a readable time string
        let timeString = time;
        if (typeof time === 'object') {
             // If time is an object, try to find a string representation or default to raw
             timeString = time.date_time || time.value || JSON.stringify(time);
        }
        
        if (typeof timeString === 'string' && timeString.includes('T')) {
             const timeObj = new Date(timeString);
             // Ensure it's a valid date before formatting
             if (!isNaN(timeObj.getTime())) {
                 timeString = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
             }
        }

        console.log(`Booking Request: Patient ${name} at ${timeString}`);
        console.log(`Contact: ${phone_number}, ${email}`);

        // 1. Insert into Supabase
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert([
                    { name: name, email: email, phone_number: phone_number, appointment_time: timeString },
                ]);

            if (error) console.error('Supabase Error:', error);
            else console.log('Supabase Success:', data);
        } catch (err) {
            console.error('Supabase Exception:', err);
        }

        // 2. Send Email via Nodemailer
        try {
            const info = await transporter.sendMail({
                from: `"Smart Dentist Clinic" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Appointment Confirmed! 🦷",
                text: `Hi ${name},\n\nYour appointment has been confirmed for ${timeString}.\n\nReference: ${phone_number}\n\nSee you soon!\nSmart Dentist Clinic`,
            });
            console.log("Email sent:", info.messageId); 
        } catch (emailErr) {
            console.error("Email Error:", emailErr);
        }

        // 3. Send WhatsApp Message via Twilio
        try {
            // Format phone number for WhatsApp (must include country code)
            let whatsappNumber = phone_number;
            // Remove any spaces, dashes, or parentheses
            whatsappNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
            // Add country code if not present (assuming Pakistan +92)
            if (!whatsappNumber.startsWith('+')) {
                if (whatsappNumber.startsWith('0')) {
                    whatsappNumber = '+92' + whatsappNumber.substring(1);
                } else {
                    whatsappNumber = '+92' + whatsappNumber;
                }
            }

            const whatsappMessage = await twilioClient.messages.create({
                body: `🦷 *Smart Dentist Clinic*\n\nHi ${name}!\n\nYour appointment has been confirmed for *${timeString}*.\n\nReference: ${phone_number}\n\nSee you soon!`,
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: `whatsapp:${whatsappNumber}`
            });
            console.log("WhatsApp sent:", whatsappMessage.sid);
        } catch (whatsappErr) {
            console.error("WhatsApp Error:", whatsappErr);
        }

        agent.add(`✅ Appointment Confirmed!\n\nPatient: ${name}\nTime: ${timeString}\n\nWe have sent a confirmation email to ${email} and a message to ${phone_number}. See you at the clinic! 🦷`);
    }

    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", fallback);
    intentMap.set("bookAppointment", bookAppointment);
    
    // If you have a separate intent for collecting details, you can map it here too.
    // intentMap.set("Book Appointment - Collect Details", bookAppointment);

    agent.handleRequest(intentMap);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});