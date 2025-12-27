# 麻将记账应用 - 统计页面

这是一个使用 rsbuild + React 构建的用户统计页面，用于展示后端用户数据。

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署

构建完成后，`dist` 目录中的文件可以部署到任何静态文件服务器。

## API 接口

项目需要后端提供 `/api/statistics/users` 接口，返回格式：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalUsers": 100
  }
}
```

