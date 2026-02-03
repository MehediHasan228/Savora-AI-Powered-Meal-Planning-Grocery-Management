const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    category: {
        type: String,
        default: 'General',
        trim: true
    },
    qty: {
        type: String,
        required: [true, 'Quantity is required']
    },
    expiry: {
        type: String, // ISO date string
        default: ''
    },
    status: {
        type: String,
        enum: ['Fresh', 'Expiring Soon', 'Expired'],
        default: 'Fresh'
    },
    location: {
        type: String,
        enum: ['Pantry', 'Fridge', 'Freezer'],
        default: 'Pantry'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for now, will link to real users soon
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
