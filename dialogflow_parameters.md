# Dialogflow Parameters & Configuration Guide
**Project:** Smart Appointment & Client Management System
**Hackathon:** Saylani AI Hackathon 2

This guide outlines the custom entities, intents, and parameters needed for your Dialogflow agent.

---

## 1. Entities
Create these *before* creating intents so you can tag them immediately.

### Entity: `@massage-type`
*   **Define Synonyms:** (Checking "Define synonyms" allows matches for variations)

| Reference Value | Synonyms |
| :--- | :--- |
| **Swedish** | Swedish, Swedish massage, relaxation massage, classic massage |
| **Deep Tissue** | Deep Tissue, deep rub, muscle therapy, hard pressure |
| **Aromatherapy** | Aromatherapy, scent massage, oil massage, aroma therapy |
| **Hot Stone** | Hot Stone, stone massage, heated stone |
| **Sports** | Sports, sports massage, athletic massage, recovery massage |
| **Reflexology** | Reflexology, foot massage, feet therapy |

### Entity: `@therapist` (Optional)
*   Used if clients request a specific person.

| Reference Value | Synonyms |
| :--- | :--- |
| **Sarah** | Sarah, Ms. Sarah |
| **John** | John, Mr. John |
| **Any** | Anyone, no preference, whoever is available, first available |

---

## 2. Intents

### Intent: `Book Appointment`
**Training Phrases:**
*   "I want to book a massage"
*   "Schedule a **Swedish** massage for **tomorrow**"
*   "Appointment for **Deep Tissue** at **5pm**"
*   "Do you have openings for **Sports** massage?"
*   "Book a session"

**Action and Parameters:**

| Parameter Name | Entity | Required | Is List | Prompts (if missing) |
| :--- | :--- | :--- | :--- | :--- |
| `service` | `@massage-type` | **Yes** | No | What type of massage would you like to book? (e.g., Swedish, Deep Tissue) |
| `date` | `@sys.date` | **Yes** | No | What date would you like to come in? |
| `time` | `@sys.time` | **Yes** | No | What time works best for you? |
| `therapist` | `@therapist` | No | No | Do you have a preferred therapist? |

**Responses (Default):**
*   "Okay, I have a request for a $service massage on $date at $time. To confirm, may I have your name?"

---

### Intent: `Book Appointment - Collect Details`
*   **Context:** Input Context: `BookAppointment-followup` (Set this Output Context in the previous intent)
*   *Alternatively, use Slot Filling in the main intent if using Webhook for fulfillment.*

**Training Phrases:**
*   "My name is **John Doe**"
*   "It's **03001234567**"
*   "John Doe, **03001234567**"

**Action and Parameters:**

| Parameter Name | Entity | Required | Is List | Prompts (if missing) |
| :--- | :--- | :--- | :--- | :--- |
| `person` | `@sys.person` | **Yes** | No | Could I get your full name please? |
| `phone_number` | `@sys.phone-number` | **Yes** | No | What is your WhatsApp number for the confirmation? |

**Responses (Default):**
*   "Thank you $person. I've booked your $service massage for $date at $time. A confirmation has been sent to $phone_number via WhatsApp."

---

## 3. Webhook / Backend Data Structure
When your backend receives the request (via Fulfillment), the JSON payload will look something like this. You need to extract these values to save to your database.

```json
{
  "queryResult": {
    "parameters": {
      "service": "Swedish",
      "date": "2023-10-27T12:00:00+05:00",
      "time": "2023-10-27T14:00:00+05:00",
      "person": { "name": "Ali Khan" },
      "phone_number": "03001234567"
    }
  }
}
```

## Hackathon Tips
*   **Date/Time Handling:** Dialogflow returns ISO strings. Make sure your Python/Node.js backend parses them correctly for the confirmation message.
*   **WhatsApp Integration:** Use Twilio or a similar API in your fulfillment code to send the message using `phone_number`.
