// const mongoose = require("mongoose");

// // Define the Employee Schema
// const employeeSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     department: {
//         type: String,

//         required: true
//     },
//     designation: {
//         type: String,
//         required: true
//     },
//     hrName: {
//         type: String,
        
//     },
//     joiningDate: {
//         type: Date,
        
//     },
//     currentProject: {
//         type: String,
        
//     }
// });

// // Create and export the Employee model
// const Employee = mongoose.model("Employee", employeeSchema);
// module.exports = Employee;
// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     department: { type: String, required: true },
//     designation: { type: String, required: true },
//     hrName: { type: String },
//     joiningDate: { type: Date },
//     currentProject: { type: String }
// });

// module.exports = mongoose.model("Employee", employeeSchema);
const mongoose = require("mongoose");

// Define Employee Schema
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    hrName: { type: String, default: "N/A" },
    joiningDate: { type: Date, default: Date.now },
    currentProject: { type: String, default: "N/A" }
});

// Create Model
const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee; // ✅ Ensure correct export
