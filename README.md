# 打牌记账应用后端

基于 Express + Sequelize + MySQL 开发的打牌记账应用后端 API。

## 功能特性

- ✅ 用户管理（支持微信 OpenID）
- ✅ 房间创建和管理（邀请码、二维码）
- ✅ 房间成员管理（加入/离开）
- ✅ 虚拟转账功能
- ✅ 活动记录（进入/离开/转账）
- ✅ 房间历史查询
- ✅ 房主关闭房间功能

![](https://qcloudimg.tencent-cloud.cn/raw/be22992d297d1b9a1a5365e606276781.png)

## 快速开始

前往 [微信云托管快速开始页面](https://cloud.weixin.qq.com/cloudrun/onekey)，选择相应语言的模板，根据引导完成部署。

## 本地调试
下载代码在本地调试，请参考[微信云托管本地调试指南](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/guide/debug/)

## 实时开发
代码变动时，不需要重新构建和启动容器，即可查看变动后的效果。请参考[微信云托管实时开发指南](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/guide/debug/dev.html)

## Dockerfile最佳实践
请参考[如何提高项目构建效率](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/scene/build/speed.html)

## 项目结构说明

```
.
├── Dockerfile
├── README.md
├── API.md              # API 详细文档
├── container.config.json
├── db.js                # 数据库模型定义
├── index.js             # 项目入口，实现所有 API 路由
├── utils.js             # 工具函数
├── index.html           # 首页代码
├── package.json         # Node.js 项目定义文件
├── .local.env           # 本地环境变量配置
└── Dockerfile           # 容器配置文件
```

## 数据库模型

- **User**: 用户表（支持微信 OpenID）
- **Room**: 房间表（包含房间码、房主、状态）
- **RoomMember**: 房间成员表（记录加入/离开时间）
- **Transaction**: 转账记录表（记录用户间的转账）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

编辑 `.local.env` 文件，配置数据库连接信息：

```env
MYSQL_ADDRESS=localhost:3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password
```

### 3. 启动服务

```bash
npm start
```

服务将在 `http://localhost:80` 启动（或根据环境变量 `PORT` 配置的端口）

## API 文档

详细的 API 文档请查看 [API.md](./API.md)

### 主要 API 端点

- **用户相关**
  - `POST /api/users` - 创建或获取用户
  - `GET /api/users/:id` - 获取用户信息
  - `GET /api/users/:id/rooms` - 获取用户房间历史

- **房间相关**
  - `POST /api/rooms` - 创建房间
  - `GET /api/rooms/:code` - 获取房间信息
  - `POST /api/rooms/:code/join` - 加入房间
  - `POST /api/rooms/:code/leave` - 离开房间
  - `POST /api/rooms/:code/close` - 关闭房间
  - `GET /api/rooms/:code/members` - 获取房间成员
  - `GET /api/rooms/:code/activities` - 获取房间活动记录

- **转账相关**
  - `POST /api/transactions` - 创建转账记录
  - `GET /api/rooms/:code/transactions` - 获取房间转账记录

## 使用示例

### 创建用户并创建房间

```bash
# 1. 创建用户
curl -X POST http://localhost:80/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "张三"}'

# 响应: {"code":0,"message":"success","data":{"id":1,"username":"张三",...}}

# 2. 创建房间（使用返回的 userId）
curl -X POST http://localhost:80/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"ownerId": 1, "name": "我的房间"}'

# 响应: {"code":0,"message":"success","data":{"id":1,"code":"123456",...}}

# 3. 查看房间信息
curl http://localhost:80/api/rooms/123456
```

更多示例请参考 [API.md](./API.md)

## 使用注意
如果不是通过微信云托管控制台部署模板代码，而是自行复制/下载模板代码后，手动新建一个服务并部署，需要在「服务设置」中补全以下环境变量，才可正常使用，否则会引发无法连接数据库，进而导致部署失败。
- MYSQL_ADDRESS
- MYSQL_PASSWORD
- MYSQL_USERNAME
以上三个变量的值请按实际情况填写。如果使用云托管内MySQL，可以在控制台MySQL页面获取相关信息。


## License

[MIT](./LICENSE)
