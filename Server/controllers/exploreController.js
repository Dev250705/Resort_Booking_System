const ExploreContent = require("../models/ExploreContent");

exports.getContentByType = async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) return res.status(400).json({ message: "Type query parameter is required" });

    const content = await ExploreContent.find({ type }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, content });
  } catch (error) {
    console.error("Error fetching ExploreContent:", error);
    res.status(500).json({ message: "Server error fetching content" });
  }
};

exports.createContent = async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    
    if (!type || !title || !imageUrl) {
      return res.status(400).json({ message: "Missing required fields or image" });
    }

    const newItem = new ExploreContent({ type, title, description, imageUrl });
    await newItem.save();
    
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({ message: "Server error creating content" });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const item = await ExploreContent.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    
    res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ message: "Server error deleting content" });
  }
};
