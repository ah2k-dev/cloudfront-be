const User = require("../models/User/user");

const getAdminId = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      console.log(admin._id);
      return admin._id;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = { getAdminId };
