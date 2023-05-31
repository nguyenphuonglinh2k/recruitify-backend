const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const User = require("../models/user.model");
const Constant = require("../utils/constant");

module.exports.postSignIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please add all the fields" });
  }

  let user = await User.findOne({ email }).populate(["applicationIds"]).lean();

  if (!user) {
    return res.status(400).json({ message: "Email is not exist" });
  }

  bcrypt.compare(password, user.password, function (err, result) {
    if (!result)
      return res.status(400).json({ message: "Password is not correct" });

    const token = jwt.sign({ user }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });

    delete user.password;

    return res.json({ token, user });
  });
};

module.exports.postSignUp = (req, res) => {
  const { name, email, password, role, phoneNumber, address, applicationIds } =
    req.body;

  const avatarUrl = Constant.DEFAULT_AVATAR_URL;

  // Check empty required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill out all the fields" });
  }

  // Check email format
  const emailExtension = email.slice(-10);

  if (emailExtension !== "@gmail.com")
    return res.status(400).json({ message: "Email is invalid" });

  User.findOne({ email })
    .then(result => {
      if (result) {
        return res.status(400).json({ message: "Email already exist" });
      }

      bcrypt.hash(password, Constant.BCRYPT_SALT_ROUNDS, async (err, hash) => {
        if (err) console.log(err);

        const newUser = new User({
          name,
          email,
          avatarUrl,
          role: role ?? Constant.USER_ROLE.candidate,
          phoneNumber: phoneNumber ?? null,
          address: address ?? null,
          password: hash,
          applicationIds: applicationIds ?? [],
        });

        await User.create(newUser).then((_, err) => {
          if (err) {
            console.log("err", err);
            return res.status(400).json({ message: "Sign up is failed" });
          }

          return res.status(201).json({ message: "Sign up successfully" });
        });
      });
    })
    .catch(err => console.log(err));
};

module.exports.putUpdatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.params.userId;

  if (!oldPassword || !newPassword) {
    return res.json({ message: "Please fill out the field" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User is not exist" });
    }

    bcrypt.compare(oldPassword, user.password, function (err, result) {
      if (!result) {
        return res.status(400).json({ message: "Password is not correct" });
      }

      // Password is correct
      bcrypt.hash(
        newPassword,
        Constant.BCRYPT_SALT_ROUNDS,
        function (err, hash) {
          if (err) {
            console.log(err);
            return;
          }

          User.findByIdAndUpdate({ _id: userId }, { password: hash })
            .then(result => {
              if (!result) {
                return res
                  .status(400)
                  .json({ message: "Update password is failed" });
              }
              res.json({ message: "Update password successfully" });
            })
            .catch(err => console.log(err));
        },
      );
    });
  } catch (error) {
    console.log(error);
  }
};

const generateOTP = () => {
  const OTP = otpGenerator.generate(6, {
    specialChars: false,
  });

  return OTP;
};

const sendOTPEmail = (email, otp) => {
  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    }),
  );

  var mailOptions = {
    from: process.env.MAIL_EMAIL,
    to: email,
    subject: "Recruitify Reset Password Code",
    text: `Your new password to login is: ${otp}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Check email format
  const emailExtension = email.slice(-10);

  if (emailExtension !== "@gmail.com")
    return res.status(400).json({ message: "Email is invalid" });

  try {
    // Check exist
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email doesn't exist" });
    }

    const newPassword = generateOTP();
    sendOTPEmail(process.env.MAIL_EMAIL, newPassword);

    console.log("newPassword", newPassword);

    // Update password
    bcrypt.hash(newPassword, Constant.BCRYPT_SALT_ROUNDS, function (err, hash) {
      if (err) {
        console.log("err", err);
        throw new Error(err);
      }

      User.findByIdAndUpdate({ _id: user._id }, { password: hash })
        .then(result => {
          if (!result) {
            return res
              .status(400)
              .json({ message: "Reset password is failed" });
          }
          res.json({ message: "Reset password successfully" });
        })
        .catch(err => console.log(err));
    });
  } catch (error) {
    res.status(400).json(error);
  }
};
