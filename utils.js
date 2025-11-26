// 工具函数

/**
 * 生成房间邀请码（6位数字）
 */
function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 统一响应格式
 */
function successResponse(data, message = "success") {
  return {
    code: 0,
    message,
    data,
  };
}

function errorResponse(message, code = -1) {
  return {
    code,
    message,
    data: null,
  };
}

/**
 * 异步错误处理包装器
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  generateRoomCode,
  successResponse,
  errorResponse,
  asyncHandler,
};

