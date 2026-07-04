import os
import requests

def send_otp_email(to_email: str, otp: str):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": os.getenv("BREVO_API_KEY"),
        "content-type": "application/json"
    }

    html_content = f"""
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; font-family: Arial, Helvetica, sans-serif;">
            <tr>
              <td style="background-color: #1a1a1a; padding: 24px 32px;">
                <span style="color: #ffffff; font-size: 18px; font-weight: 600;">AI Trip Planner</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 32px 24px;">
                <h1 style="margin: 0 0 12px; font-size: 22px; color: #1a1a1a;">Verify your email</h1>
                <p style="margin: 0 0 28px; font-size: 15px; color: #6b7280; line-height: 1.5;">
                  Enter this code to finish creating your account. It expires in 10 minutes.
                </p>
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a;">{otp}</span>
                </div>
                <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 32px; border-top: 1px solid #f0f0f0;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  AI Trip Planner &middot; This is an automated message
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    """

    payload = {
        "sender": {"name": "AI Trip Planner", "email": "ashishsinghcr07@gmail.com"},
        "to": [{"email": to_email}],
        "subject": "Your verification code",
        "htmlContent": html_content
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 201:
        raise Exception(f"Failed to send email: {response.text}")
    return response.json()