import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(request) {
  try {
    const body = await request.json();
    const { toPhone, message } = body;

    if (!toPhone || !message) {
      return NextResponse.json({ error: 'Phone number and message are required.' }, { status: 400 });
    }

    // Graceful fallback for local dev without credentials
    if (!client) {
      console.warn("Simulated SMS: Twilio credentials not found in environment variables.");
      console.log(`[SIMULATED SMS] To: ${toPhone} | Message: ${message}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Simulated SMS sent successfully. Add Twilio credentials to .env.local to send real SMS.' 
      });
    }

    // Ensure phone number has country code. Assuming India (+91) if 10 digits provided.
    const formattedPhone = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;

    const info = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: formattedPhone
    });

    return NextResponse.json({ success: true, messageId: info.sid });

  } catch (error) {
    console.error("Twilio SMS Error:", error);
    return NextResponse.json({ error: 'Failed to send SMS alert. Please check your Twilio credentials.' }, { status: 500 });
  }
}
