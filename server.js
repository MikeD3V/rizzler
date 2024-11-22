import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import cors from 'cors'; // To handle CORS issues

const app = express();
const PORT = 3000;

// Your PhilSMS API key
const API_KEY = '1074|zTI2zDm4tlYqsnO4LQ0M9EMancQnb2eHADdBKJxy';
const ENDPOINT = 'https://app.philsms.com/api/v3/sms/send';

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from "public" folder

// POST route to send SMS
app.post('/send-sms', async (req, res) => {
  const { number, message } = req.body;

  // Validate inputs
  if (!number || !message) {
    return res.status(400).send('Phone number and message are required.');
  }

  // Ensure the number is in the correct format: 639XXXXXXXXX (no '+')
  if (!/^[6-9]\d{9}$/.test(number)) {
    return res.status(400).send('Invalid phone number format. Use 639XXXXXXXXX (without +).');
  }

  try {
    // Log the number and message being sent for debugging
    console.log(`Sending SMS to: ${number}`);
    console.log(`Message: ${message}`);

    // Send the SMS request to PhilSMS
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        recipient: number, // Phone number in correct format
        message: message,  // Message content
      }),
    });

    const data = await response.json();
    console.log('PhilSMS Response:', data); // Log the API response

    if (response.ok && data.success) {
      res.send('Message sent successfully!');
    } else {
      console.error('Error from PhilSMS:', data); // Log error details
      res.status(500).send(`Failed to send message: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error:', error); // Log error stack for debugging
    res.status(500).send('An error occurred while sending the SMS.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
