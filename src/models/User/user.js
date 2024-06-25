const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const validator = require("validator");
dotenv.config({ path: ".././src/config/config.env" });
const userSchema = new Schema({
  // title: {
  //   type: String,
  //   required: true,
  // },
  firstName: {
    type: String,
    // required: true,
  },
  // middleName: {
  //   type: String,
  //   required: true,
  // },
  lastName: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  password: {
    type: String,
    // required: true,
    select: false,
    //validation will be before saving to db
  },
  role: {
    type: String,
    enum: ["creator", "admin", "investor"],
    // default: "user",
  },
  profilePic: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: Number,
  },
  emailVerificationTokenExpires: {
    type: Date,
  },
  passwordResetToken: {
    type: Number,
  },
  passwordResetTokenExpires: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  provider: {
    type: String,
    enum: ["local", "google", "facebook"],
    default: "local",
  },
  accessToken: {
    type: String,
  },
  favCampaigns: [
    {
      type: Schema.Types.ObjectId,
      ref: "campaign",
    },
  ],

  isFeatured: {
    type: Boolean,
    default: false,
  },
});

//hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//jwtToken
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};

//compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("user", userSchema);

module.exports = User;
