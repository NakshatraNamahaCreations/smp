const usermodel = require("../../Model/userRights/userRights");
const bcrypt = require("bcryptjs");

class masteruser {
  // add
  async adduser(req, res) {
    try {
      let {
        displayname,
        contactno,
        loginnameOrEmail,
        password,
        confirmPassword,
        primages,
        state,
      } = req.body;
      let file = req.file?.filename;
      // Validate the input

      if (
        !displayname ||
        !contactno ||
        !loginnameOrEmail ||
        !password ||
        !confirmPassword ||
        !state
      ) {
        return res.status(500).json({ error: "All fields must not be empty" });
      } else if (loginnameOrEmail.length < 3) {
        return res
          .status(500)
          .json({ error: "Name must be at least 3 characters long" });
      } else if (password != confirmPassword) {
        return res.status(500).json({ error: "Password mismatch" });
      } else if (password.length < 1) {
        return res
          .status(500)
          .json({ error: "Password should be at least 8 characters long" });
      }

      // Check if the email or name already exists
      const emailOrNameExists = await usermodel.findOne({
        $or: [
          { loginnameOrEmail: loginnameOrEmail },
          // { email: loginnameOrEmail },
        ],
      });
      if (emailOrNameExists) {
        return res.status(500).json({ error: " Email already exists" });
      }

      // Check if the contact already exists
      const contactnoExists = await usermodel.findOne({
        $or: [
          { contactno: contactno },
          // { email: loginnameOrEmail },
        ],
      });
      if (contactnoExists) {
        return res.status(500).json({ error: "Conatct Number already exists" });
      }

      // Check if the display name already exists
      // const displaynameExists = await usermodel.findOne({
      //   $or: [{ displayname: displayname }],
      // });
      // if (displaynameExists) {
      //   return res
      //     .status(500)
      //     .json({ error: `Try another name!` + displayname + `already exits` });
      // }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      let NewUser = new usermodel({
        displayname,
        contactno,
        loginnameOrEmail,
        password: hashedPassword,
        primages: file,
        state,
      });

