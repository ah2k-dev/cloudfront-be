const Investment = require("../models/Campaign/investments");
const Project = require("../models/Campaign/projects");
const User = require("../models/User/user");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const dotenv = require("dotenv");

dotenv.config({
  path: "./src/config/config.env",
});

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const create = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const {
      title,
      shortDesc,
      detailedDesc,
      fundingGoal,
      duration,
      projectCategory,
      imageUrl,
      // videoUrl,
      rewards,
      // creatorBio,
      // socialMediaLinks,
      // additionalImageUrls,
      // termsAndConditions,
    } = req.body;
    const user = req.user._id;
    const newProject = new Project({
      title,
      shortDesc,
      detailedDesc,
      fundingGoal,
      duration,
      projectCategory,
      imageUrl,
      // videoUrl,
      rewards,
      // creatorBio,
      // socialMediaLinks,
      // additionalImageUrls,
      // termsAndConditions,
      creator: user,
    });
    await newProject.save();
    return SuccessHandler(
      { message: "New Campaign Created!", campaign: newProject },
      201,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const update = async (req, res) => {
  // #swagger.tags = ['campaign']
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
        // videoUrl,
        rewards,
      // creatorBio,
      // socialMediaLinks,
      // additionalImageUrls,
      // termsAndConditions,
    } = req.body;
  const updated = await Project.findByIdAndUpdate(id, {
    $set: {
      title,
      shortDesc,
      detailedDesc,
      fundingGoal: Number(fundingGoal),
      duration,
      projectCategory,
      imageUrl,
      // videoUrl,
      rewards:JSON.parse(rewards),
      // creatorBio,
      // socialMediaLinks,
      // additionalImageUrls,
      // termsAndConditions,
    },
  });
  if (!updated) {
    return ErrorHandler("Error updating campaign!", 400, req, res);
  }
  return SuccessHandler("Campaign Updated!", 201, res);
} catch (error) {
  return ErrorHandler(error.message, 500, req, res);
}
};
const getAll = async (req, res) => {
  // #swagger.tags = ['campaign']
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
const getMine = async (req, res) => {
  // #swagger.tags = ['campaign']
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
    const user = req.user._id;
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
      creator: user,
      isActive: true,
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
const getInvested = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const user = req.user._id;
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
    const investments = await Investment.find({
      investor: user,
    }).distinct("_id");
    const campaigns = await Project.find({
      investments: { $in: investments },
      ...statusFilter,
      ...searchFilter,
      isActive: true,
    })
      .populate({
        path: "user",
        select: "firstName middleName lastName profilePic email",
      })
      .populate("investment");
    if (!campaigns) {
      return ErrorHandler("Error fetching campaigns", 400, req, res);
    }
    return SuccessHandler("Campaiigns fetched!", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getFeatured = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const freshCampaigns = await Project.find({ isActive: true })
      .sort({ createdAt: 1 })
      .limit(5);
    const nearlyThere = await Project.aggregate([
      // match projects that have at least 80% of their target budget completed
      {
        $match: {
          isActive: true,
          $expr: {
            $gte: [
              { $divide: [{ $sum: "$investments.amount" }, "$target"] },
              0.8,
            ],
          },
        },
      },
      // unwind the investments array to perform calculations on each investment
      { $unwind: "$investment" },
      // join with the investments collection to get the user who invested
      {
        $lookup: {
          from: "investments",
          localField: "investments.id",
          foreignField: "_id",
          as: "investment",
        },
      },
      // unwind the investment array since we only have one matching document
      { $unwind: "$investment" },
      // group by project and calculate the total amount of investments
      {
        $group: {
          _id: "$_id",
          totalInvestments: { $sum: "$investment.amount" },
          fundingGoal: { $first: "$fundingGoal" },
        },
      },
      // project the fields we want in the final result
      {
        $project: {
          _id: 0,
          project_id: "$_id",
          percentage_completed: {
            $multiply: [
              { $divide: ["$totalInvestments", "$fundingGoal"] },
              100,
            ],
          },
        },
      },
    ]);
    return SuccessHandler(
      { message: "Data fetched!", nearlyThere, freshCampaigns },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getEditorPicks = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const user = req.user._id;
    const investments = await Investment.find({
      investor: user,
    }).distinct("_id");
    const investedCampaigns = await Project.find({
      investments: { $in: investments },
      isActive: true,
    }).distinct("category");

    const editorPicks = await Project.find({
      category: { $in: investedCampaigns },
      isActive: true,
    });
    if (!campaigns) {
      return ErrorHandler("Error fetching data!", 400, req, res);
    }
    return SuccessHandler({ message: "Data Fetched", editorPicks }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const invest = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const { campaign, amount, currency, stripeToken } = req.body;
    const user = req.user._id;
    const amountInCents = amount * 100;

    const charge = await stripe.charges.create({
      amount: amountInCents,
      currency: currency,
      source: stripeToken,
      capture: true, // false for holding payment. conflict here. explanation for capture:false
    });

    if (charge) {
      const chargeId = charge.id;
      if (charge.status == "succeeded") {
        const newInvestment = new Investment({
          investor: user,
          amount: amount,
          currency: currency,
          chargeId: chargeId,
        });
        const investment = await newInvestment.save();
        if (investment) {
          await Project.findByIdAndUpdate(campaign, {
            $push: { investment: investment._id },
          });
          return SuccessHandler(
            { message: "Invested successfully", charge, investment },
            201,
            res
          );
        }
      } else {
        console.log(charge);
        return ErrorHandler("Payment failed", 400, req, res);
      }
    } else {
      return ErrorHandler("Error creating a charge", 400, req, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getLive = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const categoryFilter = req.body.category
      ? {
        category: req.body.category,
      }
      : {};
    const campaigns = await Project.find({
      investment: { $exists: true, $ne: [] },
      isActive: true,
      ...categoryFilter,
    })
      .populate({
        path: "user",
        select: "firstName middleName lastName profilePic email",
      })
      .populate("investment");
    if (!campaigns) {
      return ErrorHandler("Error fetching campaigns", 400, req, res);
    }

    return SuccessHandler(
      { message: "Campaigns fetched!", campaigns },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getCompleted = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const aggregationPipeline = [
      {
        $lookup: {
          from: "investments",
          localField: "investment",
          foreignField: "_id",
          as: "investments"
        }
      },
      {
        $addFields: {
          totalInvestmentAmount: { $sum: "$investments.amount" }
        }
      },
      {
        $match: {
          fundingGoal: { $lte: "$totalInvestmentAmount" }
        }
      }
    ]

    const campaigns = await Project.aggregate(aggregationPipeline);
    if (!campaigns) {
      return ErrorHandler("Error fetching campaigns", 400, req, res);
    }
    return SuccessHandler(
      { message: "Campaigns fetched!", campaigns },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  create,
  getAll,
  getMine,
  getInvested,
  update,
  getFeatured,
  getEditorPicks,
  invest,
  getLive,
  getCompleted,
};
