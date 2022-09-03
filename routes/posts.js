const router = require('express').Router();
const Post = require('../models/post');
const User = require('../models/user');
const { statusCode } = require('../utils/statusCodeConstants');

//create a post
router.post('/', async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(statusCode.OK).json(savedPost);
  } catch (err) {
    res.status(statusCode.serverError).json(err);
  }
});

//update a post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(statusCode.OK).json('the post has been updated');
    } else {
      res.status(statusCode.forbidden).json('you can update only your post');
    }
  } catch (err) {
    res.status(statusCode.serverError).json(err);
  }
});

//delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(statusCode.OK).json('the post has been deleted');
    } else {
      res.status(statusCode.forbidden).json('you can delete only your post');
    }
  } catch (err) {
    res.status(statusCode.serverError).json(err);
  }
});

//like / dislike a post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(statusCode.OK).json('The post has been liked');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(statusCode.OK).json('The post has been disliked');
    }
  } catch (err) {
    res.status(statusCode.serverError).json(err);
  }
});
//get a post

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(statusCode.OK).json(post);
  } catch (err) {
    res.status(statusCode.serverError).json(err);
  }
});

//get timeline posts

router.get('/timeline/all', async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(statusCode.serverError).json(err);
  }
});

module.exports = router;
