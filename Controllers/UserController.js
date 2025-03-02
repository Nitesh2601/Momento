
const UserModel = require('../Models/User')



const PostModel = require('../Models/Post')


 const cloudinary = require('../config/cloudinary');

 

const updateUser = async (req, res)=>{

    try {

        const { _id, name, bio, description} = req.body;

        const user = await UserModel.findById(_id);

        if(!user){

            return res.status(404).json ({message: 'User not found', success : false});

        }

        user.name = name || user.name;
        user.bio = bio || user.bio;
        user.description = description || user.description;
        await user.save();

         res.status(200).json({message: 'User details updated successfully', success: true, user});
        
    } catch (error) {
        
        res.status(500).json({ message: 'Internal server error', success: false});
    }

};



const getUser = async (req, res) => {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found', success: false });
      }
      res.status(200).json({ success: true, user });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', success: false });
    }
  };


 


  const getAllPosts = async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('Fetching posts for user:', userId);
  
      const posts = await PostModel.find()
        .populate('user', 'name profilePic')
        .populate('comments.user', 'name profilePic')
        .populate('likes', 'name profilePic')
        .sort({ createdAt: -1 });
  
      if (!posts.length) {
        return res.status(404).json({ success: false, message: 'No posts available for this user' });
      }
  
      res.status(200).json({ success: true, posts });
    } catch (error) {
      console.error('Error fetching user posts:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  };




  
  



const uploadPost = async (req, res) => {
  console.log('Uploaded File:', req.file);

  try {
      if (!req.file || !req.file.path) {
          return res.status(400).json({ success: false, message: 'No image uploaded' });
      }

      const { caption } = req.body;
      if (!caption) {
          return res.status(400).json({ success: false, message: 'Caption is required' });
      }

      const user = await UserModel.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      // Create new post with image
      const newPost = new PostModel({
          user: user._id,
          caption,
          image: {
              url: result.secure_url,
              public_id: result.public_id
          },
          likes: [],
          comments: []
      });

      await newPost.save();

      // Push post into user's posts array
      user.posts.push(newPost._id);
      await user.save();

      res.status(200).json({ success: true, message: 'Post created successfully', post: newPost });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};












const getUserPosts = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch posts of the user with image, caption, likes, and comments
    const posts = await PostModel.find({ user: user._id })
      .populate('user', 'name profilePic') // Get user name and profilePic
      .populate('comments.user', 'name profilePic') // Populate comments with user info
      .sort({ createdAt: -1 }); // Sort posts by latest

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};





// delete post

const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  console.log('user id of post owner',userId );

  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Only allow post owner to delete
    if (post.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Extract public_id from the image URL
    
    const publicId = post.image.public_id; 

   

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove post from database
    await post.deleteOne();

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};









// ✅ Like Post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    console.log('postid is',postId);
    const userId = req.user.id; // Get user from auth middleware

    console.log('Like request received for post:', req.params);

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // If user hasn't liked, add like
      post.likes.push(userId);
    } else {
      // If user has already liked, remove like (toggle like)
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({ success: true, likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Comment on Post


const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id; // Get user from auth middleware

    if (!text) return res.status(400).json({ success: false, message: 'Comment cannot be empty' });

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const newComment = { user: userId, text, createdAt: new Date() };
    post.comments.push(newComment);

    await post.save();

    const updatedPost = await PostModel.findById(postId).populate('comments.user', 'name');

    res.status(200).json({ success: true, comments: updatedPost.comments });
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// delete comment
const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user.id; // Authenticated user

  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Find the comment inside the post
    const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const commentOwnerId = post.comments[commentIndex].user.toString();
    const postOwnerId = post.user.toString();

    // Allow only the comment owner or the post owner to delete the comment
    if (userId !== commentOwnerId && userId !== postOwnerId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    // Remove the comment
    post.comments.splice(commentIndex, 1);
    await post.save();

    return res.json({ success: true, message: 'Comment deleted successfully', comments: post.comments });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const searchQuery = async(req,res)=>{

  try {

    
    console.log('Incoming request:', req.query);
    const { query } = req.query; // Get search query from request
    if (!query) return res.json({ success: true, users: [] });

    const users = await UserModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Case-insensitive name search
        { username: { $regex: query, $options: 'i' } }, // Case-insensitive username search
      ],
    }).select('_id name username profilePic'); // Only return necessary fields

    res.json({ success: true, users });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }

};







module.exports = {updateUser, getUser, uploadPost, getUserPosts,commentOnPost, likePost, deleteComment , deletePost, getAllPosts, searchQuery};