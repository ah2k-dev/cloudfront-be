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
});

const Investment = mongoose.model("investment", investmentSchema);
module.exports = Investment;
