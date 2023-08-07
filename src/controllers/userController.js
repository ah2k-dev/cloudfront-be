const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const User = require("../models/User/user");
const investorProfile = require("../models/User/investorProfile");
const creatorProfile = require("../models/User/creatorProfile");
const { findOneAndUpdate } = require("../models/User/user");
const Project = require("../models/Campaign/projects");
const Investment = require("../models/Campaign/investments");
const { Mongoose } = require("mongoose");
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
      profilepic,
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
    await User.findByIdAndUpdate(req.user._id, {
      profilePic: profilepic,
      // isProfileComplete: true,
    });
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
      iban,
      profilepic,
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
      iban,
    });
    await newProfile.save();
    await User.findByIdAndUpdate(req.user._id, {
      profilePic: profilepic,
      // isProfileComplete: true,
    });
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
      profilepic,
    } = req.body;
    const updated = await investorProfile.findOneAndUpdate(
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
    console.log(updated);
    await User.findByIdAndUpdate(req.user._id, {
      profilePic: profilepic,
    });
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
      iban,
      profilepic,
    } = req.body;
    const updated = await creatorProfile.findOneAndUpdate(
      {
        creator: req.user._id,
      },
      {
        $set: {
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
          iban,
        },
      }
    );
    console.log(updated);
    await User.findByIdAndUpdate(req.user._id, {
      profilePic: profilepic,
    });
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
          path: "investor",
          select: "firstName lastName email role createdAt profilePic",
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
          creator: req.user._id,
        })
        .populate({
          path: "creator",
          select: "firstName lastName email role createdAt profilePic",
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

const globalSearch = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { search } = req.body;
    const searchFilter_1 = search
      ? {
          $or: [
            {
              title: {
                $regex: search,
                $options: "i",
              },
            },
            {
              firstName: {
                $regex: search,
                $options: "i",
              },
            },
            {
              middleName: {
                $regex: search,
                $options: "i",
              },
            },
            {
              lastName: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
      : {};
    const searchFilter_2 = search
      ? {
          title: {
            $regex: search,
            $options: "i",
          },
        }
      : {};

    const campaigns = await Project.find({
      ...searchFilter_2,
      isActive: true,
    })
      .populate("investment")
      .populate("creator", "title firstName lastName middleName profilePic")
      .sort({ title: 1 });

    const userProfiles = await User.find({
      ...searchFilter_1,
      role: req.user.role == "investor" ? "creator" : "investor",
      isActive: true,
    })
      .select("firstName title lastName middleName profilePic email")
      .sort({ title: 1 });

    if (!campaigns || !userProfiles) {
      return ErrorHandler(`Error fetching data!`, 400, req, res);
    }
    return SuccessHandler(
      { message: `Data fetched successfully!`, campaigns, userProfiles },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const userStats = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { role } = req.user;
    if (role == "investor") {
      const transactions = await Investment.find({
        investor: req.user._id,
      });

      const campaginsWithInvestments = await Project.aggregate([
        {
          $match: {
            isActive: true,
            investments: {
              $in: transactions.map((transaction) =>
                Mongoose.Types.ObjectId(transaction._id)
              ),
            },
          },
        },
        {
          $lookup: {
            from: "investments",
            localField: "investments",
            foreignField: "_id",
            as: "investments",
          },
        },
        {
          $unwind: "$investments",
        },
        {
          lookup: {
            from: "users",
            localField: "creator",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $unwind: "$creator",
        },
        {
          $project: {
            title: 1,
            shortDesc: 1,
            detailedDesc: 1,
            fundingGoal: 1,
            duration: 1,
            projectCategory: 1,
            imageUrl: 1,
            rewards: 1,
            additionalImageUrls: 1,
            termsAndConditions: 1,
            status: 1,
            creator: 1,
            createdAt: 1,
            investments: {
              $filter: {
                input: "$investments",
                as: "investment",
                cond: {
                  $eq: ["$$investment.investor", req.user._id],
                },
              },
            },
          },
        },
      ]);
      const totalInvestmentAmount = transactions.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      );

      return SuccessHandler(
        {
          message: `Data fetched successfully!`,
          transactions,
          campaginsWithInvestments,
          totalInvestmentAmount,
        },
        200,
        res
      );
    } else if (role == "creator") {
      const campaigns = await Project.find({
        creator: req.user._id,
      }).populate("investments");

      const totalFunding = campaigns.reduce(
        (acc, campaign) =>
          acc +
          campaign.investments.reduce(
            (acc, investment) => acc + investment.amount,
            0
          ),
        0
      );

      return SuccessHandler(
        {
          message: `Data fetched successfully!`,
          campaigns,
          totalFunding,
        },
        200,
        res
      );
    } else {
      return ErrorHandler(`Error fetching data!`, 400, req, res);
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
  globalSearch,
  userStats,
};
