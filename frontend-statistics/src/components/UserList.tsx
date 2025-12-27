import { useState, useEffect } from 'react';
import { User } from '../types';
import Pagination from './Pagination';
import './UserList.css';

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

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `http://localhost:3000/api/statistics/users/list?page=${page}&pageSize=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error('请求失败');
      }

      const result = await response.json();
      
      if (result.code === 0) {
        setUsers(result.data.list);
        setTotal(result.data.pagination.total);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        throw new Error(result.message || '获取数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && users.length === 0) {
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
        <button onClick={() => fetchUsers(currentPage)} className="retry-btn">
          重试
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return <div className="empty">暂无用户数据</div>;
  }

  return (
    <>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            {/* <div className="user-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div> */}
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-meta">
                创建时间: {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && (
        <div className="loading-more">
          <div className="spinner-small"></div>
          <span>加载中...</span>
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </>
  );
}
