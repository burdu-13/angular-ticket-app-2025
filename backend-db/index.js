const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Company = require("./company.model");
const cors = require("cors");
const User = require("./user.model");
const jwt = require("jsonwebtoken");
const Event = require("./event.model");

const app = express();

app.use(cors());
app.use(express.json());

const mongoURI =
  "mongodb+srv://burdu13:yy8BGrjQ5KE7e8mE@burducluster.lyoct.mongodb.net/userDB?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("Error connecting to Atlas:", err);
  });

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, "kodi", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

app.post("/users", async (req, res) => {
  try {
    const { userType, name, username, birthdate, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userType,
      name,
      username,
      birthdate,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, userType: user.userType }, "kodi", { expiresIn: "1h" });

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

app.put("/users/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: updatedUser._id,
      userType: updatedUser.userType,
      name: updatedUser.name,
      username: updatedUser.username,
      birthdate: updatedUser.birthdate,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});

app.post("/companies", authenticateJWT, async (req, res) => {
  try {
    const { companyName, employeeEmail, employeeName, password } = req.body;

    if (!companyName || !employeeEmail || !employeeName || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userId = req.user.userId;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCompany = new Company({
      companyName,
      employeeEmail,
      employeeName,
      password: hashedPassword,
      user: userId,
    });

    await newCompany.save();
    res.status(201).json(newCompany);
  } catch (error) {
    console.error("Error registering company:", error);
    res
      .status(500)
      .json({ message: "Error registering company", error: error.message });
  }
});

app.get("/companies", authenticateJWT, async (req, res) => {
  try {
    if (req.query.userId) {
      const userId = req.query.userId;
      const companies = await Company.find({ user: userId });

      if (!companies || companies.length === 0) {
        return res.status(404).json({ message: "No companies found for this user" });
      }

      res.status(200).json(companies);
    } else {
      if (!req.user || req.user.userType !== 'Admin') {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      const companies = await Company.find();
      res.status(200).json(companies);
    }
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Error fetching companies", error: error.message });
  }
});

app.post("/events", authenticateJWT, async (req, res) => {
  try {
    const {
      eventName,
      eventDate,
      eventCategory,
      eventCompany,
      eventDescription,
      eventImageUrl,
      ticketTiers,
    } = req.body;

    const newEvent = new Event({
      name: eventName,
      date: new Date(eventDate),
      category: eventCategory,
      description: eventDescription,
      imgUrl: eventImageUrl,
      ticketTiers: ticketTiers || [],
      companyName: eventCompany,
      isSalesSuspended: false,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error adding event:", error);
    res
      .status(500)
      .json({ message: "Error adding event", error: error.message });
  }
});

app.put("/events/:id/ticketTiers", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { ticketTiers } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.ticketTiers = ticketTiers;
    await event.save();

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket tiers", error });
  }
});

app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
});

app.put("/events/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const requiredFields = ["name", "date", "description", "imgUrl"];
    const missingFields = requiredFields.filter((field) => !updates[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error });
  }
});

app.delete("/events/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
