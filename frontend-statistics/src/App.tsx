import { useState, useEffect } from 'react';
import PasswordAuth from './components/PasswordAuth';
import Overview from './components/Overview';
import UserList from './components/UserList';
import RoomList from './components/RoomList';
import './App.css';

// Cookie 操作
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rooms'>('overview');

  useEffect(() => {
    // 检查 cookie 中是否已有验证信息
    const authToken = getCookie('statistics_auth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <PasswordAuth onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app">
      <main className="main">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-text">概览</span>
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="tab-icon">👥</span>
            <span className="tab-text">用户列表</span>
          </button>
          <button
            className={`tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            <span className="tab-icon">🏠</span>
            <span className="tab-text">房间列表</span>
          </button>
        </div>

        <div className="list-section">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'users' && <UserList />}
          {activeTab === 'rooms' && <RoomList />}
        </div>
      </main>
    </div>
  );
}

export default App;
