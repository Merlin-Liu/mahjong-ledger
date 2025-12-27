import { useState, useEffect } from 'react';
import './PasswordAuth.css';

interface PasswordAuthProps {
  onSuccess: () => void;
}

// 简单的哈希函数（用于密码验证）
const hashPassword = (password: string): string => {
  // 使用简单的哈希算法（仅用于前端校验）
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // 添加盐值增加安全性
  const salt = 'majiang_ledger_2024';
  const salted = password + salt;
  let saltedHash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    saltedHash = ((saltedHash << 5) - saltedHash) + char;
    saltedHash = saltedHash & saltedHash;
  }
  return (hash + saltedHash).toString(36);
};

// 预先计算好的正确密码哈希值
// 这样即使代码被查看，也无法直接知道原始密码
// 注意：这只是前端校验，真正的安全应该在后端实现
const CORRECT_PASSWORD_HASH = '-uu6gma';

// 验证密码
const verifyPassword = (input: string): boolean => {
  const inputHash = hashPassword(input);
  return CORRECT_PASSWORD_HASH === inputHash;
};

// Cookie 操作
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export default function PasswordAuth({ onSuccess }: PasswordAuthProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 检查 cookie 中是否已有验证信息
    const authToken = getCookie('statistics_auth');
    if (authToken === 'authenticated') {
      onSuccess();
    }
  }, [onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 模拟验证延迟
    setTimeout(() => {
      if (verifyPassword(password)) {
        // 验证成功，设置 cookie
        setCookie('statistics_auth', 'authenticated', 7);
        onSuccess();
      } else {
        setError('密码错误，请重试');
        setPassword('');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="password-auth">
      <div className="auth-container">
        <div className="auth-header">
          <h2>🔒 访问验证</h2>
          <p>请输入访问密码</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="请输入密码"
              className="password-input"
              autoFocus
              disabled={loading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !password.trim()}
          >
            {loading ? '验证中...' : '确认'}
          </button>
        </form>
      </div>
    </div>
  );
}

