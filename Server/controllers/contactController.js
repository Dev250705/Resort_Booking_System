const Contact = require("../models/Contact");

exports.submitContactForm = async (req, res) => {
  try {
    const { title, firstName, lastName, email, phone, country, comments } = req.body;
    const newContact = new Contact({
      title, firstName, lastName, email, phone, country, comments
    });
    await newContact.save();
    res.status(201).json({ success: true, message: "Thank you for contacting us! We will get back to you shortly." });
  } catch (err) {
    console.error("Error submitting contact:", err);
    res.status(500).json({ success: false, message: "Server error submitting form" });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching contacts" });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(id, { status }, { new: true });
    if (!contact) return res.status(404).json({ message: "Message not found" });
    res.status(200).json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
};
