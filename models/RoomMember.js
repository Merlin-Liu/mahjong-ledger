const { DataTypes } = require("sequelize");

/**
 * 房间成员模型
 * 存储房间成员信息，记录用户加入和离开时间
 */
function defineRoomMember(sequelize, Room, User) {
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
      // 移除唯一索引，允许多条记录以保留完整的加入/离开历史
      // 改为普通索引以提高查询性能
      {
        fields: ["roomId", "userId"],
        name: "idx_room_user",
      },
    ],
  });

  return RoomMember;
}

module.exports = defineRoomMember;

