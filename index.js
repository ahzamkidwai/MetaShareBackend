import express from "express";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/share/blog/:id", async (req, res) => {
  const blogId = req.params.id;
  const apiUrl = `https://blogs-ooi1.onrender.com/api/v1/blogs`;

  try {
    const response = await fetch(apiUrl);
    const allBlogs = await response.json();

    const blog = allBlogs.find((b) => b._id === blogId);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const blogUrl = `https://tri-legal-web.vercel.app/blogPost/${blogId}`;

    const imageUrl = blog.imageURL?.startsWith("http")
      ? blog.imageURL
      : "https://t3.ftcdn.net/jpg/01/07/15/58/360_F_107155820_NCUA4CtCkIDXXHnKAlWVzUvRjfMe0k5D.jpg";

    const metaDescription = blog.content
      .replace(/(<([^>]+)>)/gi, "")
      .slice(0, 150);

    const userAgent = req.get("User-Agent") || "";
    const isBot =
      /facebookexternalhit|Facebot|Twitterbot|Slackbot-LinkExpanding/i.test(
        userAgent
      );

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${blog.title}</title>

        <!-- Open Graph tags -->
        <meta property="og:title" content="${blog.title}" />
        <meta property="og:description" content="${metaDescription}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${blogUrl}" />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Tri Legal" />

        <!-- Twitter Cards -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${blog.title}" />
        <meta name="twitter:description" content="${metaDescription}" />
        <meta name="twitter:image" content="${imageUrl}" />

        <!-- Optional Canonical Link -->
        <link rel="canonical" href="${blogUrl}" />

        <!-- Conditional redirect: only for humans, not bots -->
        ${
          !isBot
            ? `<meta http-equiv="refresh" content="2;url=${blogUrl}" />`
            : ""
        }
      </head>
      <body>
        <p>Redirecting to blog...</p>
        ${!isBot ? `<script>window.location.href = "${blogUrl}";</script>` : ""}
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // e.g., "gmail", "SendGrid"
  auth: {
    user: process.env.EMAIL_USER, // Your email (e.g., lawfirm@gmail.com)
    pass: process.env.EMAIL_PASSWORD, // App password (for Gmail) or API key (SendGrid)
  },
});

app.post("/api/schedule-consultation", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;
  const errors = {};

  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!email) errors.email = "Email is required.";
  if (!phone) errors.phone = "Phone number is required.";
  if (!message) errors.message = "Message is required.";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }
  try {
    await transporter.sendMail({
      from: `"Website Form" <${process.env.EMAIL_USER}>`,
      to: process.env.LAW_FIRM_EMAIL,
      subject: `New Consultation Request from ${firstName} ${lastName}`,
      html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 12px auto; padding: 40px; background-color: #f9fafb; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">

    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="cid:logo" alt="Law Firm Logo" style="width: 100px; height: auto;" />
    </div>

    <!-- Header -->
    <header style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 32px; color: #CBA14A;">VidhiVidh</h1>
      <p style="margin: 8px 0 0; font-style: italic; font-size: 16px; color: #64748b;">Justice, Integrity, Expertise</p>
    </header>

    <!-- Title -->
    <section>
      <h2 style="color: #0f172a; font-size: 24px; margin-bottom: 10px;">📩 New Client Consultation Request</h2>
      <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">You’ve received a new consultation request from your website.</p>
    </section>

    <!-- Details Table -->
    <table style="width: 100%; font-size: 16px; color: #1e293b; background-color: #ffffff; border-radius: 6px; border-collapse: collapse; overflow: hidden; border: 1px solid #e2e8f0;">
      <tbody>
        <tr>
          <td style="padding: 12px 16px; font-weight: bold; background-color: #f1f5f9; width: 30%;">Name:</td>
          <td style="padding: 12px 16px;">${firstName} ${lastName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: bold; background-color: #f1f5f9;">Email:</td>
          <td style="padding: 12px 16px;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: bold; background-color: #f1f5f9;">Phone:</td>
          <td style="padding: 12px 16px;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: bold; background-color: #f1f5f9; vertical-align: top;">Message:</td>
          <td style="padding: 12px 16px; font-style: italic;">${message}</td>
        </tr>
      </tbody>
    </table>

    <!-- Sent Time -->
    <p style="margin-top: 20px; font-size: 14px; color: #64748b;">📅 Sent on: ${new Date().toLocaleString()}</p>

    <!-- Divider -->
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

    <!-- Footer -->
    <footer style="font-size: 14px; color: #475569; text-align: center;">
      <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} VidhiVidh Law Firm. All rights reserved.</p>
    </footer>

  </div>
  `,
      attachments: [
        {
          filename: "newLogo.jpeg",
          path: "./newLogo.jpeg",
          cid: "logo", // Used in <img src="cid:logo"/>
        },
      ],
    });

    await transporter.sendMail({
      from: `"${process.env.LAW_FIRM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank You for Reaching Out – ${process.env.LAW_FIRM_NAME}`,
      html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 20px auto; padding: 40px; background-color: #0B1C2C; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); color: white;">
    
    <!-- Logo at the top -->
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="cid:logo" alt="Law Firm Logo" style="width: 120px; height: auto;" />
    </div>

    <header style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 28px; color: #CBA14A;">${
        process.env.LAW_FIRM_NAME
      }</h1>
      <p style="font-size: 15px; color: #D1D5DB;">Justice. Integrity. Expertise.</p>
    </header>

    <section>
      <p style="font-size: 16px; color: #D9E0E8;">Dear <strong>${firstName}</strong>,</p>
      <p style="font-size: 16px; color: #D9E0E8; line-height: 1.6;">
        Thank you for reaching out to <strong style="color: #CBA14A;">${
          process.env.LAW_FIRM_NAME
        }</strong> for a legal consultation. 
        We have received your request and one of our representatives will contact you shortly to discuss your concern further.
      </p>
      <p style="font-size: 16px; color: #D9E0E8; line-height: 1.6;">
        <strong>Your Message:</strong><br/>
        <span style="font-style: italic; background-color: #1F2D3A; display: block; padding: 10px; border-radius: 6px; margin-top: 6px; color: white;">
          ${message}
        </span>
      </p>

      <p style="font-size: 16px; color: #D9E0E8; margin-top: 24px;">
        If you have any urgent queries, feel free to call us at the contact number mentioned on our website.
      </p>

      <p style="font-size: 16px; color: #D9E0E8; margin-top: 24px;">
        Best regards,<br/>
        <strong style="color: #CBA14A;">${
          process.env.LAW_FIRM_NAME
        }</strong><br/>
        Legal Team
      </p>
    </section>

    <footer style="margin-top: 40px; font-size: 13px; text-align: center; color: #94a3b8;">
      &copy; ${new Date().getFullYear()} ${
        process.env.LAW_FIRM_NAME
      }. All rights reserved.
    </footer>
  </div>
  `,
      attachments: [
        {
          filename: "newLogo.jpeg",
          path: "./newLogo.jpeg",
          cid: "logo", // Used in <img src="cid:logo" />
        },
      ],
    });

    res
      .status(200)
      .json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Hello Ji, Server is working fine.");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
