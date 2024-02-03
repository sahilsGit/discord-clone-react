import nodemailer from "nodemailer";
import MailGen from "mailgen";

const emailVerificationMailContent = (username, unHashedCode) => {
  return {
    body: {
      name: username,
      intro: `Welcome to our app! We're very excited to have you on board.
      To verify your email please use this code: ${unHashedCode}
      
      `,
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const forgotPasswordMailContent = (username, unHashedCode) => {
  return {
    body: {
      name: username,
      intro: `Here's the one time password you requested: ${unHashedCode}.
      Please use this to reset your password.
      `,
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const sendEmail = async (options) => {
  const mailGenerator = new MailGen({
    theme: "default",
    product: {
      name: "FreeAPI",
      link: "https://freeapi.app",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.content);

  // Generate an HTML email with the provided contents
  const emailHtml = mailGenerator.generate(options.content);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_MAIL,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "discordClone@mail.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      // Ingulf error as it's not critical for business logic
    }
  });
};

export { emailVerificationMailContent, sendEmail, forgotPasswordMailContent };
