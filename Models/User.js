 // this is User.Js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
     
    
    name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  bio: { type: String, default: '' },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }] // References Post model
}, { timestamps: true });





const UserModel = mongoose.model('users',UserSchema);

module.exports = UserModel;