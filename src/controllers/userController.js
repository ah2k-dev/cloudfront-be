const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const User = require("../models/User/user");
const investorProfile = require("../models/User/investorProfile");
const creatorProfile = require("../models/User/creatorProfile");
const { findOneAndUpdate } = require("../models/User/user");
const updatePassword = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { currentPassword, newPassword } = req.body;
    if (
      !newPassword.match(
        /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/
      )
    ) {
      return ErrorHandler(
        "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character",
        400,
        req,
        res
      );
    }
    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ErrorHandler("Invalid credentials", 400, req, res);
    }
    const samePasswords = await user.comparePassword(newPassword);
    if (samePasswords) {
      return ErrorHandler(
        "New password cannot be same as old password",
        400,
        req,
        res
      );
    }
    user.password = newPassword;
    await user.save();
    return SuccessHandler("Password updated successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const completeInvestorProfile = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const {
      country,
      state,
      city,
      streetAddress,
      postalCode,
      phoneNumber,
      dob,
      preferredLanguage,
      nationality,
      occupation,
      investmentExperience,
      musicGenres,
      reference,
      termsAndConditions,
      privacyPolicy,
    } = req.body;
    const prvProfile = await investorProfile.findOne({
      investor: req.user._id,
    });
    if (prvProfile) {
      return ErrorHandler(
        "Profile already exists. Update instead of creating new",
        403,
        req,
        res
      );
    }
    const newProfile = new investorProfile({
      investor: req.user._id,
      city,
      country,
      dob,
      investmentExperience,
      musicGenres,
      nationality,
      phoneNumber,
      postalCode,
      preferredLanguage,
      privacyPolicy,
      state,
      streetAddress,
      termsAndConditions,
      occupation,
      reference,
    });
    await newProfile.save();
    return SuccessHandler("Profile created successfully", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const completeCreatorProfile = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const {
      bandName,
      country,
      state,
      city,
      streetAddress,
      postalCode,
      phoneNumber,
      dob,
      preferredLanguage,
      nationality,
      musicGenres,
      socialMediaLinks,
      website,
      termsAndConditions,
      privacyPolicy,
    } = req.body;

    const prvProfile = await creatorProfile.findOne({ creator: req.user._id });
    if (prvProfile) {
      return ErrorHandler(
        "Profile already exists. Update instead of creating new",
        403,
        req,
        res
      );
    }
    const newProfile = new creatorProfile({
      creator: req.user._id,
      bandName,
      country,
      state,
      city,
      streetAddress,
      postalCode,
      phoneNumber,
      dob,
      preferredLanguage,
      nationality,
      musicGenres,
      socialMediaLinks,
      website,
      termsAndConditions,
      privacyPolicy,
    });
    await newProfile.save();
    return SuccessHandler("Profile created!", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateInvestorProfile = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const {
      country,
      state,
      city,
      streetAddress,
      postalCode,
      phoneNumber,
      dob,
      preferredLanguage,
      nationality,
      occupation,
      investmentExperience,
      musicGenres,
      reference,
      termsAndConditions,
      privacyPolicy,
    } = req.body;
    const updated = await findOneAndUpdate(
      { investor: req.user._id },
      {
        $set: {
          country,
          state,
          city,
          streetAddress,
          postalCode,
          phoneNumber,
          dob,
          preferredLanguage,
          nationality,
          occupation,
          investmentExperience,
          musicGenres,
          reference,
          termsAndConditions,
          privacyPolicy,
        },
      }
    );
    if (!updated) {
      return ErrorHandler("Error updating profile", 400, req, res);
    }
    return SuccessHandler("Profile updated!", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateCreatorProfile = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const {
      bandName,
      country,
      state,
      city,
      streetAddress,
      postalCode,
      phoneNumber,
      dob,
      preferredLanguage,
      nationality,
      musicGenres,
      socialMediaLinks,
      website,
      termsAndConditions,
      privacyPolicy,
    } = req.body;
    const updated = await findOneAndUpdate({
      creator: req.user._id,
      bandName,
      country,
      state,
      city,
      streetAddress,
      postalCode,
      phoneNumber,
      dob,
      preferredLanguage,
      nationality,
      musicGenres,
      socialMediaLinks,
      website,
      termsAndConditions,
      privacyPolicy,
    });
    if (!updated) {
      return ErrorHandler("Error updating profile", 400, req, res);
    }
    return SuccessHandler("Profile updated!", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getProfile = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    if (req.user.role == "investor") {
      const profile = await investorProfile
        .findOne({
          investor: req.user._id,
        })
        .populate({
          path: "user",
          select: "firstName lastName middleName email role createdAt",
        });
      if (!profile) {
        return ErrorHandler(
          "No profile found. Complete your profile!",
          400,
          req,
          res
        );
      }
      return SuccessHandler(
        { message: "Profile fetched!", profile: profile },
        200,
        res
      );
    }
    if (req.user.role == "creator") {
      const profile = await creatorProfile
        .findOne({
          investor: req.user._id,
        })
        .populate({
          path: "user",
          select: "firstName lastName middleName email role createdAt",
        });
      if (!profile) {
        return ErrorHandler(
          "No profile found. Complete your profile!",
          400,
          req,
          res
        );
      }
      return SuccessHandler(
        { message: "Profile fetched!", profile: profile },
        200,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  updatePassword,
  completeInvestorProfile,
  completeCreatorProfile,
  updateCreatorProfile,
  updateInvestorProfile,
  getProfile,
};
