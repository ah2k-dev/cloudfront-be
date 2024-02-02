const Investment = require("../models/Campaign/investments");
const Project = require("../models/Campaign/projects");
const creatorProfile = require("../models/User/creatorProfile");
const User = require("../models/User/user");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const dotenv = require("dotenv");
const { sendNotification } = require("../middleware/notification");
const mongoose = require("mongoose");
const { getAdminId } = require("../utils/adminUtils");
const moment = require("moment");
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
      // rewards,
      additionalImageUrls,
      termsAndConditions,
      equity,
      // slug,
      linkToPreviousCampaign,
      socialMediaLinks,
      videoUrl,
      videoDesc
    } = req.body;

    const prevCampaign = await Project.findOne({
      creator: req.user._id,
      status: "approved",
    });

    if (prevCampaign) {
      return ErrorHandler("You already have a live campaign", 401, req, res);
    }

    const user = req.user._id;
    if (Number(equity) < 10 || Number(equity) > 90) {
      return ErrorHandler("Equity must be between 10% and 90%", 400, req, res);
    }
    console.log("Projection Creation before");
    const newProject = new Project({
      title,
      shortDesc,
      detailedDesc,
      fundingGoal: Number(fundingGoal),
      duration,
      projectCategory,
      imageUrl,
      // rewards,
      creator: user,
      equity: Number(equity),
      availableEquity: Number(equity),
      // slug,
      linkToPreviousCampaign,
      termsAndConditions,
      socialMediaLinks,
      videoUrl,
      additionalImageUrls,
      videoDesc
    });
    await newProject.save();
    const adminId = await getAdminId();
    if (newProject) {
      console.log("Project Created");
      // notify to creator
      await sendNotification(
        "New Campaign created",
        `${title} campaign has been created successfully`,
        req.user._id
      );
      // notify to admin
      await sendNotification(
        "New Campaign created",
        `${req.user.firstName} ${req.user.lastName} has created a new campaign`,
        adminId
      );
    }
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
    // const { id } = req.body;
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
      // rewards,
      // creatorBio,
      socialMediaLinks,
      additionalImageUrls,
      termsAndConditions,
      // slug,
      linkToPreviousCampaign,
      videoDesc
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
        videoUrl,
        // rewards,
        // creatorBio,
        socialMediaLinks,
        additionalImageUrls,
        termsAndConditions,
        // slug,
        linkToPreviousCampaign,
        videoDesc
      },
    });
    if (updated.status === "approved") {
      const project = await Project.findById(id).select("investment");
      // console.log(project.investment);
      const investments = await Investment.find({
        _id: { $in: project.investment },
      });
      const investorsId = investments.map((val) => val.investor);
      if (investorsId.length > 0) {
        // notify to investor
        for (const investor of investorsId)
          await sendNotification(
            `${req.user._id} updated the campaign`,
            `${title} campaign updated, you can check now`,
            investor
          );
      }
      // notify to creator
      await sendNotification(
        "Campaign updated",
        `${title} campaign has been updated successfully`,
        req.user._id
      );
      // notify to admin
      await sendNotification(
        "Campaign updated",
        `${req.user.firstName} ${req.user.lastName} has updated his/her campaign`,
        adminId
      );
    }
    if (!updated) {
      return ErrorHandler("Error updating campaign!", 400, req, res);
    }
    // const investorIds = await Project.aggregate([
    //   { $match: { _id: mongoose.Types.ObjectId(id) } },
    //   {
    //     $unwind: "$investment",
    //   },
    //   {
    //     $lookup: {
    //       from: "investment",
    //       localField: "investment",
    //       foreignField: "_id",
    //       as: "investmentDetail",
    //     },
    //   },

    //   {
    //     $match: { investment: "$investmentDetail._id" },
    //   },
    //   // {
    //   //   $group: {
    //   //     _id: null,
    //   //     investorId: { $push: "$investmentDetail.investor" },
    //   //   },
    //   // },
    // ]);
    console.log(investorIds);
    // return SuccessHandler(investorIds, 200, res);
    return SuccessHandler("Campaign Updated!", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getAll = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const itemPerPage = Number(req.body.itemPerPage);
    const pageNumber = Number(req.body.page);
    const skipItems = (pageNumber - 1) * itemPerPage;
    const statusFilter = req.body.statusFilter
      ? {
          status: req.body.statusFilter,
        }
      : {};
    const searchFilter = req.body.search
      ? {
          title: {
            $regex: req.body.search,
            $options: "i",
          },
        }
      : {};
    const categoryFilter = req.body.categoryFilter
      ? {
          projectCategory: req.body.categoryFilter,
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

    const minMaxFilter =
      req.body.minMaxFilter && req.body.minMaxFilter.length > 0
        ? {
            fundingGoal: {
              $gte: req.body.minMaxFilter[0],
              $lte: req.body.minMaxFilter[1],
            },
          }
        : {};

    const campaginsCount = await Project.countDocuments({ isActive: true });
    const campaigns = await Project.find({
      ...statusFilter,
      ...searchFilter,
      ...categoryFilter,
      ...minMaxFilter,
      isActive: true,
    })

      .populate({
        path: "creator",
        select: "firstName middleName lastName profilePic email",
      })
      .populate({
        path: "investment",
        populate: "investor",
      })
      .sort({ createdAt: -1 })
      .skip(skipItems)
      .limit(itemPerPage);
    Promise.all(
      campaigns.map(async (val, ind) => {
        if (val.creator) {
          console.log(val.creator._id);
        } else {
          console.log(val);
        }
        const profile = await creatorProfile.findOne({
          creator: val.creator._id,
        });
        let data;
        if (profile) {
          data = { campaign: val, creatorProfile: profile };
        } else {
          data = { campaign: val, creatorProfile: {} };
        }
        // val.creatorProfile = profile;
        return data;
      })
    )
      .then((result) => {
        console.log(result);
        return SuccessHandler(
          {
            message: "Campaigns fetched!",
            campaginsCount,
            campaigns: result,
          },
          200,
          res
        );
      })
      .catch((error) => {
        console.log(error);
        return ErrorHandler(error.message, 500, req, res);
      });

    // if (!campaigns) {
    //   return ErrorHandler("Error fetching campaigns", 400, req, res);
    // }
    // return SuccessHandler(
    //   {
    //     message: "Campaiigns fetched!",
    //     campaigns,
    //   },
    //   200,
    //   res
    // );
  } catch (error) {
    console.log(error);
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getMine = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const itemPerPage = Number(req.body.itemPerPage);
    const pageNumber = Number(req.body.page);
    const skipItems = (pageNumber - 1) * itemPerPage;
    const statusFilter = req.body.statusFilter
      ? {
          status: req.body.statusFilter,
        }
      : {};
    const searchFilter = req.body.search
      ? {
          title: {
            $regex: req.body.search,
            $options: "i",
          },
        }
      : {};

    const categoryFilter =
      req.body.categoryFilter && req.body.categoryFilter.length > 0
        ? {
            projectCategory: {
              $in: req.body.categoryFilter,
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
    const campaignsCount = await Project.countDocuments({
      isActive: true,
      creator: req.user._id,
    });
    const campaigns = await Project.find({
      ...statusFilter,
      ...searchFilter,
      ...categoryFilter,
      creator: user,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .skip(skipItems)
      .limit(itemPerPage)
      .populate({
        path: "creator",
        select: "firstName middleName lastName profilePic email",
      })
      .populate({
        path: "investment",
        populate: "investor",
      });

    // if (!campaigns) {
    //   return ErrorHandler("Error fetching campaigns", 400, req, res);
    // }
    // return SuccessHandler(
    //   {
    //     message: "Campaiigns fetched!",
    //     campaigns,
    //   },
    //   200,
    //   res
    // );
    Promise.all(
      campaigns.map(async (val, ind) => {
        const profile = await creatorProfile.findOne({
          creator: val.creator._id,
        });
        let data = { campaign: val, creatorProfile: profile };
        // val.creatorProfile = profile;
        return data;
      })
    )
      .then((result) => {
        console.log(result);
        return SuccessHandler(
          {
            message: "Campaigns fetched!",
            campaignsCount,
            campaigns: result,
          },
          200,
          res
        );
      })
      .catch((error) => {
        return ErrorHandler(error.message, 500, req, res);
      });
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getInvested = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const itemPerPage = Number(req.body.itemPerPage);
    const pageNumber = Number(req.body.page);
    const skipItems = (pageNumber - 1) * itemPerPage;
    const user = req.user._id;
    const statusFilter = req.body.statusFilter
      ? {
          status: req.body.statusFilter,
        }
      : {};
    const searchFilter = req.body.search
      ? {
          title: {
            $regex: req.body.search,
            $options: "i",
          },
        }
      : {};
    const categoryFilter =
      req.body.categoryFilter && req.body.categoryFilter.length > 0
        ? {
            projectCategory: {
              $in: req.body.categoryFilter,
            },
          }
        : {};
    const investments = await Investment.find({
      investor: user,
    }).distinct("_id");

    const campaignsCount = await Project.countDocuments({
      investment: { $in: investments },
      isActive: true,
    });
    const campaigns = await Project.find({
      investment: { $in: investments },
      ...statusFilter,
      ...searchFilter,
      ...categoryFilter,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .skip(skipItems)
      .limit(itemPerPage)
      .populate({
        path: "creator",
        select: "firstName middleName lastName profilePic email",
      })
      .populate("investment");
    // if (!campaigns) {
    //   return ErrorHandler("Error fetching campaigns", 400, req, res);
    // }
    // return SuccessHandler(
    //   {
    //     message: "Campaiigns fetched!",
    //     campaigns,
    //     investments,
    //   },
    //   200,
    //   res
    // );
    Promise.all(
      campaigns.map(async (val, ind) => {
        const profile = await creatorProfile.findOne({
          creator: val.creator._id,
        });
        let data = { campaign: val, creatorProfile: profile };
        // val.creatorProfile = profile;
        return data;
      })
    )
      .then((result) => {
        // console.log(result);
        return SuccessHandler(
          {
            message: "Campaigns fetched!",
            campaignsCount,
            campaigns: result,
          },
          200,
          res
        );
      })
      .catch((error) => {
        return ErrorHandler(error.message, 500, req, res);
      });
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
    }).distinct("projectCategory");

    const editorPicks = await Project.find({
      projectCategory: { $in: investedCampaigns },
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
    console.log("req.body");
    const { campaign, amount, currency, stripeToken } = req.body;
    console.log("req.body");
    console.log(req.body);
    const user = req.user._id;

    //equity calculations
    const project = await Project.findById(campaign);

    const equityBought = (amount / project.fundingGoal) * project.equity;
    const equityLeft = project.availableEquity - equityBought;

    if (equityLeft < 0) {
      return ErrorHandler("Amount exceeds equity", 400, req, res);
    }

    //stripe charge

    const charge = await stripe.charges.create({
      amount: amount,
      currency: currency,
      source: stripeToken,
      capture: true, // false for holding payment. true for capturing payment immediately
    });

    console.log(amount, equityBought, equityLeft, charge);
    if (charge) {
      const chargeId = charge.id;
      if (charge.status == "succeeded") {
        const newInvestment = new Investment({
          investor: user,
          amount: amount,
          currency: currency,
          chargeId: chargeId,
          equityBought: equityBought,
        });
        const investment = await newInvestment.save();

        const adminId = await getAdminId();
        if (investment) {
          // notify to investor
          await sendNotification(
            "New investment",
            `You investmented in ${project.title} campaign`,
            req.user._id
          );
          // notify to creator
          await sendNotification(
            "New investment",
            `${req.user.firstName} ${req.user.lastName} has invested in ${project.title} campaign`,
            project.creator
          );
          // notify to admin
          await sendNotification(
            "New investment",
            `${req.user.firstName} ${req.user.lastName} invested in ${project.title} campaign`,
            adminId
          );
          await Project.findByIdAndUpdate(campaign, {
            $push: { investment: investment._id },
            $set: { availableEquity: equityLeft },
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
          projectCategory: req.body.category,
        }
      : {};
    const searchFilter = req.body.search
      ? {
          title: { $regex: req.body.search, $options: "i" },
        }
      : {};
    const campaignsCount = await Project.countDocuments({
      investment: { $exists: true, $ne: [] },
      isActive: true,
    });

    let campaigns;
    // pagination
    if (req.body.itemPerPage && req.body.page) {
      const itemPerPage = Number(req.body.itemPerPage);
      const pageNumber = Number(req.body.page);
      const skipItems = (pageNumber - 1) * itemPerPage;
      campaigns = await Project.find({
        investment: { $exists: true, $ne: [] },
        isActive: true,
        ...categoryFilter,
        ...searchFilter,
      })
        .sort({ createdAt: -1 })
        .skip(skipItems)
        .limit(itemPerPage)
        .populate({
          path: "creator",
          select: "firstName middleName lastName profilePic email",
        })
        .populate("investment");
    } else {
      campaigns = await Project.find({
        investment: { $exists: true, $ne: [] },
        isActive: true,
        ...categoryFilter,
        ...searchFilter,
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          select: "firstName lastName profilePic email",
        })
        .populate("investment");

      if (!campaigns) {
        return ErrorHandler("Error fetching campaigns", 400, req, res);
      }
    }

    return SuccessHandler(
      { message: "Campaigns fetched!", campaignsCount, campaigns },
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
    const completedCampaignsCount = await Project.aggregate([
      {
        $lookup: {
          from: "investments",
          localField: "investment",
          foreignField: "_id",
          as: "investments",
        },
      },
      {
        $match: {
          fundingGoal: { $lte: "$totalInvestmentAmount" },
        },
      },
      {
        $count: "totalCount",
      },
    ]);
    let aggregationPipeline;
    if (req.body.itemPerPage && req.body.page) {
      const itemPerPage = Number(req.body.itemPerPage);
      const pageNumber = Number(req.body.page) | req.body.itemPerPage | 1;
      const skipItems = (pageNumber - 1) * itemPerPage;
      aggregationPipeline = [
        {
          $lookup: {
            from: "investments",
            localField: "investment",
            foreignField: "_id",
            as: "investments",
          },
        },
        {
          $addFields: {
            totalInvestmentAmount: { $sum: "$investments.amount" },
          },
        },
        {
          $match: {
            fundingGoal: { $lte: "$totalInvestmentAmount" },
          },
        },
        {
          $sort: { "investments.createdAt": -1 },
        },
        {
          $skip: skipItems,
        },
        {
          $limit: itemPerPage,
        },
      ];
    } else if (!(req.body.itemPerPage && req.body.page)) {
      aggregationPipeline = [
        {
          $lookup: {
            from: "investments",
            localField: "investment",
            foreignField: "_id",
            as: "investments",
          },
        },
        {
          $addFields: {
            totalInvestmentAmount: { $sum: "$investments.amount" },
          },
        },
        {
          $match: {
            fundingGoal: { $lte: "$totalInvestmentAmount" },
          },
        },
        {
          $sort: { "investments.createdAt": -1 },
        },
      ];
    }
    const campaigns = await Project.aggregate(aggregationPipeline);
    if (!campaigns) {
      return ErrorHandler("Error fetching campaigns", 400, req, res);
    }
    return SuccessHandler(
      { message: "Campaigns fetched!", completedCampaignsCount, campaigns },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const get = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const campaign = await Project.findById(req.params.id)
      .populate({
        path: "creator",
        select: "firstName middleName lastName profilePic email",
      })
      .populate({
        path: "investment",
        populate: {
          path: "investor",
          select: "firstName middleName lastName profilePic email",
        },
      });

    const profile = await creatorProfile.findOne({
      creator: campaign.creator._id,
    });

    const result = { campaign: campaign, creatorProfile: profile };

    // console.log(result);
    return SuccessHandler(
      {
        message: "Campaign fetched!",
        campaign: result,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const requestPayout = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const { id } = req.params;
    const campaign = await Project.findByIdAndUpdate(
      id,
      {
        $set: { payoutRequested: true },
      },
      {
        new: true,
      }
    );
    if (!campaign) {
      return ErrorHandler("Campaign not found", 404, req, res);
    }
    return SuccessHandler(
      { message: "Payout requested successfully!", campaign },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getRequestedPayoutCampaigns = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const creatorFilter =
      req.user.role === "creator" ? { creator: req.user._id } : {};
    const searchFilter = req.body.search
      ? {
          $or: [
            {
              title: { $regex: req.body.search, $options: "i" },
            },
            {
              shortDesc: { $regex: req.body.search, $options: "i" },
            },
          ],
        }
      : {};

    const dateFilter =
      req.body.dateFilter && req.body.dateFilter.length > 0
        ? {
            createdAt: {
              $gte: new Date(
                moment(req.body.dateFilter[0]).startOf("day").format()
              ),

              $lte: new Date(
                moment(req.body.dateFilter[1]).endOf("day").format()
              ),
            },
          }
        : {};

    const categoryFilter = req.body.categoryFilter
      ? {
          projectCategory: req.body.categoryFilter,
        }
      : {};

    const campaignsCount = await Project.countDocuments({
      payoutRequested: true,
      ...creatorFilter,
      ...searchFilter,
      ...dateFilter,
      ...categoryFilter,
    });
    let campaigns;
    if (req.body.itemPerPage && req.body.page) {
      const itemPerPage = Number(req.body.itemPerPage);
      const pageNumber = Number(req.body.page);
      const skipItems = (pageNumber - 1) * itemPerPage;

      campaigns = await Project.find({
        payoutRequested: true,
        ...creatorFilter,
        ...searchFilter,
        ...dateFilter,
        ...categoryFilter,
      })
        .sort({ createdAt: -1 })
        .skip(skipItems)
        .limit(itemPerPage)
        .populate({
          path: "creator",
          select: "firstName middleName lastName profilePic email",
        });
      // .populate({
      //   path: "investment",
      //   populate: {
      //     path: "investor",
      //     select: "firstName middleName lastName profilePic email",
      //   },
      // });
    } else if (!(req.body.itemPerPage && req.body.page)) {
      campaigns = await Project.find({
        payoutRequested: true,
        ...creatorFilter,
        ...searchFilter,
        ...dateFilter,
        ...categoryFilter,
      })
        .sort({ createdAt: -1 })
        .populate({
          path: "creator",
          select: "firstName middleName lastName profilePic email",
        })
        .populate({
          path: "investment",
          populate: {
            path: "investor",
            select: "firstName middleName lastName profilePic email",
          },
        });
    }
    if (!campaigns) {
      return ErrorHandler("Campaign not found", 404, req, res);
    }
    return SuccessHandler(
      { message: "Campaigns fetched!", campaignsCount, campaigns },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const saveFavCampaigns = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const id = req.params.id;
    const user = req.user._id;
    const campaign = await Project.findOne({
      _id: id,
      isActive: true,
    });
    if (!campaign) {
      return ErrorHandler("Campaign not found", 404, req, res);
    }
    if(req.user.favCampaigns){
      const favCampaigns = req.user.favCampaigns;
      if (favCampaigns.includes(id)) {
        return ErrorHandler("Campaign already saved", 400, req, res);
      } else {
        const updated = await User.findByIdAndUpdate(
          user._id,
          {
            $push: { favCampaigns: id },
          },
          {
            new: true,
          }
        );
        if (!updated) {
          return ErrorHandler("Error saving campaign", 400, req, res);
        }
        return SuccessHandler(
          { message: "Campaign saved successfully!", campaign: updated },
          201,
          res
        );
      }
    } else {
      const updated = await User.findByIdAndUpdate(
        user._id,
        {
          favCampaigns: [id],
        },
        {
          new: true,
        }
      );
      if (!updated) {
        return ErrorHandler("Error saving campaign", 400, req, res);
      }
      return SuccessHandler(
        { message: "Campaign saved successfully!", campaign: updated },
        201,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
}

const getFavCampaigns = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const campaigns = await Project.find({
      _id: { $in: req.user.favCampaigns },
      isActive: true,
    });
    if (!campaigns) {
      return ErrorHandler("Campaigns not found", 404, req, res);
    }
    return SuccessHandler(
      { message: "Campaigns fetched!", campaigns },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
}

const unsaveFavCampaigns = async (req, res) => {
  // #swagger.tags = ['campaign']
  try {
    const {
      ids
    } = req.body;
    const user = req.user._id;
    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        $pull: { favCampaigns: { $in: ids } },
      },
      {
        new: true,
      }
    );
    if (!updated) {
      return ErrorHandler("Error removing campaign", 400, req, res);
    }
    return SuccessHandler(
      { message: "Campaign removed successfully!", campaign: updated },
      201,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);   
  }
}

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
  get,
  requestPayout,
  getRequestedPayoutCampaigns,
  saveFavCampaigns, 
  getFavCampaigns,
  unsaveFavCampaigns
};
