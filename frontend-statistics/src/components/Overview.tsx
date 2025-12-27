import { useState, useEffect } from 'react';
import { User } from '../types';
import './Overview.css';

interface OverviewData {
  totalUsers: number;
  totalRooms: number;
  today: {
    newUsers: number;
    newRooms: number;
  };
  yesterday: {
    newUsers: number;
    newRooms: number;
  };
}

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTodayUsers, setShowTodayUsers] = useState(false);
  const [showYesterdayUsers, setShowYesterdayUsers] = useState(false);
  const [todayUsers, setTodayUsers] = useState<User[]>([]);
  const [yesterdayUsers, setYesterdayUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/statistics/overview');

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const result = await response.json();

      if (result.code === 0) {
        setData(result.data);
      } else {
        throw new Error(result.message || '获取数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayUsers = async () => {
    if (todayUsers.length > 0) {
      setShowTodayUsers(!showTodayUsers);
      return;
    }

    try {
      setLoadingUsers(true);
      const response = await fetch('http://localhost:3000/api/statistics/users/today');
      
      if (!response.ok) {
        throw new Error('请求失败');
      }

      const result = await response.json();
      
      if (result.code === 0) {
        setTodayUsers(result.data);
        setShowTodayUsers(true);
      } else {
        throw new Error(result.message || '获取数据失败');
      }
    } catch (err) {
      console.error('获取今日用户列表失败:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchYesterdayUsers = async () => {
    if (yesterdayUsers.length > 0) {
      setShowYesterdayUsers(!showYesterdayUsers);
      return;
    }

    try {
      setLoadingUsers(true);
      const response = await fetch('http://localhost:3000/api/statistics/users/yesterday');
      
      if (!response.ok) {
        throw new Error('请求失败');
      }

      const result = await response.json();
      
      if (result.code === 0) {
        setYesterdayUsers(result.data);
        setShowYesterdayUsers(true);
      } else {
        throw new Error(result.message || '获取数据失败');
      }
    } catch (err) {
      console.error('获取昨日用户列表失败:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>❌ {error}</p>
        <button onClick={fetchOverview} className="retry-btn">
          重试
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="empty">暂无数据</div>;
  }

  return (
    <div className="overview">
      <div className="overview-cards">
        <div className="overview-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <div className="card-label">用户总数</div>
            <div className="card-value">{data.totalUsers.toLocaleString()}</div>
          </div>
        </div>
        <div className="overview-card">
          <div className="card-icon">🏠</div>
          <div className="card-content">
            <div className="card-label">房间总数</div>
            <div className="card-value">{data.totalRooms.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="daily-stats">
        <div className="daily-stat-card">
          <div className="daily-stat-header">
            <h3 className="daily-stat-title">今日统计</h3>
          </div>
          <div className="daily-stat-content">
            <div className="daily-stat-item">
              <span className="daily-stat-label">新增用户:</span>
              <span className="daily-stat-value">{data.today.newUsers}</span>
              {data.today.newUsers > 0 && (
                <button 
                  className="view-users-btn"
                  onClick={fetchTodayUsers}
                  disabled={loadingUsers}
                >
                  {showTodayUsers ? '隐藏' : '查看'}
                </button>
              )}
            </div>
            <div className="daily-stat-item">
              <span className="daily-stat-label">新增房间:</span>
              <span className="daily-stat-value">{data.today.newRooms}</span>
            </div>
          </div>
          {showTodayUsers && todayUsers.length > 0 && (
            <div className="user-list-section">
              <div className="user-list-header">今日新增用户列表</div>
              <div className="user-list-items">
                {todayUsers.map((user) => (
                  <div key={user.id} className="user-list-item">
                    <span className="user-name">{user.username}</span>
                    <span className="user-time">{formatDate(user.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="daily-stat-card">
          <div className="daily-stat-header">
            <h3 className="daily-stat-title">昨日统计</h3>
          </div>
          <div className="daily-stat-content">
            <div className="daily-stat-item">
              <span className="daily-stat-label">新增用户:</span>
              <span className="daily-stat-value">{data.yesterday.newUsers}</span>
              {data.yesterday.newUsers > 0 && (
                <button 
                  className="view-users-btn"
                  onClick={fetchYesterdayUsers}
                  disabled={loadingUsers}
                >
                  {showYesterdayUsers ? '隐藏' : '查看'}
                </button>
              )}
            </div>
            <div className="daily-stat-item">
              <span className="daily-stat-label">新增房间:</span>
              <span className="daily-stat-value">{data.yesterday.newRooms}</span>
            </div>
          </div>
          {showYesterdayUsers && yesterdayUsers.length > 0 && (
            <div className="user-list-section">
              <div className="user-list-header">昨日新增用户列表</div>
              <div className="user-list-items">
                {yesterdayUsers.map((user) => (
                  <div key={user.id} className="user-list-item">
                    <span className="user-name">{user.username}</span>
                    <span className="user-time">{formatDate(user.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="refresh-section">
        <button onClick={fetchOverview} className="refresh-btn">
          🔄 刷新数据
        </button>
      </div>
    </div>
  );
}
