const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const investmentSchema = new Schema({
  investor: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  // capture: {
  //   type: Boolean,
  //   default: false,
  // },
  chargeId: {
    type: String,
  },
  payout: {
    type: Schema.Types.Mixed,
  },
  payoutAt: {
    type: Date,
  },
  payoutStatus: {
    type: Boolean,
    default: false,
  },
  equityBought: { // in percentage
    type: Number,
    required: true,
  },
  // success: {
  //   type: Boolean,
  //   default: false,
  // },
});

const Investment = mongoose.model("investment", investmentSchema);
module.exports = Investment;
