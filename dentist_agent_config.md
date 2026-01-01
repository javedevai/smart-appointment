# Dentist Booking Agent Configuration

This guide outlines the custom entities, intents, and parameters needed for your Dialogflow Dentist Booking Agent.

---

## 1. Entities
Create these before creating intents.

### Entity: `@dental-service`
   Define Synonyms: Yes

| Reference Value | Synonyms |
| :--- | :--- |
| Cleaning | Teeth cleaning, dental cleaning, scaling, polish |
| Checkup | Dental checkup, routine checkup, consultation, general exam |
| Root Canal | Root canal, rct, endodontic therapy |
| Extraction | Tooth extraction, pull tooth, remove tooth |
| Whitening | Teeth whitening, bleaching, brighten teeth |
| Orthodontics | Braces, aligners, ortho consultation |

### Entity: `@dentist` (Optional)
   Define Synonyms: Yes

| Reference Value | Synonyms |
| :--- | :--- |
| Dr. Smith | Dr. Smith, John Smith |
| Dr. Ayesha | Dr. Ayesha, Ms. Ayesha |
| Any | Anyone, first available, no preference |

---

## 2. Intents

### Intent: `Default Welcome Intent`
Training Phrases: (Default)
   Hi
   Hello
   Good morning

Responses:
   Welcome to Smart Dentist Clinic! I can help you book an appointment for services like Cleaning, Checkup, or Root Canal. How can I help you today?

---

### Intent: `Book Appointment`
Training Phrases:
   I want to book a checkup
   Schedule a Cleaning for tomorrow
   Appointment for Root Canal at 5pm
   Do you have openings for Whitening?
   Book a dentist appointment
   I have a toothache and need an extraction

Action and Parameters:

| Parameter Name | Entity | Required | Is List | Prompts (if missing) |
| :--- | :--- | :--- | :--- | :--- |
| `service` | `@dental-service` | Yes | No | What kind of dental service do you need? (e.g., Cleaning, Checkup) |
| `date` | `@sys.date` | Yes | No | What date works best for you? |
| `time` | `@sys.time` | Yes | No | What time should we schedule that for? |
| `dentist` | `@dentist` | No | No | (Optional) Do you have a preferred dentist? |
| `name` | `@sys.person` | Yes | No | May I have your full name? |
| `phone_number` | `@sys.phone-number` | Yes | No | What is your phone number for confirmation? |
| `email` | `@sys.email` | Yes | No | Please provide your email address. |

Fulfillment:
   Enable Webhook for this Intent: Yes

Responses (Fallback if Webhook fails):
   I have noted your request for a $service on $date at $time. We will contact you shortly.

---

## 3. Webhook Payload Structure
When the user completes the slot filling, Dialogflow will send this JSON to your backend (`dialogflow.js`).

```json
{
  queryResult: {
    intent: { displayName: Book Appointment },
    parameters: {
      service: Cleaning,
      date: 2023-11-01T12:00:00+05:00,
      time: 2023-11-01T14:00:00+05:00,
      dentist: Dr. Smith,
      name: { name: Sarah Jones },
      phone_number: 555-0100,
      email: sarah@example.com
    }
  }
}
```
