const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const Employee = require("./models/employee"); // ✅ Import Employee model

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Session Middleware
app.use(
    session({
        secret: "your_secret_key", // Change this to a secure random string
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set to true if using HTTPS
    })
);

// MongoDB Connection
async function connectDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/ETS");
        console.log("✅ Database connected successfully");
    } catch (err) {
        console.error("❌ Database connection error:", err);
    }
}
connectDB();

// ✅ Authentication Middleware
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// 🔹 Root Route
app.get("/", (req, res) => {
    res.render("begin");
});

app.get("/begin", (req, res) => {
    res.render("begin");
});

// 🔹 Login Page
app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// 🔹 Registration Page
app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// 🔹 Registration POST Route
app.post("/register", async (req, res) => {
    try {
        const { name, department, designation, hrName, joiningDate, currentProject } = req.body;

        if (!name || !department || !designation) {
            return res.render("register", { error: "All fields are required" });
        }

        const existingEmployee = await Employee.findOne({ name });
        if (existingEmployee) {
            return res.render("register", { error: "Employee already exists!" });
        }

        const newEmployee = new Employee({
            name,
            department,
            designation,
            hrName: hrName || "N/A",
            joiningDate: joiningDate || new Date(),
            currentProject: currentProject || "N/A",
        });

        await newEmployee.save();
        res.redirect("/login");
    } catch (error) {
        console.error("❌ Error registering employee:", error);
        res.render("register", { error: "Internal Server Error" });
    }
});

// 🔹 Login POST Route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Dummy authentication (Replace this with real database validation)
    if (username === "admin" && password === "1234") {
        req.session.user = username;
        return res.redirect("/enter-profile");
    } else {
        return res.render("login", { error: "Invalid credentials" });
    }
});

// 🔹 Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// 🔹 Employee Profile Entry (Protected Route)
app.get("/enter-profile", isAuthenticated, (req, res) => {
    res.render("next", { title: "Enter Profile", designation: "", name: "", department: "" });
});

// 🔹 Save Employee Profile
app.post("/save-profile", isAuthenticated, async (req, res) => {
    console.log("Received Data:", req.body); // ✅ Debugging
    
    let { name, department, designation, hrName, joiningDate, currentProject } = req.body;

    if (Array.isArray(designation)) {
        designation = designation[0]; // Ensure it's a single value
    }

    if (!name || !department || !designation) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const newEmployee = new Employee({
            name,
            department,
            designation,
            hrName: hrName || "N/A",
            joiningDate: joiningDate || new Date(),
            currentProject: currentProject || "N/A",
        });

        await newEmployee.save();
        res.json({ success: true, message: "Profile saved successfully!" });

    } catch (error) {
        console.error("❌ Error saving profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// 🔹 Search Employee Profile
app.get("/search-profile", async (req, res) => {
    try {
        const searchName = req.query.name;
        const employee = await Employee.findOne({ name: new RegExp(searchName, "i") });

        if (employee) {
            res.json({ success: true, data: employee });
        } else {
            res.json({ success: false, message: "Profile not found" });
        }
    } catch (error) {
        console.error("❌ Error searching profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// 🔹 Display Employee List
app.get("/employees", isAuthenticated, async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render("employees", { employees });
    } catch (error) {
        console.error("❌ Error fetching employees:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Start Server
app.listen(8080, () => {
    console.log("🚀 Server is running on port 8080");
});
