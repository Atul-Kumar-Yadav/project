const mongoose = require("mongoose");

const transferRequestSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    currentDept: {
        type: String,
        required: true
    },
    desiredDept: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("TransferRequest", transferRequestSchema);
