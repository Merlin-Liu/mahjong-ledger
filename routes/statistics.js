const express = require("express");
const { Sequelize } = require("sequelize");
const { User, Room, RoomMember } = require("../db");
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

/**
 * 获取房间统计信息
 * GET /api/statistics/rooms
 */
router.get("/rooms", asyncHandler(async (req, res) => {
  const totalRooms = await Room.count();

  res.json(successResponse({
    totalRooms,
  }));
}));

/**
 * 获取概览统计信息（包含今日和昨日数据）
 * GET /api/statistics/overview
 */
router.get("/overview", asyncHandler(async (req, res) => {
  // 获取今日开始和结束时间（UTC）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // 获取昨日开始和结束时间（UTC）
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);

  // 总数统计
  const totalUsers = await User.count();
  const totalRooms = await Room.count();

  // 今日统计
  const todayNewUsers = await User.count({
    where: {
      createdAt: {
        [Sequelize.Op.gte]: today,
        [Sequelize.Op.lte]: todayEnd,
      },
    },
  });

  const todayNewRooms = await Room.count({
    where: {
      createdAt: {
        [Sequelize.Op.gte]: today,
        [Sequelize.Op.lte]: todayEnd,
      },
    },
  });

  // 昨日统计
  const yesterdayNewUsers = await User.count({
    where: {
      createdAt: {
        [Sequelize.Op.gte]: yesterday,
        [Sequelize.Op.lte]: yesterdayEnd,
      },
    },
  });

  const yesterdayNewRooms = await Room.count({
    where: {
      createdAt: {
        [Sequelize.Op.gte]: yesterday,
        [Sequelize.Op.lte]: yesterdayEnd,
      },
    },
  });

  res.json(successResponse({
    totalUsers,
    totalRooms,
    today: {
      newUsers: todayNewUsers,
      newRooms: todayNewRooms,
    },
    yesterday: {
      newUsers: yesterdayNewUsers,
      newRooms: yesterdayNewRooms,
    },
  }));
}));

/**
 * 获取今日新增用户列表
 * GET /api/statistics/users/today
 */
router.get("/users/today", asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const users = await User.findAll({
    where: {
      createdAt: {
        [Sequelize.Op.gte]: today,
        [Sequelize.Op.lte]: todayEnd,
      },
    },
    attributes: ["id", "username", "avatarUrl", "createdAt"],
    order: [["createdAt", "DESC"]],
  });

  res.json(successResponse(users));
}));

/**
 * 获取昨日新增用户列表
 * GET /api/statistics/users/yesterday
 */
router.get("/users/yesterday", asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const users = await User.findAll({
    where: {
      createdAt: {
        [Sequelize.Op.gte]: yesterday,
        [Sequelize.Op.lte]: yesterdayEnd,
      },
    },
    attributes: ["id", "username", "avatarUrl", "createdAt"],
    order: [["createdAt", "DESC"]],
  });

  res.json(successResponse(users));
}));

/**
 * 获取用户列表
 * GET /api/statistics/users/list
 * Query参数: page (可选，默认1), pageSize (可选，默认20)
 */
router.get("/users/list", asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;

  const { count, rows: users } = await User.findAndCountAll({
    attributes: ["id", "username", "avatarUrl", "createdAt"],
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: offset,
  });

  res.json(successResponse({
    list: users,
    pagination: {
      total: count,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  }));
}));

/**
 * 获取房间列表
 * GET /api/statistics/rooms/list
 * Query参数: page (可选，默认1), pageSize (可选，默认20)
 */
router.get("/rooms/list", asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;

  const { count, rows: rooms } = await Room.findAndCountAll({
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "username", "avatarUrl"],
      },
      {
        model: RoomMember,
        as: "members",
        where: { leftAt: null },
        required: false,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "avatarUrl"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: offset,
    distinct: true, // 确保 count 正确计算
  });

  const roomsData = rooms.map(room => ({
    id: room.id,
    code: room.code,
    name: room.name,
    owner: {
      id: room.owner.id,
      username: room.owner.username,
      avatarUrl: room.owner.avatarUrl,
    },
    memberCount: room.members ? room.members.length : 0,
    members: room.members ? room.members.map(m => ({
      id: m.user.id,
      userId: m.userId,
      username: m.username,
      avatarUrl: m.user.avatarUrl,
      joinedAt: m.joinedAt,
    })) : [],
    status: room.status,
    createdAt: room.createdAt,
  }));

  res.json(successResponse({
    list: roomsData,
    pagination: {
      total: count,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  }));
}));

module.exports = router;

