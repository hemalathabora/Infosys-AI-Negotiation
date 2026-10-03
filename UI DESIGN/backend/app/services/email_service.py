import os
import requests
import smtplib
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple, Dict, Any

from app.config import settings

logger = logging.getLogger("email_service")
executor = ThreadPoolExecutor(max_workers=3)

def send_otp_via_mail_service(email: str, otp: str, name: str = "User") -> Dict[str, Any]:
    """
    Calls the external Vercel mail service endpoint for OTP delivery.
    Sends `to`, `subject`, `html`, `text`, and `fromName` as required by the Vercel send-otp endpoint.
    """
    mail_service_url = os.getenv("MAIL_SERVICE_URL") or settings.MAIL_SERVICE_URL
    mail_service_secret = os.getenv("MAIL_SERVICE_SECRET") or settings.MAIL_SERVICE_SECRET

    if not mail_service_url:
        raise Exception("MAIL_SERVICE_URL is not configured")

    if not mail_service_secret:
        raise Exception("MAIL_SERVICE_SECRET is not configured")

    subject = f"{otp} is your NegoMind AI Verification Code"
    html_content = _build_html_template(email, otp, name)
    text_content = f"Hello {name},\n\nYour NegoMind AI OTP verification code is: {otp}\n\nThis code expires in 10 minutes."

    payload = {
        "to": email,
        "subject": subject,
        "html": html_content,
        "text": text_content,
        "fromName": "NegoMind AI"
    }

    response = requests.post(
        mail_service_url,
        json=payload,
        headers={
            "Authorization": f"Bearer {mail_service_secret}",
            "Content-Type": "application/json"
        },
        timeout=20
    )

    response.raise_for_status()

    return response.json()

def send_otp_email(to_email: str, otp_code: str, name: str = "User") -> Tuple[bool, str]:
    """
    Dispatches OTP code via Vercel mail service with fallback to SMTP/Demo mode.
    """
    try:
        res = send_otp_via_mail_service(to_email, otp_code, name)
        success_msg = f"OTP email successfully sent to {to_email} via Vercel mail service."
        logger.info(f"{success_msg} Response: {res}")
        return True, success_msg
    except Exception as exc:
        logger.warning(f"Vercel mail service call failed: {exc}. Falling back to SMTP configuration...")
        return _send_smtp_sync(to_email, otp_code, name)

def _build_html_template(to_email: str, otp_code: str, name: str = "User") -> str:
    user_display = name.strip() if name and name.strip() else to_email.split("@")[0]

    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">

    <title>Your NegoMind verification code</title>

    <style>
        body {{
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Roboto,
                Helvetica,
                Arial,
                sans-serif;
            color: #111111;
            -webkit-font-smoothing: antialiased;
        }}

        table {{
            border-spacing: 0;
            border-collapse: collapse;
        }}

        .wrapper {{
            width: 100%;
            background-color: #f4f4f5;
            padding: 48px 20px;
        }}

        .container {{
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 14px;
            overflow: hidden;
        }}

        .header {{
            padding: 30px 36px;
            border-bottom: 1px solid #eeeeee;
            background-color: #ffffff;
        }}

        .brand {{
            font-size: 19px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: -0.4px;
            color: #111111;
        }}

        .brand-mark {{
            display: inline-block;
            width: 8px;
            height: 8px;
            margin-left: 5px;
            border-radius: 50%;
            background-color: #111111;
        }}

        .content {{
            padding: 42px 36px 36px;
        }}

        .eyebrow {{
            margin: 0 0 12px;
            font-size: 11px;
            line-height: 1.4;
            font-weight: 700;
            letter-spacing: 1.4px;
            text-transform: uppercase;
            color: #777777;
        }}

        .title {{
            margin: 0;
            font-size: 30px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: -0.8px;
            color: #111111;
        }}

        .greeting {{
            margin: 26px 0 0;
            font-size: 15px;
            line-height: 1.7;
            color: #333333;
        }}

        .description {{
            margin: 8px 0 0;
            font-size: 15px;
            line-height: 1.7;
            color: #555555;
        }}

        .code-wrapper {{
            margin: 30px 0;
            padding: 24px;
            text-align: center;
            background-color: #fafafa;
            border: 1px solid #e2e2e2;
            border-radius: 12px;
        }}

        .code-label {{
            margin: 0 0 12px;
            font-size: 10px;
            line-height: 1.4;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #777777;
        }}

        .otp {{
            margin: 0;
            font-family:
                "SFMono-Regular",
                Consolas,
                "Liberation Mono",
                "Courier New",
                monospace;
            font-size: 34px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: 8px;
            color: #111111;
        }}

        .expiry {{
            margin: 12px 0 0;
            font-size: 12px;
            line-height: 1.5;
            color: #777777;
        }}

        .security-note {{
            margin: 0;
            padding: 16px 18px;
            border-left: 3px solid #111111;
            background-color: #fafafa;
            font-size: 13px;
            line-height: 1.6;
            color: #555555;
        }}

        .footer {{
            padding: 24px 36px 30px;
            border-top: 1px solid #eeeeee;
            background-color: #ffffff;
        }}

        .footer-text {{
            margin: 0;
            font-size: 11px;
            line-height: 1.6;
            color: #888888;
        }}

        .footer-link {{
            color: #555555;
            text-decoration: none;
        }}

        @media only screen and (max-width: 600px) {{
            .wrapper {{
                padding: 20px 12px;
            }}

            .header {{
                padding: 24px;
            }}

            .content {{
                padding: 32px 24px 28px;
            }}

            .footer {{
                padding: 22px 24px 26px;
            }}

            .title {{
                font-size: 26px;
            }}

            .otp {{
                font-size: 30px;
                letter-spacing: 6px;
            }}
        }}
    </style>
