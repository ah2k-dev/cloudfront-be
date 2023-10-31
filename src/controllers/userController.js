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
      instagramUsername,
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
      instagramUsername,
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
      instagramUsername,
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
          instagramUsername,
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

const getTransactions = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { role } = req.user;

    const searchFilter = req.body.search
      ? {
          $or: [
            {
              title: {
                $regex: req.body.search,
                $options: "i",
              },
            },
            {
              shortDesc: {
                $regex: req.body.search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const categoryFilter =
      req.body.categoryArray && req.body.categoryArray.length > 0
        ? {
            projectCategory: {
              $in: req.body.categoryArray,
            },
          }
        : {};
        
        
    if (role == "investor") {
      const transactions = await Investment.find({
        investor: req.user._id,
      });

      Promise.all(
        transactions.map(async (transaction) => {
          const campaign = await Project.findOne({
            investment: {
              $in: [transaction._id],
            },
          }).populate("creator");

          return {
            ...transaction._doc,
            campaignTitle: campaign.title,
            campaignCreator: campaign.creator,
            campaignId: campaign._id,
          };
        })
      ).then((data) => {
        return SuccessHandler(
          {
            message: `Data fetched successfully!`,
            transactions: data,
          },
          200,
          res
        );
      });
    } else if (role == "creator") {
      console.log("I am creator");
      // let creditedTransactions = await Project.aggregate([
      //   {
      //     $match: {
      //       creator: req.user._id,
      //       isActive: true,
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "investments",
      //       localField: "investments",
      //       foreignField: "_id",
      //       as: "investments",
      //     },
      //   },
      //   {
      //     $unwind: "$investments",
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "investments.investor",
      //       foreignField: "_id",
      //       as: "investments.investor",
      //     },
      //   },
      //   {
      //     $unwind: "$investments.investor",
      //   },
      //   {
      //     $project: {
      //       investments: {
      //         $map: {
      //           input: "$investments",
      //           as: "investment",
      //           // $addFields: {
      //           //   campaignTitle: "$title",
      //           //   campaignId: "$_id",
      //           // },
      //         },
      //       },
      //     },
      //   },
      // ]);

      // creditedTransactions = creditedTransactions.reduce(
      //   (acc, campaign) => [...acc, ...campaign.investments],
      //   []
      // );

      // let debitedTransactions = await Project.aggregate([
      //   {
      //     $match: {
      //       creator: req.user._id,
      //       isActive: true,
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "investments",
      //       localField: "investments",
      //       foreignField: "_id",
      //       as: "investments",
      //     },
      //   },
      //   {
      //     $unwind: "$investments",
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "investments.investor",
      //       foreignField: "_id",
      //       as: "investments.investor",
      //     },
      //   },
      //   {
      //     $unwind: "$investments.investor",
      //   },
      //   {
      //     $project: {
      //       investments: {
      //         $map: {
      //           input: "$investments",
      //           as: "investment",
      //           cond: {
      //             $eq: ["$$investment.investor.role", "creator"],
      //           },
      //           // $addFields: {
      //           //   campaignTitle: "$title",
      //           //   campaignId: "$_id",
      //           // },

      //         },
      //       },
      //     },
      //   },
      // ]);

      // debitedTransactions = debitedTransactions.reduce(
      //   (acc, campaign) => [...acc, ...campaign.investments],
      //   []
      // );

      const campaigns = await Project.find({
        creator: req.user._id,
        isActive: true,
      }).populate({
        path: "investment",
        populate: {
          path: "investor",
          select: "firstName lastName email role createdAt profilePic",
        },
      });

      let allInvestments = [];

      // console.log(campaigns);

      campaigns.forEach((campaign) => {
        campaign.investment.forEach((investment) => {
          allInvestments.push({
            ...investment._doc,
            campaignTitle: campaign.title,
            campaignId: campaign._id,
            campaignCreator: campaign.creator,
          });
        });
      });

      return SuccessHandler(
        {
          message: `Data fetched successfully!`,
          transactions: allInvestments,
        },
        200,
        res
      );
      // return ErrorHandler(`Error fetching data! Under working`, 400, req, res);
    } else if (role == "admin") {
      const transactions = await Investment.find({}).populate({
        path: "investor",
        select: "firstName lastName email role createdAt profilePic",
      });

      Promise.all(
        transactions.map(async (transaction) => {
          const campaign = await Project.findOne({
            investment: {
              $in: [transaction._id],
            },
          }).populate("creator");
          console.log(campaign);
          return {
            ...transaction._doc,
            campaignTitle: campaign.title,
            campaignId: campaign._id,
            campaignCreator: campaign.creator,
          };
        })
      ).then((data) => {
        return SuccessHandler(
          {
            message: `Data fetched successfully!`,
            payouts: data.filter(
              (transaction) => transaction.payoutStatus == true
            ),
            investments: data.filter(
              (transaction) => transaction.payoutStatus == false
            ),
          },
          200,
          res
        );
      });
    } else {
      return ErrorHandler(`Error fetching data!`, 400, req, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getAllInvestors = async (req, res) => {
  // #swagger.tags = ['user']

  const profilePerPage = 3;
  const pageNumber = Number(req.query.page) || 1;
  const skipProfiles = (pageNumber - 1) * profilePerPage;

  try {
    let investors;
    if (req.body.firstName || req.body.lastName) {
      investors = await investorProfile
        .find({ investor: { $ne: null } })
        .populate({
          path: "investor",
          match: {
            // _id: { $ne: null },
            firstName: {
              $regex: req.body.firstName,
              $options: "i",
            },
          },
        })
        .sort({ createdAt: -1 });
      console.log("Filter");
    } else {
      console.log("No Filter");
      investors = investors = await investorProfile
        .find()
        .populate("investor")
        .sort({ createdAt: -1 })
        .skip(skipProfiles)
        .limit(profilePerPage);
    }

    const countInvestors = investors.length;
    return SuccessHandler(
      {
        message: `Investors fetched successfully!`,
        countInvestors,
        investors: investors,
        // filterInvestors,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getAllCreators = async (req, res) => {
  // #swagger.tags = ['user']

  const profilePerPage = 8;
  const pageNumber = Number(req.query.page) || 1;
  const skipProfiles = (pageNumber - 1) * profilePerPage;

  const firstNameFilter = req.body.firstName
    ? {
        firstName: {
          $regex: req.body.firstName,
          $options: "i",
        },
      }
    : {};

  try {
    const creatorsCount = await creatorProfile.countDocuments();
    const creators = await creatorProfile
      .find()
      .populate("creator")
      .skip(skipProfiles)
      .limit(profilePerPage);

    return SuccessHandler(
      {
        message: `Creators fetched successfully!`,
        creatorsCount,
        creators: creators,
        filterInvestors,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getInvestorProfile = async (req, res) => {
  // #swagger.tags = ['user']
  const investorId = req.params.id;

  try {
    const investor = await investorProfile
      .findOne({ investor: investorId })
      .populate("investor");
    if (!investor) {
      return ErrorHandler("Investor Profile does not exist", 500, req, res);
    }

    return SuccessHandler(
      {
        message: `Investor Profile fetched successfully!`,
        investor,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getCreatorProfile = async (req, res) => {
  // #swagger.tags = ['user']
  const creatorId = req.params.id;

  try {
    const creator = await creatorProfile
      .findOne({ creator: creatorId })
      .populate("creator");
    if (!creator) {
      return ErrorHandler("Creator Profile does not exist", 500, req, res);
    }

    return SuccessHandler(
      {
        message: `Creator Profile fetched successfully!`,
        creator,
      },
      200,
      res
    );
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
  getTransactions,
  getAllInvestors,
  getAllCreators,
  getInvestorProfile,
  getCreatorProfile,
};
