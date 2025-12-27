# Nginx 反向代理配置指引

本文档说明如何配置 Nginx，将 `http://host.guangfu.ink/mahjong-ledger/api/xxxx` 转发到 ECS 上运行在 3000 端口的 Node.js 服务。

## 前置条件

- ✅ ECS 上已安装并运行 Nginx
- ✅ Node.js 服务已启动（运行在 3000 端口）
- ✅ 域名 `host.guangfu.ink` 已解析到 ECS IP
- ✅ 服务可通过 `http://localhost:3000` 正常访问

## 步骤 1：检查 Nginx 配置

```bash
# 检查 Nginx 是否运行
systemctl status nginx

# 查看 Nginx 配置文件位置
nginx -t

# 通常配置文件位于：
# CentOS/RHEL: /etc/nginx/nginx.conf
# Ubuntu/Debian: /etc/nginx/nginx.conf
```

## 步骤 2：创建 Nginx 配置文件

### 方法 1：在主配置文件中添加（推荐）

编辑主配置文件：

```bash
# CentOS/RHEL
vi /etc/nginx/nginx.conf

# Ubuntu/Debian
sudo vi /etc/nginx/nginx.conf
```

在 `http` 块中添加以下配置：

```nginx
http {
    # ... 其他配置 ...

    # 打牌记账应用 API 反向代理配置
    server {
        listen 80;
        server_name host.guangfu.ink;

        # 日志配置
        access_log /var/log/nginx/mahjong-ledger-access.log;
        error_log /var/log/nginx/mahjong-ledger-error.log;

        # API 路径转发
        location /mahjong-ledger/api/ {
            # 移除路径前缀 /mahjong-ledger，只保留 /api/
            rewrite ^/mahjong-ledger/api/(.*)$ /api/$1 break;
            
            # 转发到本地 Node.js 服务
            proxy_pass http://127.0.0.1:3000;
            
            # 设置代理头信息
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            
            # 超时设置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            # 缓冲设置
            proxy_buffering off;
            proxy_request_buffering off;
        }

        # 健康检查端点（可选）
        location /mahjong-ledger/health {
            proxy_pass http://127.0.0.1:3000/;
            access_log off;
        }

        # 根路径重定向（可选）
        location = /mahjong-ledger {
            return 301 /mahjong-ledger/;
        }

        location = /mahjong-ledger/ {
            return 200 'Mahjong Ledger API Service';
            add_header Content-Type text/plain;
        }
    }
}
```

### 方法 2：使用独立的配置文件（更推荐）

创建独立的配置文件：

```bash
# 创建配置文件
vi /etc/nginx/conf.d/mahjong-ledger.conf
```

将以下内容写入文件：

```nginx
# 打牌记账应用 API 反向代理配置
server {
    listen 80;
    server_name host.guangfu.ink;

    # 日志配置
    access_log /var/log/nginx/mahjong-ledger-access.log;
    error_log /var/log/nginx/mahjong-ledger-error.log;

    # API 路径转发
    location /mahjong-ledger/api/ {
        # 移除路径前缀 /mahjong-ledger，只保留 /api/
        rewrite ^/mahjong-ledger/api/(.*)$ /api/$1 break;
        
        # 转发到本地 Node.js 服务
        proxy_pass http://127.0.0.1:3000;
        
        # 设置代理头信息
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering off;
        proxy_request_buffering off;
        
        # CORS 支持（如果前端需要）
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        
        # 处理 OPTIONS 预检请求
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # 健康检查端点（可选）
    location /mahjong-ledger/health {
        proxy_pass http://127.0.0.1:3000/;
        access_log off;
    }

    # 根路径重定向（可选）
    location = /mahjong-ledger {
        return 301 /mahjong-ledger/;
    }

    location = /mahjong-ledger/ {
        return 200 'Mahjong Ledger API Service';
        add_header Content-Type text/plain;
    }
}
```

