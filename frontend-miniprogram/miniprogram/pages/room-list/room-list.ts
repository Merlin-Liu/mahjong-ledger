// room-list.ts
import { userApi } from '../../utils/api'

interface IAppOption {
  globalData: {
    userInfo: {
      id: number
      username: string
      avatarUrl: string
      nickName: string
    } | null
    uniqueUserId: string | null
  }
}

const app = getApp<IAppOption>()

interface RoomItem {
  room: {
    id: number
    code: string
    name: string
    owner: {
      id: number
      username: string
      avatarUrl: string | null
    }
    status: string
    createdAt: string
  }
  membership: {
    username: string
    joinedAt: string
    leftAt: string | null
  }
  isOwner: boolean
  formattedCreatedAt: string
}

Page({
  data: {
    rooms: [] as RoomItem[],
    loading: false,
    userId: 0,
  },

  onLoad() {
    this.loadRooms()
  },

  onShow() {
    // 每次显示页面时刷新列表
    this.loadRooms()
  },

  // 加载房间列表
  async loadRooms() {
    const userInfo = (app.globalData as IAppOption['globalData']).userInfo
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      })
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500)
      return
    }

    const userId = userInfo.id
    this.setData({ userId, loading: true })

    try {
      const roomsData = await userApi.getUserRooms(userId, 3)
      
      // 处理房间数据，添加格式化时间和是否房主标志
      const rooms = roomsData.map((item) => {
        const isOwner = item.room.owner.id === userId
        const createdAt = new Date(item.room.createdAt)
        const formattedCreatedAt = this.formatDate(createdAt)
        
        return {
          ...item,
          isOwner,
          formattedCreatedAt,
        }
      })

      this.setData({ rooms, loading: false })
    } catch (err: any) {
      console.error('加载房间列表失败:', err)
      wx.showToast({
        title: err.message || '加载房间列表失败',
        icon: 'none',
      })
      this.setData({ loading: false })
    }
  },

  // 格式化日期
  formatDate(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else if (days < 30) {
      const weeks = Math.floor(days / 7)
      return `${weeks}周前`
    } else {
      const months = Math.floor(days / 30)
      return `${months}个月前`
    }
  },

  // 点击房间卡片
  onRoomTap(e: any) {
    const roomCode = e.currentTarget.dataset.code
    if (roomCode) {
      wx.navigateTo({
        url: `/pages/room/room?code=${roomCode}`,
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRooms().finally(() => {
      wx.stopPullDownRefresh()
    })
  },
})

