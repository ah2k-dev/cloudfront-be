const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const ApiError = require("./utils/ApiError");
const app = express();
const loggerMiddleware = require("./middleware/loggerMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json"); // Generated Swagger file
const router = require("./router/index");
const fileUpload = require("express-fileupload");
const path = require("path");
const Project = require("./models/Campaign/projects");
const investorProfile = require("./models/User/investorProfile");
const creatorProfile = require("./models/User/creatorProfile");
const Investment = require("./models/Campaign/investments");
const cron = require("cron").CronJob;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Middlewares
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(loggerMiddleware);
app.use(fileUpload());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// api doc
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
//routes
app.use("/", router);

app.get("/", (req, res) => {
  res.send("cloudfront api v1.0.2");
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});

var closeCampaigns = new cron(
  "* * * * * *",
  async function () {
    const campagins = await Project.find({
      status: "approved",
      isActive: true,
      // createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).populate("investment");

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    Promise.all(
      campagins.map(async (campagin) => {
        let date = new Date(campagin.createdAt);
        date.setDate(date.getDate() + 30);
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        if (todayYear === year && todayMonth === month && todayDate === day) {
          let totalInvestment = 0;
          campagin.investment.forEach((investment) => {
            totalInvestment += investment.amount;
          });
          const completedFundingGoalPercentage = Math.round(
            (totalInvestment / campagin.fundingGoal) * 100
          );
          if (completedFundingGoalPercentage >= 80) {
            await Project.findByIdAndUpdate(campagin._id, {
              status: "completed",
            });
          } else {
            // refund all the investments and close the campaign
            Promise.all(
              campagin.investment.map(async (investment) => {
                const investor = await investorProfile.findOne({
                  _id: investment.investor,
                });
                const payout = await stripe.payouts.create({
                  amount: investment.amount * 100,
                  currency: investment.currency,
                  method: "standrd",
                  destination: {
                    iban: investor.iban,
                  },
                });
                if (payout.status == "paid") {
                  await Investment.findByIdAndUpdate(investment._id, {
                    payout: payout,
                    payoutAt: new Date(),
                    payoutStatus: true,
                  });
                }
                return payout;
              })
            ).then(async (payouts) => {
              console.log(payouts);
              await Project.findByIdAndUpdate(campagin._id, {
                status: "closed",
              });
            });
          }
        }
      })
    );
  },
  null,
  true,
  "America/Los_Angeles"
);

var fetchSocialData = new cron(
  "* * * * * *",
  async function () {
    // why is isActive: false???????
    const allProfiles = await creatorProfile.find();
    Promise.all(
      allProfiles.map((val, ind) => {
        let socialLinks = val.socialMediaLinks;
        if (socialLinks?.length > 0) {
          const insta = socialLinks.find((link) => {
            return link?.includes("instagram");
          });
          const spotify = socialLinks.find((link) => {
            return link?.includes("spotify");
          });
          if (insta) {
            // get insta data
            console.log(insta);
          }
          if (spotify) {
            console.log(spotify);
            // get spotify data
          }
        }
      })
    )
      .then((result) => {})
      .catch((error) => {});
  },
  null,
  true,
  "America/Los_Angeles"
);

// fetchSocialData.start();
// closeCampaigns.start();

module.exports = app;