**注意**：如果主配置文件中有 `include /etc/nginx/conf.d/*.conf;`，则方法 2 会自动生效。

## 步骤 3：测试 Nginx 配置

```bash
# 测试配置文件语法
nginx -t

# 如果看到以下输出，说明配置正确：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

如果测试失败，请检查：
- 配置文件语法是否正确
- 是否有重复的 `server_name` 配置
- 端口是否被占用

## 步骤 4：重启 Nginx

```bash
# 重新加载配置（推荐，不会中断服务）
nginx -s reload

# 或者重启 Nginx
systemctl restart nginx

# 检查状态
systemctl status nginx
```

## 步骤 5：验证配置

### 5.1 检查服务是否运行

```bash
# 检查 Node.js 服务（通过 pm2）
pm2 status

# 或者检查端口
netstat -tlnp | grep 3000
ss -tlnp | grep 3000

# 测试本地服务
curl http://localhost:3000/api/users
```

### 5.2 测试 Nginx 转发

```bash
# 在 ECS 上测试
curl http://localhost/mahjong-ledger/api/users

# 或者使用域名测试
curl http://host.guangfu.ink/mahjong-ledger/api/users

# 测试健康检查
curl http://host.guangfu.ink/mahjong-ledger/health
```

### 5.3 从外部测试

在本地浏览器或使用 curl：

```bash
# 测试 API
curl http://host.guangfu.ink/mahjong-ledger/api/users

# 测试创建用户
curl -X POST http://host.guangfu.ink/mahjong-ledger/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "测试用户"}'
```

## 路径映射说明

| 外部访问路径 | Nginx 转发后 | 实际后端路径 |
|------------|------------|------------|
| `http://host.guangfu.ink/mahjong-ledger/api/users` | `/api/users` | `http://127.0.0.1:3000/api/users` |
| `http://host.guangfu.ink/mahjong-ledger/api/rooms` | `/api/rooms` | `http://127.0.0.1:3000/api/rooms` |
| `http://host.guangfu.ink/mahjong-ledger/api/transactions` | `/api/transactions` | `http://127.0.0.1:3000/api/transactions` |

## 配置 HTTPS（可选，推荐）

如果需要配置 HTTPS，可以使用 Let's Encrypt 免费证书：

### 1. 安装 Certbot

```bash
# CentOS/RHEL
yum install -y certbot python3-certbot-nginx

# Ubuntu/Debian
apt-get install -y certbot python3-certbot-nginx
```

### 2. 获取证书并自动配置

```bash
certbot --nginx -d host.guangfu.ink
```

### 3. 手动配置 HTTPS（如果需要）

编辑配置文件，添加 443 端口监听：

```nginx
server {
    listen 443 ssl http2;
    server_name host.guangfu.ink;

    ssl_certificate /etc/letsencrypt/live/host.guangfu.ink/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/host.guangfu.ink/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... 其他配置与 HTTP 相同 ...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name host.guangfu.ink;
    return 301 https://$server_name$request_uri;
}
```

## 常见问题排查

### 1. 502 Bad Gateway

**原因**：后端服务未运行或无法连接

**解决**：
```bash
# 检查服务是否运行
pm2 status

# 检查端口是否监听
netstat -tlnp | grep 3000

# 查看 Nginx 错误日志
tail -f /var/log/nginx/mahjong-ledger-error.log

# 重启服务
pm2 restart mahjong-ledger
```

### 2. 404 Not Found

**原因**：路径重写配置错误

**解决**：
- 检查 `rewrite` 规则是否正确
- 确认 `proxy_pass` 地址是否正确
- 查看 Nginx 访问日志：`tail -f /var/log/nginx/mahjong-ledger-access.log`

### 3. CORS 跨域问题

**原因**：前端请求被浏览器阻止

**解决**：
- 确保后端已配置 CORS（代码中已有）
- 在 Nginx 配置中添加 CORS 头（配置文件中已包含）
- 检查前端请求的域名是否正确

