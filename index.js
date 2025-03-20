const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect("mongodb+srv://testuser:testuser@cluster0.qpuzj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Email Schema
const EmailSchema = new mongoose.Schema({
  recipient: String,
  sender: String,
  subject: String,
  body: String,
  receivedAt: { type: Date, default: Date.now },
  expireAt: { type: Date, expires: 7200, default: Date.now }, // Auto-delete after 2 hours
});

const Email = mongoose.model("Email", EmailSchema);

// Webhook to Receive Emails from Postfix
app.post("/webhook/email", async (req, res) => {
  try {
    const { recipient, sender, subject, email } = req.body;
    
    const newEmail = new Email({
      recipient,
      sender,
      subject,
      body: email,
    });

    await newEmail.save();
    res.json({ message: "Email stored successfully!" });
  } catch (error) {
    console.error("Error saving email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch Emails by Recipient
app.get("/emails/:recipient", async (req, res) => {
  try {
    const recipient = req.params.recipient;
    const emails = await Email.find({ recipient }).sort({ receivedAt: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

