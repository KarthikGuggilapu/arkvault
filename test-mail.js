const nodemailer = require("nodemailer");

async function main() {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "webservice2630@gmail.com",
      pass: "xilrrdnanpmelsgs",
    },
  });

  let info = await transporter.sendMail({
    from: '"Test" <your@gmail.com>',
    to: "karthikguggillapu@gmail.com",
    subject: "Test Email",
    text: "This is a test email.",
  });

  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);