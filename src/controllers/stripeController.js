const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const { default: mongoose } = require("mongoose");
const stripe = require("stripe")(
  "sk_test_51P2H7LRsBI9RwO6zj7d2wTE8h7D7yRhJNTv59hh5Fjn4ljn9qjpZZ1H7M9kUZhhlFK37Do2XiQMBPX6KOH9bRFHq00mlwqaG1Y"
);
const fs = require("fs");
const path = require("path");

const user = {
  name: "Sadia",
  //   email: "memonumer504@gmail.com",
  //   email: "dotclickpostman@gmail.com",
  //   email: "seneri8749@ekposta.com",
  country: "US",
};

const createAccount = async (req, res, next) => {
  // #swagger.tags = ['Blog'];
  try {
    const iconPath = path.join(__dirname, "icon.png");
    const logoPath = path.join(__dirname, "icon.png");

    const iconData = fs.readFileSync(iconPath);
    const logoData = fs.readFileSync(logoPath);

    const iconFile = await stripe.files.create({
      file: {
        data: iconData,
        name: "icon.png",
        type: "image/png",
      },
      purpose: "business_icon",
    });
    console.log("icons file.....", iconFile);

    const logoFile = await stripe.files.create({
      file: {
        data: logoData,
        name: "icon.png",
        type: "image/png",
      },
      purpose: "business_logo",
    });
    console.log("logoFile file.....", logoFile);

    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: user.email,
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      business_type: "individual",
      business_profile: {
        mcc: "5718",
        url: "https://chat.openai.com/c/f2978386-c877-48eb-810a-d8fc652fc824",
        name: user.name,
        product_description: "Email newsletter",
        support_email: user.email,
      },
      tos_acceptance: {
        service_agreement: "recipient",
        service_agreement: user.country == "US" ? "full" : "recipient",
      },
      settings: {
        branding: {
          icon: iconFile.id,
          logo: logoFile.id,
          primary_color: "#09aed3",
          secondary_color: "#092027",
        },
      },
    });

    return SuccessHandler(account, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};
const linkAccount = async (req, res, next) => {
  try {
    const { accountId } = req.body;
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: "https://crowdfunding.up.railway.app/stripe/new",
      return_url: "https://crowdfunding.up.railway.app/",
      type: "account_onboarding",
      // collect: "eventually_due",
    });

    return SuccessHandler({ url: link.url }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 400, req, res);
  }
};

module.exports = {
  createAccount,
  linkAccount,
};