### 4. 连接超时

**原因**：后端响应时间过长

**解决**：
- 增加超时时间配置
- 检查后端服务性能
- 查看后端日志

### 5. 查看日志

```bash
# Nginx 访问日志
tail -f /var/log/nginx/mahjong-ledger-access.log

# Nginx 错误日志
tail -f /var/log/nginx/mahjong-ledger-error.log

# PM2 应用日志
pm2 logs mahjong-ledger

# 或查看应用日志文件
tail -f /root/app/mahjong-ledger/logs/pm2-out.log
```

## 性能优化建议

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. 调整缓冲设置

```nginx
proxy_buffers 8 16k;
proxy_buffer_size 32k;
```

### 3. 启用 HTTP/2（需要 HTTPS）

```nginx
listen 443 ssl http2;
```

### 4. 设置缓存（静态资源）

```nginx
location /mahjong-ledger/static/ {
    proxy_pass http://127.0.0.1:3000/static/;
    proxy_cache_valid 200 1h;
    expires 1h;
}
```

## 安全建议

1. ✅ **限制访问 IP**（如果需要）：
   ```nginx
   location /mahjong-ledger/api/ {
       allow 192.168.1.0/24;
       deny all;
       # ... 其他配置 ...
   }
   ```

2. ✅ **设置请求大小限制**：
   ```nginx
   client_max_body_size 10M;
   ```

3. ✅ **隐藏 Nginx 版本**：
   ```nginx
   server_tokens off;
   ```

4. ✅ **配置防火墙**：
   ```bash
   # 只开放必要端口
   firewall-cmd --permanent --add-service=http
   firewall-cmd --permanent --add-service=https
   firewall-cmd --reload
   ```

5. ✅ **定期更新 Nginx**：
   ```bash
   yum update nginx
   # 或
   apt-get update && apt-get upgrade nginx
   ```

## 完整配置示例

以下是一个完整的 Nginx 配置文件示例（`/etc/nginx/conf.d/mahjong-ledger.conf`）：

```nginx
# 打牌记账应用 API 反向代理配置
server {
    listen 80;
    server_name host.guangfu.ink;

    # 日志配置
    access_log /var/log/nginx/mahjong-ledger-access.log;
    error_log /var/log/nginx/mahjong-ledger-error.log;

    # 请求体大小限制
    client_max_body_size 10M;

    # API 路径转发
    location /mahjong-ledger/api/ {
        # 移除路径前缀 /mahjong-ledger，只保留 /api/
        rewrite ^/mahjong-ledger/api/(.*)$ /api/$1 break;
        
        # 转发到本地 Node.js 服务
        proxy_pass http://127.0.0.1:3000;
        
        # 设置代理头信息
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering off;
        proxy_request_buffering off;
        
        # CORS 支持
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        
        # 处理 OPTIONS 预检请求
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # 健康检查端点
    location /mahjong-ledger/health {
        proxy_pass http://127.0.0.1:3000/;
        access_log off;
    }

    # 根路径
    location = /mahjong-ledger {
        return 301 /mahjong-ledger/;
    }

    location = /mahjong-ledger/ {
        return 200 'Mahjong Ledger API Service\nVersion: 1.0.0';
        add_header Content-Type text/plain;
    }
}
```

## 验证清单

完成配置后，请验证以下项目：

- [ ] Nginx 配置语法测试通过：`nginx -t`
- [ ] Nginx 服务正常运行：`systemctl status nginx`
- [ ] Node.js 服务正常运行：`pm2 status`
- [ ] 本地测试通过：`curl http://localhost/mahjong-ledger/api/users`
- [ ] 域名测试通过：`curl http://host.guangfu.ink/mahjong-ledger/api/users`
- [ ] 日志正常：检查访问日志和错误日志
- [ ] 前端可以正常调用 API

---

**完成！** 现在你的 API 可以通过 `http://host.guangfu.ink/mahjong-ledger/api/xxxx` 访问了。

