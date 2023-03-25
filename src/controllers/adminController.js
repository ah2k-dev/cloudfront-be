const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const Project = require("../models/Campaign/projects");

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

module.exports = {
  approveCampaign,
  getCampaigns,
};
