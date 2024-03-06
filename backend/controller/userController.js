import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genrateTokenAndSetCookie from "../utils/helpers/genrateTokenAndSetCookie.js";

const signupUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ mesaage: "User already exits" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    if (newUser) {
      genrateTokenAndSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      res.status(400).json({ mesaage: "Invalid user Data" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log("Error in signup user", err.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      res.status(404).json({ mesaage: "Invalid username or password" });
    }

    genrateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: error.mesaage });
    console.log("Error in login controller", error.mesaage);
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ mesaage: "User looged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.mesaage });
    console.log("Error in logOut controller", error.mesaage);
  }
};

const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user_id)
      return res
        .status(400)
        .json({ mesaage: "You cannot follow/unfollow yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ mesaage: "User not found" });

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //Unfollow User
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({mesaage:"User unfollowed succesfully"})
    } else {
        //Follow User
        await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
        await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
        res.status(200).json({mesaage:"User followed succesfully"})
    }
  } catch (error) {
    res.status(500).json({ message: error.mesaage });
    console.log("Error in followUnFollowUser controller", error.mesaage);
  }
};

export { signupUser, loginUser, logoutUser, followUnFollowUser };
