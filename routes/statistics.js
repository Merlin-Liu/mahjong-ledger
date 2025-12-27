const express = require("express");
const { User } = require("../db");
const { successResponse, errorResponse, asyncHandler } = require("../utils");

const router = express.Router();

/**
 * 获取用户统计信息
 * GET /api/statistics/users
 */
router.get("/users", asyncHandler(async (req, res) => {
  const totalUsers = await User.count();
  
  res.json(successResponse({
    totalUsers,
  }));
}));

module.exports = router;