      if (!file) {
        return res.status(400).json({
          status: 400,
          error: "Please select client image",
        });
      }
      console.log(primages, "primages");
      // Save the user
      const data = await NewUser.save();
      console.log(data);
      return res
        .status(200)
        .json({ success: "User added successfully", userdata: data });
    } catch (error) {
      console.error("Error saving user:", error);
      return res
        .status(500)
        .json({ error: "Error saving user", details: error.message });
    }
  }
  // login user

  async loginUser(req, res) {
    const { loginnameOrEmail, password } = req.body;
    try {
      if (!loginnameOrEmail) {
        return res
          .status(400)
          .json({ error: "Please enter your loginname or email" });
      }
      if (!password) {
        return res.status(400).json({ error: "Please enter your password" });
      }
      const user = await usermodel.findOne({ loginnameOrEmail });
      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found or invalid password" });
      }
      const passwordmatch = bcrypt.compareSync(password, user.password);
      if (!passwordmatch) {
        return res.status(401).json({ error: "Invalid password" });
      }
      await usermodel.findOneAndUpdate(
        { loginnameOrEmail },
        { status: "Online" }
      );
      return res.json({ success: "Login successful", user });
    } catch (error) {
      console.error("Something went wrong", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  //edit user
  async edituser(req, res) {
    try {
      const userData = req.params.userId;
      const {
        displayname,
        contactno,
        loginnameOrEmail,
        password,
        confirmPassword,
        state,
        oldPassword,
        newPassword,
        newConfirmPassword,
      } = req.body;

      // check if loginname is already exists
      const existingLoginnameOrEmail = await usermodel.findOne({
        loginnameOrEmail: loginnameOrEmail,
      });
      if (existingLoginnameOrEmail) {
        return res
          .status(400)
          .json({ error: "Loginname or Email already exists" });
      }

      // check if displayname is already exists
      const existingDisplayName = await usermodel.findOne({
        displayname: displayname,
      });
      if (existingDisplayName) {
        return res.status(400).json({ error: "Displayname already exists" });
      }

      // check if contact is already exists
      const existingContactno = await usermodel.findOne({
        contactno: contactno,
      });
      if (existingContactno) {
        return res.status(400).json({ error: "Contactno already exists" });
      }

      // Check if the user exists
      const user = await usermodel.findOne({ _id: userData });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update the user
      user.displayname = displayname || user.displayname;
      user.contactno = contactno || user.contactno;
      user.loginnameOrEmail = loginnameOrEmail || user.loginnameOrEmail;
      user.state = state || user.state;
      user.password = password
        ? await bcrypt.hash(password, 10)
        : user.password;
      user.confirmPassword = confirmPassword;
      // user.oldPassword = oldPassword;
      // user.newPassword = newPassword;
      // user.newConfirmPassword = newConfirmPassword;
      await usermodel.findByIdAndUpdate(userData, user);
      return res
        .status(200)
        .json({ message: "Updated successfully", data: user });
    } catch (error) {
      console.log("Error in updateprofile: ", error);
      return res.status(500).send({
        message:
          "Something went wrong while updating your details. Please try again later.",
      });
    }
  }

  async giveRights(req, res) {
    try {
      const userData = req.params.userId;
      const {
        categoryMamgement,
        vendor,
        client,
        jobmangement,
        Recce,
        Design,
        printing,
        fabrication,
        installation,
        marketing,
        trackjob,
        reports,
        billing,
        department,
      } = req.body;
      let obj = {};
      // Check if the user exists
      const user = await usermodel.findOne({ _id: userData });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (typeof categoryMamgement !== "undefined") {
        obj["categoryMamgement"] = categoryMamgement;
      }
      if (typeof vendor !== "undefined") {
        obj["vendor"] = vendor;
      }
      if (typeof client !== "undefined") {
        obj["client"] = client;
      }
      if (typeof jobmangement !== "undefined") {
        obj["jobmangement"] = jobmangement;
      }
      if (typeof Recce !== "undefined") {
        obj["Recce"] = Recce;
      }
      if (typeof Design !== "undefined") {
        obj["Design"] = Design;
      }
      if (typeof printing !== "undefined") {
        obj["printing"] = printing;
      }
      if (typeof fabrication !== "undefined") {
        obj["fabrication"] = fabrication;
      }
      if (typeof installation !== "undefined") {
        obj["installation"] = installation;
      }
      if (typeof marketing !== "undefined") {
        obj["marketing"] = marketing;
      }
      if (typeof trackjob !== "undefined") {
        obj["trackjob"] = trackjob;
      }
      if (typeof billing !== "undefined") {
        obj["billing"] = billing;
      }
      if (typeof reports !== "undefined") {
        obj["reports"] = reports;
      }
      if (typeof department !== "undefined") {
        obj["department"] = department;
      }

      let isData = await usermodel.findOneAndUpdate(
        { _id: userData },
        { $set: obj },
        {
          new: true,
        }
      );
      if (isData) {
        return res
          .status(200)
          .json({ message: "Updated successfully", data: isData });
      } else {
        return res.status(500).json({ status: false, msg: "No such profile" });
      }
    } catch (error) {
      console.log("Error in updateprofile : ", error);
      return res.status(403).send({
        message:
          "Something went wrong while updating your details Please try again later.",
      });
    }
  }
  //change password
  async changePassword(req, res) {
    try {
      const userData = req.params.userId;

      const { oldPassword, newPassword, newConfirmPassword } = req.body;

      const user = await usermodel.findById(userData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the old password matches the stored password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid old password" });
      }

      // Check if the new password and confirm password match
      if (newPassword !== newConfirmPassword) {
        return res
          .status(400)
          .json({ error: "New password and confirm password do not match" });
      }

      // Update the password
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      // Return a success message
      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.log("Error in changePassword: ", error);
      return res.status(500).send({
        message:
          "Something went wrong while changing the password. Please try again later.",
      });
    }
  }

  //get all master added user

  async getuser(req, res) {
    let data = await usermodel.find({}).sort({ _id: -1 });
    if (data) {
      return res.json({ masteruser: data });
    }
  }

  async postdeleteuser(req, res) {
    let id = req.params.id;
    const data = await usermodel.deleteOne({ _id: id });
    try {
      return res.status(200).json({ data: data, success: "Successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err: "err" });
    }
  }

  async getsignout(req, res) {
    let id = req.params.id;
    try {
      const data = await usermodel.findOneAndUpdate(
        { _id: id },
        { status: "offline" }
      );
      if (!data) {
        return res.status(403).json({
          error: "Cannot able to find the user",
        });
      } else {
        return res.json({ success: "Sign Out Successful" });
      }
    } catch (err) {
      console.log(err);
    }
  }
}

const userController = new masteruser();
module.exports = userController;
