const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const initModels = require("./models");

// 从环境变量中读取数据库配置
const envFile = process.env.NODE_ENV === "production" ? ".prod.env" : ".local.env";
const envPath = path.join(__dirname, envFile);
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_ADDRESS = "localhost:3306" } = process.env;

const [host, portStr] = MYSQL_ADDRESS.split(":");
const port = portStr ? parseInt(portStr, 10) : 3306;

async function initDatabase() {
  // 先连接到 MySQL 服务器（不指定数据库）
  const sequelizeWithoutDB = new Sequelize("", MYSQL_USERNAME, MYSQL_PASSWORD, {
    host,
    port,
    dialect: "mysql",
    logging: false,
  });

  try {
    // 测试连接
    await sequelizeWithoutDB.authenticate();
    console.log("✅ MySQL 服务器连接成功！");

    // 创建数据库（如果不存在）
    const queryInterface = sequelizeWithoutDB.getQueryInterface();
    await queryInterface.sequelize.query(
      `CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✅ 数据库 '${MYSQL_DATABASE}' 创建成功！`);

    // 验证数据库
    const [results] = await queryInterface.sequelize.query(`SHOW DATABASES LIKE '${MYSQL_DATABASE}';`);
    if (results.length > 0) {
      console.log(`✅ 数据库 '${MYSQL_DATABASE}' 已存在并可用`);
    }

    await sequelizeWithoutDB.close();

    // 连接到目标数据库并同步表结构
    console.log("\n正在同步数据库表结构...");
    const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD, {
      host,
      port,
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        charset: 'utf8mb4',
      },
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    });

    // 初始化模型
    initModels(sequelize);

    // 同步表结构（只创建不存在的表，不修改已存在的表）
    await sequelize.sync({ alter: false });
    console.log("✅ 数据库表结构同步完成！");

    await sequelize.close();
    console.log("\n🎉 数据库初始化完成！现在可以运行 npm run dev 了。");
  } catch (error) {
    console.error("\n❌ 数据库初始化失败！");
    console.error("错误类型:", error.name);
    console.error("错误信息:", error.message);

    if (error.message.includes("Access denied")) {
      console.error("\n💡 提示：请检查 .local.env 文件中的 MYSQL_USERNAME 和 MYSQL_PASSWORD 是否正确");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.error("\n💡 提示：请确保 MySQL 服务正在运行");
      console.error("   在 macOS 上可以运行: brew services start mysql");
    }

    process.exit(1);
  }
}

initDatabase();

