import Post from "../models/postModel.js";
import User from "../models/userModel.js";

const createPost = async(req,res) => {
 try {
    const {postedBy,text,img} = req.body;

    if(!postedBy || !text){
        return res.status(400).json({message:"PostedBy and text filed is required"})
    }
    const user = await User.findById(postedBy);
    if(!user) {
        return res.status(404).json({message:"User not found"})
    }
    if(user._id.toString() !== req.user._id.toString()){
        return res.status(401).json({message:"Unauthorized to  create post"})
    }

    const maxLenght = 500;
    if(text.lenght > maxLenght){
        return res.status(400).json({message:`Text must be less than ${maxLenght} character`})
    }

    const newPost = new Post({postedBy,text,img});
    await newPost.save();

    res.status(201).json({message:"Post create succesfully", newPost})
  } catch (err) {
    res.status(500).json({message: err.message})
    console.log("Error in creatPost controller",err);
 }
}

export {createPost}