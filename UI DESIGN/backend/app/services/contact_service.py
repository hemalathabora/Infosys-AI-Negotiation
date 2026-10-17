import os
import smtplib
import logging
import asyncio
from datetime import datetime, timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple, Dict, Any
from concurrent.futures import ThreadPoolExecutor

from app.config import settings

logger = logging.getLogger("contact_service")
executor = ThreadPoolExecutor(max_workers=3)

TARGET_CONTACT_EMAIL = "negomindai@gmail.com"

TOPIC_LABELS = {
    "product": "Product Information",
    "demo": "Request a Demo",
    "support": "Product Support",
    "partnership": "Partnership",
    "other": "General Inquiry / Something Else"
}

def _build_contact_html_template(name: str, email: str, topic: str, message: str) -> str:
    topic_label = TOPIC_LABELS.get(topic.lower(), topic.title())
    timestamp = datetime.now(timezone.utc).strftime("%B %d, %Y at %I:%M %p UTC")
    clean_message = message.replace("\n", "<br/>")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Request - NegoMind AI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #191A1C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E8E3D8;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #191A1C; padding: 40px 15px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #242526; border: 1px solid #3B3B39; border-radius: 8px; overflow: hidden; box-shadow: 0 20px 45px rgba(0,0,0,0.4);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #3B3B39; background-color: #1E1F21;">
                            <div style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #10B981; margin-bottom: 8px;">
                                &#9679; NegoMind AI &bull; Inbound Inquiry
                            </div>
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #F1EEE6; letter-spacing: -0.02em;">
                                New Contact Form Request
                            </h1>
                            <p style="margin: 6px 0 0 0; font-size: 13px; color: #8D8A82;">
                                Received on {timestamp}
                            </p>
                        </td>
                    </tr>

                    <!-- Details Table -->
                    <tr>
                        <td style="padding: 28px 32px 16px 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td width="35%" style="padding: 8px 0; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8D8A82;">
                                        Sender Name
                                    </td>
                                    <td width="65%" style="padding: 8px 0; font-size: 15px; font-weight: 600; color: #F1EEE6;">
                                        {name}
                                    </td>
                                </tr>
                                <tr>
                                    <td width="35%" style="padding: 8px 0; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8D8A82; border-top: 1px solid #333436;">
                                        Email Address
                                    </td>
                                    <td width="65%" style="padding: 8px 0; font-size: 15px; color: #38BDF8; border-top: 1px solid #333436;">
                                        <a href="mailto:{email}" style="color: #38BDF8; text-decoration: none; font-weight: 500;">{email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="35%" style="padding: 8px 0; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8D8A82; border-top: 1px solid #333436;">
                                        Topic / Area
                                    </td>
                                    <td width="65%" style="padding: 8px 0; font-size: 15px; color: #F59E0B; font-weight: 600; border-top: 1px solid #333436;">
                                        <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); padding: 3px 10px; border-radius: 4px; font-size: 13px;">
                                            {topic_label}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message Content -->
                            <div style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8D8A82; margin-bottom: 10px;">
                                Message
                            </div>
                            <div style="background-color: #191A1C; border: 1px solid #3B3B39; border-left: 3px solid #10B981; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6; color: #E8E3D8; white-space: pre-wrap;">
{clean_message}
                            </div>
                        </td>
                    </tr>

                    <!-- Action Button -->
                    <tr>
                        <td style="padding: 16px 32px 32px 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="mailto:{email}?subject=Re:%20NegoMind%20AI%20-%20{topic_label}" style="display: inline-block; background-color: #10B981; color: #064E3B; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; padding: 14px 28px; border-radius: 4px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
                                            Reply to {name} &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 32px; background-color: #1E1F21; border-top: 1px solid #3B3B39; text-align: center; font-size: 12px; color: #77736B;">
                            This email was automatically dispatched by the NegoMind AI Contact Engine to <strong style="color: #A9A49A;">{TARGET_CONTACT_EMAIL}</strong>.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""


def _send_contact_email_smtp_sync(name: str, email: str, topic: str, message: str) -> Tuple[bool, str]:
    """
    Synchronously transmits contact inquiry email to negomindai@gmail.com via SMTP.
    If SMTP credentials are not configured, logs the dispatch clearly.
    """
    topic_label = TOPIC_LABELS.get(topic.lower(), topic.title())
    subject = f"[NegoMind AI Contact] {name} - {topic_label}"

    if not settings.smtp_enabled:
        demo_msg = (
            f"[CONTACT EMAIL DEMO MODE] SMTP credentials not set in backend .env. "
            f"Message from '{name}' <{email}> for '{topic_label}' saved successfully. "
            f"Target destination: {TARGET_CONTACT_EMAIL}."
        )
        logger.info(demo_msg)
        logger.info(f"Message content:\n{message}")
        return True, demo_msg

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL or f"NegoMind AI Contact <{settings.SMTP_USERNAME}>"
        msg["To"] = TARGET_CONTACT_EMAIL
        msg["Reply-To"] = email

        text_content = (
            f"New Contact Form Submission - NegoMind AI\n\n"
            f"Sender Name: {name}\n"
            f"Sender Email: {email}\n"
            f"Topic: {topic_label}\n"
            f"Target: {TARGET_CONTACT_EMAIL}\n\n"
            f"Message:\n{message}\n"
        )
        html_content = _build_contact_html_template(name, email, topic, message)

        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=12) as server:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USERNAME, [TARGET_CONTACT_EMAIL], msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=12) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USERNAME, [TARGET_CONTACT_EMAIL], msg.as_string())

        success_msg = f"Inquiry from {email} successfully dispatched to {TARGET_CONTACT_EMAIL} via SMTP."
        logger.info(success_msg)
        return True, success_msg
    except Exception as exc:
        err_msg = f"SMTP transmission notice ({type(exc).__name__}): {exc}"
        logger.warning(err_msg)
        return False, err_msg


async def dispatch_contact_email(name: str, email: str, topic: str, message: str) -> Tuple[bool, str]:
    """Asynchronously dispatches contact inquiry in worker thread."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        executor,
        _send_contact_email_smtp_sync,
        name,
        email,
        topic,
        message
    )
