const nodemailer = require("nodemailer");

/**
 * Builds a modern, responsive HTML template for NegoMind AI OTP Verification Emails.
 */
function buildOtpTemplate(otp, name = "User") {
  const userDisplay = name && name.trim() ? name.trim() : "User";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Your NegoMind verification code</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111111;
            -webkit-font-smoothing: antialiased;
        }
        table {
            border-spacing: 0;
            border-collapse: collapse;
        }
        .wrapper {
            width: 100%;
            background-color: #f4f4f5;
            padding: 48px 20px;
        }
        .container {
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 14px;
            overflow: hidden;
        }
        .header {
            padding: 30px 36px;
            border-bottom: 1px solid #eeeeee;
            background-color: #ffffff;
        }
        .brand {
            font-size: 19px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: -0.4px;
            color: #111111;
        }
        .brand-mark {
            display: inline-block;
            width: 8px;
            height: 8px;
            margin-left: 5px;
            border-radius: 50%;
            background-color: #6366f1;
        }
        .content {
            padding: 42px 36px 36px;
        }
        .eyebrow {
            margin: 0 0 12px;
            font-size: 11px;
            line-height: 1.4;
            font-weight: 700;
            letter-spacing: 1.4px;
            text-transform: uppercase;
            color: #6366f1;
        }
        .title {
            margin: 0;
            font-size: 28px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: -0.8px;
            color: #111111;
        }
        .greeting {
            margin: 24px 0 0;
            font-size: 15px;
            line-height: 1.7;
            color: #333333;
        }
        .description {
            margin: 8px 0 0;
            font-size: 15px;
            line-height: 1.7;
            color: #555555;
        }
        .code-wrapper {
            margin: 30px 0;
            padding: 24px;
            text-align: center;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
        }
        .code-label {
            margin: 0 0 12px;
            font-size: 10px;
            line-height: 1.4;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #64748b;
        }
        .otp {
            margin: 0;
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 36px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: 10px;
            color: #0f172a;
        }
        .expiry {
            margin: 12px 0 0;
            font-size: 12px;
            line-height: 1.5;
            color: #64748b;
        }
        .security-note {
            margin: 0;
            padding: 16px 18px;
            border-left: 3px solid #6366f1;
            background-color: #f8fafc;
            font-size: 13px;
            line-height: 1.6;
            color: #475569;
            border-radius: 0 8px 8px 0;
        }
        .footer {
            padding: 24px 36px 30px;
            border-top: 1px solid #eeeeee;
            background-color: #ffffff;
        }
        .footer-text {
            margin: 0;
            font-size: 11px;
            line-height: 1.6;
            color: #888888;
        }
        @media only screen and (max-width: 600px) {
            .wrapper { padding: 20px 12px; }
            .header { padding: 24px; }
            .content { padding: 32px 24px 28px; }
            .footer { padding: 22px 24px 26px; }
            .title { font-size: 24px; }
            .otp { font-size: 30px; letter-spacing: 6px; }
        }
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
                                NegoMind AI<span class="brand-mark"></span>
                            </div>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content">
                            <p class="eyebrow">Account Security</p>
                            <h1 class="title">Confirm your identity</h1>
                            <p class="greeting">Hello ${userDisplay},</p>
                            <p class="description">
                                We received a request to verify your email address for your NegoMind AI account.
                                Enter the verification code below to complete sign in.
                            </p>

                            <!-- Verification Code -->
                            <div class="code-wrapper">
                                <p class="code-label">Verification Code</p>
                                <p class="otp">${otp}</p>
                                <p class="expiry">This code expires in 10 minutes.</p>
                            </div>

                            <!-- Security Note -->
                            <p class="security-note">
                                <strong>Security Tip:</strong> Never share this verification code with anyone.
                                NegoMind AI support will never ask for your code.
                            </p>

                            <p class="description" style="margin-top: 24px;">
                                If you did not request this verification code, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p class="footer-text">
                                This is an automated security message from NegoMind AI. Please do not reply directly to this email.
                            </p>
                            <p class="footer-text" style="margin-top: 8px;">
                                &copy; ${new Date().getFullYear()} NegoMind AI Platform. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    // ==========================================
    // 1. Check authentication
    // ==========================================

    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      authHeader !== `Bearer ${process.env.MAIL_SERVICE_SECRET}`
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ==========================================
    // 2. Get email & OTP data from request
    // Supports both `to` and `email` for recipient
    // ==========================================

    const {
      to,
      email,
      otp,
      name,
      userName,
      subject: customSubject,
      text: customText,
      html: customHtml,
      fromName = "NegoMind AI",
    } = req.body;

    const recipient = to || email;
    const recipientName = name || userName || "User";

    // ==========================================
    // 3. Validate request
    // ==========================================

    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: "Recipient email (to or email) is required",
      });
    }

    if (!otp && !customText && !customHtml) {
      return res.status(400).json({
        success: false,
        message: "Either otp, text, or html content is required",
      });
    }

    // ==========================================
    // 4. Template & Content Resolution
    // ==========================================

    let subject = customSubject;
    let htmlContent = customHtml;
    let textContent = customText;

    if (otp) {
      // Auto-render built-in template when OTP is supplied
      if (!subject) {
        subject = `${otp} is your NegoMind AI Verification Code`;
      }
      if (!htmlContent) {
        htmlContent = buildOtpTemplate(otp, recipientName);
      }
      if (!textContent) {
        textContent = `Hello ${recipientName},\n\nYour NegoMind AI verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
      }
    }

    // ==========================================
    // 5. SMTP configuration
    // ==========================================

    const senderEmail = process.env.MAIL_USERNAME;

    if (!senderEmail) {
      throw new Error("MAIL_USERNAME is not configured");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 587,
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: senderEmail,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // ==========================================
    // 6. Send email
    // ==========================================

    const info = await transporter.sendMail({
      from: `"${fromName}" <${senderEmail}>`,
      to: recipient,
      subject: subject,
      text: textContent || undefined,
      html: htmlContent || undefined,
    });

    // ==========================================
    // 7. Return success response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });

  } catch (error) {
    // Log detailed error on server
    console.error("EMAIL ERROR:", error);

    // Don't expose sensitive SMTP details
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};
