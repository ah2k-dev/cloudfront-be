const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const Project = require("../models/Campaign/projects");
const User = require("../models/User/user");
const investorProfile = require("../models/User/investorProfile");
const Investment = require("../models/Campaign/investments");
const creatorProfile = require("../models/User/creatorProfile");

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
    })
      .populate({
        path: "user",
        select: "firstName middleName lastName profilePic email",
      })
      .populate({
        path: "investment",
        populate: "investor",
      });

    if (!campaigns) {
      return ErrorHandler("Error fetching campaigns", 400, req, res);
    }
    return SuccessHandler("Campaiigns fetched!", 200, res);
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
    const deleted = await Project.findByIdAndUpdate(id, {
      $set: {
        isActive: false,
      },
    });
    if (!deleted) {
      return ErrorHandler("Error deleting campaign", 400, req, res);
    }
    return SuccessHandler({ message: "Campaign deleted!", deleted }, 200, res);
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
        path: "User",
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
    const deleted = await User.findByIdAndUpdate(id, {
      $set: {
        isActive: false,
      },
    });
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

    if (!deleted) {
      return ErrorHandler("Error deleting investor!", 400, res);
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
      role: "creator",
    }).distinct("_id");
    // .select(
    //   "-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires"
    // );
    const creatorProfiles = await creatorProfile
      .find({
        investor: { $in: creators },
      })
      .populate({
        path: "User",
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
    const updated = await findOneAndUpdate({
      creator: id,
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
const deleteCreator = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndUpdate(id, {
      $set: {
        isActive: false,
      },
    });
    if (!deleted) {
      return ErrorHandler("Error deleting investor!", 400, res);
    }
    return SuccessHandler({ message: "Investor deleted!", deleted }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//dashboard
const dashboard = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    let currentYear = new Date().getFullYear();
    const investmentChartData = await Investment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1), // start of current year
            $lt: new Date(new Date().getFullYear() + 1, 0, 1), // start of next year
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: { $concat: [{ $toString: "$_id" }, "-01-01"] },
          totalAmount: 1,
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: [[{ k: "$month", v: "$totalAmount" }]] },
        },
      },
    ]);
    const usersChartData = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
            $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: { $month: new Date("1970-01-01") },
          count: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: "$count" },
        },
      },
      {
        $project: {
          month: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "Jan" },
                { case: { $eq: ["$_id", 2] }, then: "Feb" },
                { case: { $eq: ["$_id", 3] }, then: "Mar" },
                { case: { $eq: ["$_id", 4] }, then: "Apr" },
                { case: { $eq: ["$_id", 5] }, then: "May" },
                { case: { $eq: ["$_id", 6] }, then: "Jun" },
                { case: { $eq: ["$_id", 7] }, then: "Jul" },
                { case: { $eq: ["$_id", 8] }, then: "Aug" },
                { case: { $eq: ["$_id", 9] }, then: "Sep" },
                { case: { $eq: ["$_id", 10] }, then: "Oct" },
                { case: { $eq: ["$_id", 11] }, then: "Nov" },
                { case: { $eq: ["$_id", 12] }, then: "Dec" },
              ],
              default: "Invalid",
            },
          },
          count: 1,
        },
      },
    ]);
    const campaignCategoryChartData = await Project.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
    ]);
    return SuccessHandler(
      {
        message: "Data fetched!",
        investmentChartData,
        usersChartData,
        campaignCategoryChartData,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.mesage, 500, req, res);
  }
};

module.exports = {
  approveCampaign,
  getCampaigns,
  rejectCampaign,
  editCampaign,
  deleteCampaign,
  getInvestors,
  updateInvestor,
  deleteInvestor,
  getCreators,
  updateCreator,
  deleteCreator,
  dashboard,
};
