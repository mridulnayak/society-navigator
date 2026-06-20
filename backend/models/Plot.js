const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g., "B-10/17"
    name: { type: String, default: "" },                // e.g., "Sharma Residence"
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates!

module.exports = mongoose.model('Plot', plotSchema);