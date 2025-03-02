const mongoose = require('mongoose');



const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Who created the post
  caption: { type: String, required: true },

  image: {
    url: { type: String, required: true }, // Cloudinary image URL
    public_id: { type: String, required: true } // Cloudinary image ID (for deletion)
  },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], // Users who liked the post
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Who commented
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

//  const PostModel = mongoose.model('Post', PostSchema);

 const PostModel = mongoose.models.Post || mongoose.model('Post', PostSchema);



module.exports = PostModel;