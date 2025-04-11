const bcrypt = require("bcryptjs");
const User = require("../models/userlogin.model");
const UserDetails = require("../models/userdetails.model");

const changePassword = async (req, res) => {
  const { oldPass, newPass, confirmPass } = req.body;
  const userID = req.userID;
  const user = await User.findByPk(userID);

  try {
    const hashedOldPass = await bcrypt.compare(oldPass, user.password);

    if (hashedOldPass) {
      if (newPass !== confirmPass) {
        return res.json({ message: "Passwords did not match!" });
      } else {
        const hashedNewPass = await bcrypt.hash(newPass, 10);

        await User.update(
          {
            password: hashedNewPass,
          },
          {
            where: {
              login_id: userID,
            },
          }
        );

        return res.json({ message: "Success" });
      }
    } else {
      return res.json({ message: "Old Password did not match!" });
    }
  } catch (error) {
    console.error("Error during changing password:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while changing password" });
  }
};

const editUserDetails = async (req, res) => {
  const { firstname, lastname, contact, email } = req.body;
  const userID = req.userID;
  const user = await User.findByPk(userID);

  try {
    await UserDetails.update(
      {
        fname: firstname,
        lname: lastname,
        user_email: email,
        user_contact: contact,
      },
      {
        where: {
          user_details_id: user.user_details_id,
        },
      }
    );

    return res.json({ message: "Successfully changed" });
  } catch (error) {
    console.error("Error during changing details:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while changing details" });
  }
};

const uploadProfilePic = async (req, res) => {
  const userID = req.userID;
  const user = await User.findByPk(userID);
  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const updatedUserDetail = await UserDetails.update(
      {
        profile_pic: uploadedFile.filename,
      },
      {
        where: {
          user_details_id: user.user_details_id,
        },
      }
    );

    if (!updatedUserDetail) {
      return res
        .status(400)
        .json({ error: "Failed to update profile picture" });
    }

    return res
      .status(200)
      .json({ message: "Profile picture uploaded and updated successfully" });
  } catch (error) {
    console.error("Error uploading and updating profile picture:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { changePassword, editUserDetails, uploadProfilePic };
