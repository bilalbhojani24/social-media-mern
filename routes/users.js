const bcrypt = require("bcrypt");
const User = require("../models/user");
const router = require("express").Router();
const { statusCode } = require("../utils/statusCodeConstants");

//update user
router.put("/:id", async (req, res) => {
  let { userId, password } = req.body;

  if (userId === req.params.id || req.body.isAdmin) {
    if (password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      } catch (error) {
        return res.status(statusCode.serverError).json(error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(statusCode.OK).json("Account updated successfully!!");
    } catch (error) {
      return res.status(statusCode.serverError).json(error);
    }
  } else {
    return res
      .status(statusCode.forbidden)
      .json("You can update only your account!!");
  }
});

// delete user
router.delete("/:id", async (req, res) => {
  let { userId } = req.body;

  if (userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(statusCode.OK).json("Account has been deleted successfully!!");
    } catch (error) {
      return res.status(statusCode.serverError).json(error);
    }
  } else {
    return res
      .status(statusCode.forbidden)
      .json("You can delete only your account!!");
  }
});

//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, isAdmin, ...others } = user._doc;
    res.status(statusCode.OK).json(others);
  } catch (error) {
    return res.status(statusCode.forbidden).json("Something went wrong!!");
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(statusCode.OK).json("user has been followed");
      } else {
        res.status(statusCode.forbidden).json("you already follow this user");
      }
    } catch (err) {
      res.status(statusCode.serverError).json(err);
    }
  } else {
    res.status(statusCode.forbidden).json("you cant follow yourself");
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(statusCode.OK).json("user has been unfollowed");
      } else {
        res.status(statusCode.forbidden).json("you dont follow this user");
      }
    } catch (err) {
      res.status(statusCode.serverError).json(err);
    }
  } else {
    res.status(statusCode.forbidden).json("you cant unfollow yourself");
  }
});
module.exports = router;
