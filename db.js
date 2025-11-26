const { Sequelize, DataTypes } = require("sequelize");

// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "localhost:3306" } = process.env;

const [host, portStr] = MYSQL_ADDRESS.split(":");
const port = portStr ? parseInt(portStr, 10) : 3306;

const sequelize = new Sequelize("nodejs_demo", MYSQL_USERNAME, MYSQL_PASSWORD, {
  host: host || "localhost",
  port: port || 3306,
  dialect: "mysql",
  logging: false, // 可以设置为 console.log 来查看 SQL 查询
});

// ==================== 数据模型定义 ====================

// 用户模型
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  wxOpenId: {
    type: DataTypes.STRING(128),
    allowNull: true,
    unique: true,
    comment: "微信OpenID",
  },
  username: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: "用户名",
  },
}, {
  tableName: "users",
  timestamps: true,
});

// 房间模型
const Room = sequelize.define("Room", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
    comment: "房间邀请码",
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: "房间名称",
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    comment: "房主ID",
  },
  status: {
    type: DataTypes.ENUM("active", "closed"),
    allowNull: false,
    defaultValue: "active",
    comment: "房间状态：active-活跃, closed-已关闭",
  },
}, {
  tableName: "rooms",
  timestamps: true,
});

// 房间成员模型
const RoomMember = sequelize.define("RoomMember", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Room,
      key: "id",
    },
    comment: "房间ID",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    comment: "用户ID",
  },
  username: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: "在房间中的用户名",
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: "加入时间",
  },
  leftAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: "离开时间",
  },
}, {
  tableName: "room_members",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["roomId", "userId"],
      name: "unique_room_user",
    },
  ],
});

// 转账记录模型
const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Room,
      key: "id",
    },
    comment: "房间ID",
  },
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    comment: "转出用户ID",
  },
  toUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    comment: "转入用户ID",
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: "转账金额（元）",
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: "转账描述",
  },
}, {
  tableName: "transactions",
  timestamps: true,
});

// ==================== 模型关联关系 ====================

// User 和 Room 的关系（一对多：一个用户可以是多个房间的房主）
User.hasMany(Room, { foreignKey: "ownerId", as: "ownedRooms" });
Room.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// User 和 RoomMember 的关系（多对多：一个用户可以加入多个房间）
User.hasMany(RoomMember, { foreignKey: "userId", as: "roomMemberships" });
RoomMember.belongsTo(User, { foreignKey: "userId", as: "user" });

// Room 和 RoomMember 的关系（一对多：一个房间可以有多个成员）
Room.hasMany(RoomMember, { foreignKey: "roomId", as: "members" });
RoomMember.belongsTo(Room, { foreignKey: "roomId", as: "room" });

// User 和 Transaction 的关系（一对多：一个用户可以有多个转出记录）
User.hasMany(Transaction, { foreignKey: "fromUserId", as: "sentTransactions" });
Transaction.belongsTo(User, { foreignKey: "fromUserId", as: "fromUser" });

// User 和 Transaction 的关系（一对多：一个用户可以有多个转入记录）
User.hasMany(Transaction, { foreignKey: "toUserId", as: "receivedTransactions" });
Transaction.belongsTo(User, { foreignKey: "toUserId", as: "toUser" });

// Room 和 Transaction 的关系（一对多：一个房间可以有多个转账记录）
Room.hasMany(Transaction, { foreignKey: "roomId", as: "transactions" });
Transaction.belongsTo(Room, { foreignKey: "roomId", as: "room" });

// ==================== 数据库初始化 ====================

async function init() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log("数据库连接成功！");
    
    // 同步所有模型（创建表）
    await sequelize.sync({ alter: true });
    console.log("数据库模型同步成功！");
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
}

// 导出模型和初始化方法
module.exports = {
  init,
  sequelize,
  User,
  Room,
  RoomMember,
  Transaction,
};
