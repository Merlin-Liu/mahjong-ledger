import { useState, useEffect } from 'react';
import { Room } from '../types';
import Pagination from './Pagination';
import './RoomList.css';

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

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchRooms(currentPage);
  }, [currentPage]);

  const fetchRooms = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `http://localhost:3000/api/statistics/rooms/list?page=${page}&pageSize=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error('请求失败');
      }

      const result = await response.json();
      
      if (result.code === 0) {
        setRooms(result.data.list);
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

  if (loading && rooms.length === 0) {
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
        <button onClick={() => fetchRooms(currentPage)} className="retry-btn">
          重试
        </button>
      </div>
    );
  }

  if (rooms.length === 0) {
    return <div className="empty">暂无房间数据</div>;
  }

  return (
    <>
      <div className="room-list">
        {rooms.map((room) => (
          <div key={room.id} className="room-item">
            <div className="room-header">
              <div className="room-id">房间 ID: {room.id}</div>
              <div className="room-code">房间码: {room.code}</div>
              <div className={`room-status ${room.status}`}>
                {room.status === 'active' ? '活跃' : '已关闭'}
              </div>
            </div>
            <div className="room-info-row">
              <div className="room-owner">
                <span className="label">房主:</span>
                <div className="owner-info">
                  {/* {room.owner.avatarUrl && (
                    <img src={room.owner.avatarUrl} alt={room.owner.username} className="owner-avatar" />
                  )} */}
                  <span>{room.owner.username}</span>
                </div>
              </div>
              <div className="member-count">
                <span className="label">成员数量:</span> {room.memberCount} 人
              </div>
            </div>
            <div className="room-members">
              {room.members.length > 0 && (
                <div className="member-list">
                  <span className="label">成员列表:</span>
                  <div className="members">
                    {room.members.map((member) => (
                      <div key={member.id} className="member-item">
                        {/* {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.username} className="member-avatar" />
                        ) : (
                          <div className="member-avatar-placeholder">
                            {member.username.charAt(0).toUpperCase()}
                          </div>
                        )} */}
                        <span className="member-name">{member.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="room-meta">
              创建时间: {formatDate(room.createdAt)}
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
