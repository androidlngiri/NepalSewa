import axios from "axios"

const API_URL = process.env.SPARROW_SMS_API_URL || "http://api.sparrowsms.com/v2/sms/"
const TOKEN = process.env.SPARROW_SMS_TOKEN
const SENDER_ID = process.env.SPARROW_SMS_SENDER_ID

export async function sendSms(to: string, text: string): Promise<{ success: boolean; error?: string }> {
  if (!TOKEN || !SENDER_ID) {
    console.warn("Sparrow SMS not configured — SMS not sent")
    return { success: false, error: "SMS not configured" }
  }

  try {
    const res = await axios.post(API_URL, null, {
      params: {
        token: TOKEN,
        from: SENDER_ID,
        to,
        text,
      },
    })

    if (res.data && res.data.response_code && res.data.response_code !== "200") {
      return { success: false, error: res.data.response_code }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || "SMS send failed" }
  }
}