</head>

<body>

    <table role="presentation" width="100%" class="wrapper">
        <tr>
            <td>

                <table role="presentation" class="container">

                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <div class="brand">
                                NegoMind<span class="brand-mark"></span>
                            </div>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td class="content">

                            <p class="eyebrow">
                                Account verification
                            </p>

                            <h1 class="title">
                                Confirm it's you
                            </h1>

                            <p class="greeting">
                                Hello {user_display},
                            </p>

                            <p class="description">
                                We received a request to verify your email address
                                for your NegoMind account. Enter the verification
                                code below to continue.
                            </p>

                            <!-- Verification Code -->
                            <div class="code-wrapper">

                                <p class="code-label">
                                    Verification code
                                </p>

                                <p class="otp">
                                    {otp_code}
                                </p>

                                <p class="expiry">
                                    This code expires in 10 minutes.
                                </p>

                            </div>

                            <!-- Security Information -->
                            <p class="security-note">
                                For your security, never share this code with
                                anyone. NegoMind support will never ask you for
                                your verification code.
                            </p>

                            <p class="description" style="margin-top: 24px;">
                                If you didn't request this code, you can safely
                                ignore this email. No changes will be made to
                                your account.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer">

                            <p class="footer-text">
                                This is an automated security message from
                                NegoMind. Please do not reply to this email.
                            </p>

                            <p class="footer-text" style="margin-top: 8px;">
                                © NegoMind AI Platform
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
"""

def _send_smtp_sync(to_email: str, otp_code: str, name: str = "User") -> Tuple[bool, str]:
    if not settings.smtp_enabled:
        msg = "SMTP credentials not configured in backend .env. Operating in Console Log demo mode."
        logger.info(f"[SMTP DEMO LOG] {msg} OTP Code for {to_email}: {otp_code}")
        return False, msg

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{otp_code} is your NegoMind AI Verification Code"
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to_email

        plain_text = f"Hello {name},\n\nYour NegoMind AI OTP verification code is: {otp_code}\n\nThis code expires in 10 minutes."
        html_text = _build_html_template(to_email, otp_code, name)

        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_text, "html"))

        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10) as server:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USERNAME, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USERNAME, [to_email], msg.as_string())

        success_msg = f"Successfully dispatched email OTP to {to_email} via SMTP ({settings.SMTP_SERVER})."
        logger.info(success_msg)
        return True, success_msg

    except Exception as exc:
        err_msg = f"Failed to send email via SMTP ({type(exc).__name__}): {exc}"
        logger.error(err_msg)
        return False, err_msg

async def dispatch_otp_email_async(to_email: str, otp_code: str, name: str = "User") -> Tuple[bool, str]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _send_smtp_sync, to_email, otp_code, name)
