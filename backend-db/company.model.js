const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true },
  employeeEmail: { type: String, required: true, unique: true },
  employeeName: { type: String, required: true },
  password: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
