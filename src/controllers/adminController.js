const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const Project = require("../models/Campaign/projects");
const User = require("../models/User/user");
const investorProfile = require("../models/User/investorProfile");
const Investment = require("../models/Campaign/investments");
const creatorProfile = require("../models/User/creatorProfile");
const WebDetails = require("../models/Website/webDetails");

const dotenv = require("dotenv");

dotenv.config({
  path: "./src/config/config.env",
});

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// campaigns

const approveCampaign = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { id } = req.params;
    const updated = await Project.findByIdAndUpdate(id, {
      $set: {
        status: "approved",
      },
    });
    if (!updated) {
      return ErrorHandler("Error approving campaign", 400, req, res);
    }
    return SuccessHandler("Campaign approved!", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getCampaigns = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const statusFilter = req.body.statusFilter
      ? {
          status: req.body.statusFilter,
        }
      : {};
    const searchFilter = req.body.searchFilter
      ? {
          title: {
            $regex: req.body.search,
            $options: "i",
          },
        }
      : {};
    // const pipeLine = [
    //   {
    //     $match: {
    //       ...statusFilter,
    //       ...searchFilter,
    //     },
    //   },
    // ];
    const campaigns = await Project.find({
      ...statusFilter,
      ...searchFilter,
      isActive: true,
    })
      .populate({
        path: "creator",
        select: "firstName middleName lastName profilePic email",
      })
      .populate({
        path: "investment",
        populate: "investor",
      });

    if (!campaigns) {
      return ErrorHandler("Error fetching campaigns", 400, req, res);
    }
    return SuccessHandler(
      {
        message: "Campaigns fetched!",
        campaigns,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const rejectCampaign = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { id } = req.params;
    const updated = await Project.findByIdAndUpdate(id, {
      $set: {
        status: "rejected",
      },
    });
    if (!updated) {
      return ErrorHandler("Error approving campaign", 400, req, res);
    }
    return SuccessHandler("Campaign rejected!", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const editCampaign = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const {
      id,
      title,
      shortDesc,
      detailedDesc,
      fundingGoal,
      duration,
      projectCategory,
      imageUrl,
      videoUrl,
      rewards,
      creatorBio,
      socialMediaLinks,
      additionalImageUrls,
      termsAndConditions,
    } = req.body;
    const updated = await Project.findByIdAndUpdate(id, {
      $set: {
        title,
        shortDesc,
        detailedDesc,
        fundingGoal,
        duration,
        projectCategory,
        imageUrl,
        videoUrl,
        rewards,
        creatorBio,
        socialMediaLinks,
        additionalImageUrls,
        termsAndConditions,
      },
    });
    if (!updated) {
      return ErrorHandler("Error updating campaign!", 400, req, res);
    }
    return SuccessHandler("Campaign updated!", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const deleteCampaign = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { id } = req.params;
    const deleted = await Project.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: false,
        },
      },
      { new: true }
    );
    if (!deleted) {
      return ErrorHandler("Error deleting campaign", 400, req, res);
    }
    return SuccessHandler({ message: "Campaign deleted!", deleted }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const releaseFunds = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { id } = req.params;
    const campaign = await Project.findById(id).populate("investment");
    const excreatorProfile = await creatorProfile.findOne({
      creator: campaign.creator,
    });
    if (excreatorProfile.iban) {
      const investments = campaign.investment;
      if (investments.length > 0) {
        await Promise.all(
          investments.map(async (val, ind) => {
            // capture charge
            // const capturedCharge = await stripe.charges.capture(val.chargeId); conflict here. explanation for capture:false

            // create payment to IBAN
            const payout = await stripe.payouts.create({
              amount: val.amount * 100,
              currency: val.currency,
              method: "standrd",
              destination: {
                iban: excreatorProfile.iban,
              },
              // metaData: {
              //   chargeId: val.chargeId,
              // },
            });

            if (payout.status == "paid") {
              const updated = await Investment.findByIdAndUpdate(val._id, {
                $set: {
                  payout: payout,
                  payoutStatus: true,
                  payoutAt: Date.now(),
                },
              });
              return updated;
            }
          })
        )
          .then((result) => {
            return SuccessHandler(
              { message: "Payments released", result },
              200,
              res
            );
          })
          .catch((error) => {
            return ErrorHandler(error.message, 400, req, res);
          });
      } else {
        return ErrorHandler(
          "No investments on this campaign found!",
          400,
          req,
          res
        );
      }
    } else {
      return ErrorHandler("IBAN not found in creator profile!", 400, req, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// investors
const getInvestors = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const searchFilter = req.body.searchFilter
      ? {
          title: {
            $regex: req.body.search,
            $options: "i",
          },
        }
      : {};
    const investors = await User.find({
      ...searchFilter,
      isActive: true,
      role: "investor",
    }).distinct("_id");
    // .select(
    //   "-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires"
    // );
    const investrProfiles = await investorProfile
      .find({
        investor: { $in: investors },
      })
      .populate({
        path: "investor",
        select:
          "-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires",
      });

    return SuccessHandler(
      { message: "Investors fetched", investrProfiles },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateInvestor = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const {
      id,
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
    const updated = await investorProfile.findByIdAndUpdate(id, {
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
    });
    if (!updated) {
      return ErrorHandler("Error updating investor profile!", 400, req, res);
    }
    return SuccessHandler(
      { message: "Investor profile updated!", updated },
      201,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const deleteInvestor = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: false,
        },
      },
      { new: true }
    );
    // const deletedInvestorProfile = await investorProfile.findOneAndDelete({
    //   investor: deletedInvestor._id,
    // });
    // const toBeDeletedInvestments = await Investment.find({
    //   investor: deletedInvestor._id,
    // }).distinct("_id");
    // const deletedInvestments = await Investment.deleteMany({
    //   _id: { $in: toBeDeletedInvestments },
    // });
    // const campaignsToBeUpdated = await Project.find({
    //   investment: { $in: toBeDeletedInvestments },
    // });
    // await Promise.all(
    //   campaignsToBeUpdated.map(async (campaign, ind) => {
    //     campaign.investment =
    //       campaign.investment.length > 0
    //         ? campaign.investment.filter(
    //             (item) => !toBeDeletedInvestments.includes(item)
    //           )
    //         : // const filteredArray = array1.filter(item => !array2.includes(item));
    //           [];
    //     const updated = await Project.findByIdAndUpdate(campaign._id, campaign);
    //     return updated;
    //   })
    // )
    //   .then((res) => {
    //     return SuccessHandler("Investor and related data deleted!", 200, res);
    //   })
    //   .catch((error) => {
    //     return ErrorHandler(error.message, 400, req, res);
    //   });
    console.log(deleted);
    if (!deleted) {
      return ErrorHandler("Error deleting investor!", 400, req, res);
    }
    return SuccessHandler({ message: "Investor deleted!", deleted }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// creator
const getCreators = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const searchFilter = req.body.searchFilter
      ? {
          title: {
            $regex: req.body.search,
            $options: "i",
          },
        }
      : {};
    const creators = await User.find({
      ...searchFilter,
      isActive: true,
      role: "creator",
    }).distinct("_id");
    // .select(
    //   "-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires"
    // );
    const creatorProfiles = await creatorProfile
      .find({
        creator: { $in: creators },
      })
      .populate({
        path: "creator",
        select:
          "-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires",
      });

    return SuccessHandler(
      { message: "creators fetched", creatorProfiles },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const updateCreator = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const {
      id,
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
    const updated = await creatorProfile.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true }
    );
    if (!updated) {
      return ErrorHandler("Error updating profile", 400, req, res);
    }
    return SuccessHandler("Profile updated!", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const deleteCreator = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: false,
        },
      },
      { new: true }
    );
    if (!deleted) {
      return ErrorHandler("Error deleting creator!", 400, req, res);
    }
    return SuccessHandler({ message: "Creator deleted!", deleted }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//dashboard
const dashboard = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    // let currentYear = new Date().getFullYear();
    // const investmentChartData = await Investment.aggregate([
    //   {
    //     $match: {
    //       createdAt: {
    //         $gte: new Date(new Date().getFullYear(), 0, 1), // start of current year
    //         $lt: new Date(new Date().getFullYear() + 1, 0, 1), // start of next year
    //       },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: { $month: "$createdAt" },
    //       totalAmount: { $sum: "$amount" },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       month: { $concat: [{ $toString: "$_id" }, "-01-01"] },
    //       totalAmount: 1,
    //     },
    //   },
    //   {
    //     $replaceRoot: {
    //       newRoot: { $arrayToObject: [[{ k: "$month", v: "$totalAmount" }]] },
    //     },
    //   },
    // ]);
    // const usersChartData = await User.aggregate([
    //   {
    //     $match: {
    //       createdAt: {
    //         $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
    //         $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
    //       },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: { $month: "$createdAt" },
    //       count: { $sum: 1 },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       month: { $month: new Date("1970-01-01") },
    //       count: 1,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$month",
    //       count: { $sum: "$count" },
    //     },
    //   },
    //   {
    //     $project: {
    //       month: {
    //         $switch: {
    //           branches: [
    //             { case: { $eq: ["$_id", 1] }, then: "Jan" },
    //             { case: { $eq: ["$_id", 2] }, then: "Feb" },
    //             { case: { $eq: ["$_id", 3] }, then: "Mar" },
    //             { case: { $eq: ["$_id", 4] }, then: "Apr" },
    //             { case: { $eq: ["$_id", 5] }, then: "May" },
    //             { case: { $eq: ["$_id", 6] }, then: "Jun" },
    //             { case: { $eq: ["$_id", 7] }, then: "Jul" },
    //             { case: { $eq: ["$_id", 8] }, then: "Aug" },
    //             { case: { $eq: ["$_id", 9] }, then: "Sep" },
    //             { case: { $eq: ["$_id", 10] }, then: "Oct" },
    //             { case: { $eq: ["$_id", 11] }, then: "Nov" },
    //             { case: { $eq: ["$_id", 12] }, then: "Dec" },
    //           ],
    //           default: "Invalid",
    //         },
    //       },
    //       count: 1,
    //     },
    //   },
    // ]);
    // const campaignCategoryChartData = await Project.aggregate([
    //   {
    //     $group: {
    //       _id: "$category",
    //       count: { $sum: 1 },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       category: "$_id",
    //       count: 1,
    //     },
    //   },
    // ]);
    //     1) Total campaigns
    // 2)Total active campaigns
    // 3)pending campaigns
    // 4)rejected campagins
    // 5)total investors
    // 6)total creators
    // 7)total earning of admin

    const totalCampaigns = await Project.countDocuments({
      isActive: true,
    });
    const totalActiveCampaigns = await Project.countDocuments({
      isActive: true,
      status: "approved",
    });
    const totalPendingCampaigns = await Project.countDocuments({
      isActive: true,
      status: "pending",
    });
    const totalRejectedCampaigns = await Project.countDocuments({
      isActive: true,
      status: "rejected",
    });
    const totalInvestors = await User.countDocuments({
      isActive: true,
      role: "investor",
    });
    const totalCreators = await User.countDocuments({
      isActive: true,
      role: "creator",
    });
    const closedCampaigns = await Project.find({
      isActive: true,
      status: "closed",
    });
    const totalEarning = closedCampaigns.reduce((acc, val) => {
      return acc + val.fundingGoal;
    }, 0);
    return SuccessHandler(
      {
        message: "Data fetched!",
        // investmentChartData,
        // usersChartData,
        // campaignCategoryChartData,
        totalCampaigns,
        totalActiveCampaigns,
        totalPendingCampaigns,
        totalRejectedCampaigns,
        totalInvestors,
        totalCreators,
        totalEarning,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.mesage, 500, req, res);
  }
};



//web details
const addUpdateWebDetails = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const {
      logo,
      // socialLinks,
      icon,
      webName,
      facebook,
      twitter,
      description,
      instagram,
      termsAndConditions,
      privacyPolicy,
      pagesData,
    } = req.body;
    if (req.body.id && pagesData) {
      const updated = await WebDetails.findByIdAndUpdate(req.body.id, {
        $set: {
          // logo,
          // // socialLinks,
          // icon,
          // webName,
          // facebook,
          // twitter,
          // description,
          // instagram,
          // termsAndConditions,
          // privacyPolicy,
          pagesData,
        },
      });
      if (!updated) {
        return ErrorHandler("Error updating info!", 400, req, res);
      } else {
        return SuccessHandler("Page Data Updated Successfully!", 201, res);
      }
    } else if (req.body.id && !pagesData) {
      const updated = await WebDetails.findByIdAndUpdate(req.body.id, {
        $set: {
          logo,
          // socialLinks,
          icon,
          webName,
          facebook,
          twitter,
          description,
          instagram,
          termsAndConditions,
          privacyPolicy,
        },
      });
      if (!updated) {
        return ErrorHandler("Error updating info!", 400, req, res);
      } else {
        return SuccessHandler("Website Settings Updated Successfully!", 201, res);
      }
    } else {
      const newWebDetials = new WebDetails({
        logo,
        // socialLinks,
        icon,
        webName,
        facebook,
        twitter,
        description,
        instagram,
        termsAndConditions,
        privacyPolicy,
      });
      await newWebDetials.save();
      return SuccessHandler("Website details added successfully", 201, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getAllWebDetails = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const webDetails = await WebDetails.findOne();
    if (webDetails) {
      return SuccessHandler(
        { message: "Details fetched", webDetails },
        200,
        res
      );
    } else {
      return ErrorHandler("Error fetching data!", 400, req, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const createCreator = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { firstName, lastName, email, password, profilePic } = req.body;

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      profilePic,
      role: "creator",
      emailVerified: true,
    });
    const user = await newUser.save();
    if (user) {
      return SuccessHandler({ message: "Creator created!", user }, 201, res);
    } else {
      return ErrorHandler("Error creating creator!", 400, req, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const createInvestor = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { firstName, lastName, email, password, profilePic } = req.body;
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      profilePic,
      role: "investor",
      emailVerified: true,
    });
    const user = await newUser.save();
    if (user) {
      return SuccessHandler(
        {
          message: "User created successfully",
          user: user,
        },
        201,
        res
      );
    } else {
      return ErrorHandler("Error creating investor", 500, req, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const userStats = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const creatorsWithCampaigns = await Project.aggregate([
      {
        $group: {
          _id: "$creator",
          campaigns: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: "$creator",
      },
      {
        $project: {
          _id: 0,
          creator: {
            _id: "$creator._id",
            firstName: "$creator.firstName",
            lastName: "$creator.lastName",
            email: "$creator.email",
            profilePic: "$creator.profilePic",
            campaigns: "$campaigns",
            campaignsCount: { $size: "$campaigns" },
          },
        },
      },
    ]);
    // const creatorsWithCampaignsCount = await User.aggregate([
    //   {
    //     $match: {
    //       role: "creator",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "projects",
    //       localField: "_id",
    //       foreignField: "creator",
    //       as: "campaigns",
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       firstName: 1,
    //       lastName: 1,
    //       email: 1,
    //       profilePic: 1,
    //       campaignsCount: { $size: "$campaigns" },
    //     },
    //   },
    // ]);
    const investorsWithInvestments = await Investment.aggregate([
      {
        $group: {
          _id: "$investor",
          investments: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "investor",
        },
      },
      {
        $unwind: "$investor",
      },
      {
        $project: {
          _id: 0,
          investor: {
            _id: "$investor._id",
            firstName: "$investor.firstName",
            lastName: "$investor.lastName",
            email: "$investor.email",
            profilePic: "$investor.profilePic",
            investments: "$investments",
            investmentsCount: { $size: "$investments" },
          },
        },
      },
    ]);
    // const investorsWithInvestmentsCount = await User.aggregate([
    //   {
    //     $match: {
    //       role: "investor",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "investments",
    //       localField: "_id",
    //       foreignField: "investor",
    //       as: "investments",
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       firstName: 1,
    //       lastName: 1,
    //       email: 1,
    //       profilePic: 1,
    //       investmentsCount: { $size: "$investments" },
    //     },
    //   },
    // ]);

    return SuccessHandler(
      {
        message: "Data fetched!",
        creatorsWithCampaigns,
        // creatorsWithCampaignsCount,
        investorsWithInvestments,
        // investorsWithInvestmentsCount,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const addToFeatured = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { id } = req.params;
    await Project.findByIdAndUpdate(id, {
      $set: {
        featured: true,
      },
    });
    return SuccessHandler("Added to featured!", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getProfile = async(req, res) => {
  // #swagger.tags = ['admin']
  try {
    return SuccessHandler({
      message: "Profile fetched!",
      profile: req.user
    }, 200, res)
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
}

module.exports = {
  approveCampaign,
  getCampaigns,
  rejectCampaign,
  editCampaign,
  deleteCampaign,
  releaseFunds,
  getInvestors,
  updateInvestor,
  deleteInvestor,
  getCreators,
  updateCreator,
  deleteCreator,
  dashboard,
  addUpdateWebDetails,
  getAllWebDetails,
  createCreator,
  createInvestor,
  userStats,
  addToFeatured,
  getProfile
};
