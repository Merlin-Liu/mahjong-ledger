const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB } = require("./db");
const { errorResponse } = require("./utils");

// 导入路由
const usersRouter = require("./routes/users");
const roomsRouter = require("./routes/rooms");
const transactionsRouter = require("./routes/transactions");

const logger = morgan("tiny");

const app = express();

// 中间件
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 注册路由
app.use("/api/users", usersRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/transactions", transactionsRouter);

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json(errorResponse(err.message || "服务器内部错误", 500));
});

const port = process.env.PORT || 80;

async function bootstrap() {
  try {
    await initDB();
    app.listen(port, () => {
      console.log(`服务器启动成功，端口: ${port}`);
    });
  } catch (error) {
    console.error("启动失败:", error);
    process.exit(1);
  }
}

bootstrap();
