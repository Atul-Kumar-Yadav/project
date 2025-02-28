const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const Employee = require("./models/employee"); // ✅ Import Employee model
const TransferRequest = require("./models/TransferRequest");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}


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
// 🔹 Route to Serve the Login Page
app.get("/login", (req, res) => {
    res.render("login"); // Make sure you have a file named 'login.ejs' in the views folder
});

// 🔹 Login Page
// 🔹 Handle Login POST Request
// 🔹 Handle Login POST Request
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the employee by name (username)
        const employee = await Employee.findOne({ name: username });

        // If employee not found or password doesn't match
        if (!employee || employee.password !== password) {
            return res.render("login", { error: "Invalid credentials" });
        }

        // If login is successful, save user in session
        req.session.user = employee;

        // Render the next.ejs page with required data
        res.render("next", {
            title: "Enter Profile",
            designation: employee.designation || "",
            name: employee.name || "",
            department: employee.department || ""
        });
    } catch (error) {
        console.error("❌ Error logging in:", error);
        res.render("login", { error: "Internal Server Error" });
    }
});

app.get("/enter-profile", isAuthenticated, (req, res) => {
    res.render("next", { title: "Enter Profile", designation: "", name: "", department: "" });
});


// 🔹 Registration Page
app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// 🔹 Registration POST Route
// 🔹 Registration POST Route
app.post("/register", async (req, res) => {
    try {
        const { name, department, designation, hrName, joiningDate, currentProject, password } = req.body;

        // Check if all required fields are filled
        if (!name || !department || !designation || !password) {
            return res.render("register", { error: "All fields are required" });
        }

        // Check if the employee already exists
        const existingEmployee = await Employee.findOne({ name });
        if (existingEmployee) {
            return res.render("register", { error: "Employee already exists!" });
        }

        // Create a new employee
        const newEmployee = new Employee({
            name,
            department,
            designation,
            hrName: hrName || "N/A",
            joiningDate: joiningDate || new Date(),
            currentProject: currentProject || "N/A",
            password
        });

        // Save the employee to MongoDB
        await newEmployee.save();
        res.redirect("/login");
    } catch (error) {
        console.error("❌ Error registering employee:", error);
        res.render("register", { error: "Internal Server Error" });
    }
});


// 🔹 Save Employee Profile
app.post("/save-profile", isAuthenticated, async (req, res) => {
    console.log("Received Data:", req.body); // ✅ Debugging
    
    let { name, department, designation, hrName, joiningDate, currentProject } = req.body;

    if (Array.isArray(name)) {
        name = name.find(n => n.trim() !== "") || "N/A";
    }

    if (Array.isArray(designation)) {
        designation = designation[0]; // Ensure it's a single value
    }

    if (Array.isArray(currentProject)) {
        currentProject = currentProject.filter(cp => cp.trim() !== "").join(", ") || "N/A";
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
            currentProject
        });

        await newEmployee.save();
        res.json({ success: true, message: "Profile saved successfully!" });

    } catch (error) {
        console.error("❌ Error saving profile:", error);
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
app.post('/save-profile', (req, res) => {
    const { designation, name, department, hodName, currentProject, joiningDate } = req.body;

    // Save the data to MongoDB (or any other database)
    const newProfile = new Profile({
        designation,
        name,
        department,
        hodName,
        currentProject,
        joiningDate
    });

    newProfile.save()
        .then(() => {
            // Redirect to the saved details page
            res.render('savedDetails', {
                designation,
                name,
                department,
                hodName,
                currentProject,
                joiningDate
            });
        })
        .catch(err => {
            console.error("Error saving profile:", err);
            res.status(500).send("Error saving profile.");
        });
});
// Save Details Route
app.post("/save-and-display", (req, res) => {
    // Save employee details to database
    const { name, designation, department, currentProject } = req.body;

    // Store user data in session for future use
    req.session.user = { 
        name,
        designation,
        department,
        currentProject
    };

    // Redirect to Dashboard after saving
    res.redirect("/dashboard");
});

// Request Transfer Page Route
app.get('/request-transfer', (req, res) => {
    const { designation, department } = req.session.user; // Get department from session

    if (designation === 'Employee') {
        res.render('request-transfer', { 
            title: 'Request Transfer', 
            department: department  // Pass department to EJS
        });
    } else {
        res.status(403).send('Only employees can request a transfer.');
    }
});
// Handle Transfer Request Submission
app.post("/request-transfer", (req, res) => {
    const newRequest = new TransferRequest({
        employeeId: req.session.user._id,
        name: req.session.user.name,
        currentDept: req.body.currentDept,
        desiredDept: req.body.desiredDept,
        reason: req.body.reason
    });

    newRequest.save()
        .then(() => {
            res.redirect("/dashboard");
        })
        .catch(err => console.error(err));
});

// Dashboard Route
app.get("/dashboard", (req, res) => {
    if (req.session.user) {
        res.render("dashboard", {
            name: req.session.user.name,
            designation: req.session.user.designation
        });
    } else {
        res.redirect("/login");
    }
});
// Submit Transfer Request Route
app.post("/submit-transfer-request", (req, res) => {
    const { currentDepartment, desiredDepartment, reason } = req.body;

    // Save transfer request to database (example structure)
    const transferRequest = {
        name: req.session.user.name,
        currentDepartment,
        desiredDepartment,
        reason,
        status: "Pending"
    };

    // Save to DB (use your DB logic here)
    // Example: db.collection('transferRequests').insertOne(transferRequest);

    res.send("Transfer Request Submitted Successfully!");
});
app.get('/view-transfer-status', (req, res) => {
    const { designation } = req.session.user;

    if (designation === 'Employee') {
        res.render('transfer-status', { title: 'Transfer Status' });
    } else {
        res.status(403).send('Only employees can view transfer status.');
    }
});

// Start Server
app.listen(8080, () => {
    console.log("🚀 Server is running on port 8080");
});
