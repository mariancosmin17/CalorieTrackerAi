import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_email(to_email:str,subject:str,body:str)->bool:
    try:
        message = MIMEMultipart()
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "html"))
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(message)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_reset_code(to_email: str, reset_code: str) -> bool:
    subject = "Reset Your Password - Calorie Tracker Ai"

    body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password. </p>
            <p>Your password reset code is: </p>
            <div style="background-color: #f4f4f4; padding:  15px; border-radius: 5px; text-align: center;">
                <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">{reset_code}</h1>
            </div>
            <p style="margin-top: 20px;">This code will expire in <strong>{settings.RESET_CODE_EXPIRE_MINUTES} minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin-top: 30px;">
            <p style="color:  #999; font-size: 12px;">Food AI App - Calorie Tracker</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, body)

def send_support_email(user_email: str, username: str, message: str) -> bool:
    subject = f"Support Request from {username} - CalorieTracker AI"
    body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1E3A5F;">New Support Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; font-weight: bold; color: #555;">From:</td>
                    <td style="padding: 8px;">{username}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold; color: #555;">Email:</td>
                    <td style="padding: 8px;">{user_email}</td>
                </tr>
            </table>
            <div style="margin-top: 20px; background-color: #f4f4f4; padding: 15px; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Message:</h3>
                <p style="color: #444; line-height: 1.6;">{message}</p>
            </div>
            <hr style="margin-top: 30px;">
            <p style="color: #999; font-size: 12px;">CalorieTracker AI - Support System</p>
        </body>
    </html>
    """
    return send_email(settings.SMTP_FROM_EMAIL, subject, body)