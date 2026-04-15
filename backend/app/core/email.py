import resend
import os
import logging

logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY", "")

FROM_EMAIL = "onboarding@resend.dev"
FROM_NAME = os.getenv("SMTP_FROM_NAME", "CalorieTracker AI")

def send_reset_code(to_email: str, code: str, expires_in_minutes: int = 15) -> bool:
    try:
        params = {
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": "Password Reset Code",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color: #0284c7;">Password Reset Code</h2>
                    <p>Your password reset code is:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                                color: #0284c7; padding: 20px; background: #f0f9ff;
                                border-radius: 12px; text-align: center; margin: 20px 0;">
                        {code}
                    </div>
                    <p style="color: #666;">This code expires in <strong>{expires_in_minutes} minutes</strong>.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
                </div>
            """,
        }
        resend.Emails.send(params)
        logger.info(f"Reset code email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False

def send_support_email(user_email: str, username: str, message: str) -> bool:
    try:
        params = {
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [os.getenv("SUPPORT_EMAIL", "")],
            "subject": f"Support Request from {username}",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color: #0284c7;">New Support Request</h2>
                    <p><strong>From:</strong> {username} ({user_email})</p>
                    <div style="background: #f9f9f9; padding: 16px; border-radius: 8px;
                                border-left: 4px solid #0284c7; margin: 16px 0;">
                        {message.replace(chr(10), '<br>')}
                    </div>
                </div>
            """,
        }
        resend.Emails.send(params)
        logger.info(f"Support email sent from {username} ({user_email})")
        return True
    except Exception as e:
        logger.error(f"Error sending support email: {e}")
        return False
