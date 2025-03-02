
const { updateUser,getUser,getUserPosts,uploadPost, deletePost,likePost,commentOnPost,deleteComment,getAllPosts,searchQuery} = require('../Controllers/UserController')

 const{authMiddleware} = require('../Middlewares/authMiddleware')




const upload = require('../Models/upload');

const express = require('express');

const router = express.Router();






router.put('/edit/:id',authMiddleware,updateUser);
router.get('/:id',authMiddleware, getUser);

router.post('/:id/upload', authMiddleware, upload.single('image'), uploadPost);
router.get('/:id/posts', authMiddleware, getUserPosts);


router.get('/posts/:userId', authMiddleware, getAllPosts);

router.delete('/:userId/delete/:postId', authMiddleware, deletePost);

router.post('/post/:postId/like',authMiddleware,likePost);

router.post('/post/:postId/comment',authMiddleware,commentOnPost);

router.delete('/post/:postId/comment/:commentId', authMiddleware, deleteComment);

router.get('/query/search', authMiddleware, searchQuery);




module.exports = router;