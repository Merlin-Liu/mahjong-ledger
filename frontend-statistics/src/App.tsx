import { useState, useEffect } from 'react';
import './App.css';

interface StatisticsData {
  totalUsers: number;
}

function App() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3000/api/statistics/users');
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.code === 0) {
        setStatistics(result.data);
      } else {
        throw new Error(result.message || '获取统计数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>用户统计</h1>
          <p className="subtitle">麻将记账应用数据统计</p>
        </header>

        <main className="main">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>加载中...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>❌ {error}</p>
              <button onClick={fetchStatistics} className="retry-btn">
                重试
              </button>
            </div>
          )}

          {!loading && !error && statistics && (
            <div className="statistics">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-label">总用户数</div>
                  <div className="stat-value">{statistics.totalUsers.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="refresh-section">
              <button onClick={fetchStatistics} className="refresh-btn">
                🔄 刷新数据
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

