const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const Constant = require("../utils/constant");

module.exports.postSignIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please add all the fields" });
  }

  let user = await User.findOne({ email }).lean();

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
  const { name, email, password, role, phoneNumber, address } = req.body;

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
          applicationIds: [],
        });

        await User.create(newUser).then((_, err) => {
          if (err) {
            console.log("err", err);
            return res.status(400).json({ message: "Sign up is failed" });
          }

          return res.json({ message: "Sign up successfully" });
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
                return res.json({ message: "Update password is failed" });
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
