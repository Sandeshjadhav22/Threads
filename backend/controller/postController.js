import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinay } from "cloudinary";

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "PostedBy and text filed is required" });
    }
    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to  create post" });
    }

    const maxLenght = 500;
    if (text.lenght > maxLenght) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLenght} character` });
    }

    if (img) {
      const uploadResponse = await cloudinay.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();

    res.status(201).json({ message: "Post create succesfully", newPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in creatPost controller", err);
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Posts not found" });
    }

    res.status(200).json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getpost controller", err);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "Unauthorised to deleted the post" });
    }

    if(post.img){
      const imgId =post.img.split("/").pop().split(".")[0]
      await cloudinay.uploader.destroy(imgId)
    }
 
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted succefully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in deletePost controller", err);
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      //Unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post Unlike succesfully" });
    } else {
      //Post unlike the post
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked succesfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in User LikedPost controller", err);
  }
};

const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();

    res.status(200).json({ message: "reply added succesfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in replyToPost controller", err);
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const following = user.following;
    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });

    res.status(200).json(feedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in replyToPost controller", err);
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserPosts controller", err);
  }
};
export {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
};
