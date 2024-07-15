const User = require("../models/User/user");
const sendMail = require("../utils/sendMail");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const ejs = require("ejs");
//register
const register = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { firstname, lastname, email, password, role } = req.body;
    if (
      !password.match(
        /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/
      )
    ) {
      return ErrorHandler(
        "Password must contain atleast one uppercase letter, one special character and one number",
        400,
        req,
        res
      );
    }
    const user = await User.findOne({ email });
    if (user) {
      return ErrorHandler("User already exists", 400, req, res);
    }

    console.log(req.body);
    const newUser = await User.create({
      firstName: firstname,
      lastName: lastname,
      // middleName,
      // title,
      email,
      password,
      role,
    });
    newUser.save();
    return SuccessHandler("User created successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//request email verification token
const requestEmailToken = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000);
    const emailVerificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await user.save();
    const template = await ejs.renderFile(
      `${__dirname}/../ejs/verifyEmail.ejs`,
      {
        otp: emailVerificationToken,
      }
    );

    const subject = `Email verification token`;
    await sendMail(email, subject, template);

    return SuccessHandler(
      `Email verification token sent to ${email}`,
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//verify email token
const verifyEmail = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email, emailVerificationToken } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }
    if (
      user.emailVerificationToken !== emailVerificationToken ||
      user.emailVerificationTokenExpires < Date.now()
    ) {
      return ErrorHandler("Invalid token", 400, req, res);
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    jwtToken = user.getJWTToken();
    await user.save();
    return SuccessHandler("Email verified successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//login
const login = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true }).select(
      "+password"
    );
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ErrorHandler("Invalid credentials", 400, req, res);
    }
    if (!user.emailVerified) {
      return ErrorHandler("Email not verified", 400, req, res);
    }
    jwtToken = user.getJWTToken();
    let userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      _id: user._id,
    };
    return SuccessHandler(
      {
        message: "Logged in successfully",
        token: jwtToken,
        userData: userData,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//logout
const logout = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    req.user = null;
    return SuccessHandler("Logged out successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const passwordResetToken = Math.floor(100000 + Math.random() * 900000);
    const passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = passwordResetTokenExpires;
    await user.save();
    const template = await ejs.renderFile(
      `${__dirname}/../ejs/resetPassword.ejs`,
      {
        otp: passwordResetToken,
      }
    );
    const subject = `Password reset token`;
    await sendMail(email, subject, template);
    // await sendMail(email, subject, message);
    return SuccessHandler(`Password reset token sent to ${email}`, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//reset password
const resetPassword = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email, passwordResetToken, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    if (
      user.passwordResetToken !== passwordResetToken ||
      user.passwordResetTokenExpires < Date.now()
    ) {
      return ErrorHandler("Invalid token", 400, req, res);
    }
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      return ErrorHandler(
        "New password can not be same as old password",
        400,
        req,
        res
      );
    }
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();
    return SuccessHandler("Password reset successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const thirdPartyAuth = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { name, email, accessToken, role, provider } = req.body;

    if (provider !== "google" && provider !== "facebook") {
      return ErrorHandler("Invalid provider", 400, req, res);
    }

    const userWithEmail = await User.findOne({ email });
    if (!userWithEmail) {
      const newUser = await User.create({
        firstName: name,
        email,
        role,
        provider,
        accessToken,
        emailVerified: true,
      });
      newUser.save();
      return SuccessHandler("User created successfully", 200, res);
    }
    if (userWithEmail.isActive === false) {
      return ErrorHandler("Email has been blocked", 400, req, res);
    }
    if (
      userWithEmail.accessToken === accessToken &&
      userWithEmail?.provider === provider
    ) {
      jwtToken = userWithEmail.getJWTToken();
      let userData = {
        firstName: userWithEmail.firstName,
        lastName: userWithEmail.lastName,
        email: userWithEmail.email,
        // role: userWithEmail.role,
        _id: userWithEmail._id,
      };
      return SuccessHandler(
        {
          message: "Logged in successfully",
          token: jwtToken,
          userData: userData,
        },
        200,
        res
      );
    }
    if (userWithEmail.provider !== provider) {
      return ErrorHandler(
        "You are registered with " + userWithEmail.provider,
        400,
        req,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  register,
  requestEmailToken,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  thirdPartyAuth,
};
