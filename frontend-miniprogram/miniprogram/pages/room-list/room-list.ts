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
  members?: Array<{
    userId: number
    username: string
    joinedAt: string
    leftAt: string | null
  }>
  isOwner: boolean
  formattedCreatedAt: string
  memberInfo: string
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
        
        // 计算当前在房间中的成员数量（leftAt 为 null 的成员）
        const activeMembers = item.members ? item.members.filter(m => !m.leftAt) : []
        const memberCount = activeMembers.length
        
        // 生成成员信息字符串：最多显示3个昵称，超过则显示"等X人"
        let memberInfo = ''
        if (memberCount === 0) {
          memberInfo = '0人'
        } else {
          const displayMembers = activeMembers.slice(0, 3)
          // 每个成员名字最大长度限制（中文字符，约4个汉字）
          const maxNameLength = 10
          const memberNames = displayMembers.map(m => {
            const name = m.username || ''
            if (name.length > maxNameLength) {
              return name.substring(0, maxNameLength) + '...'
            }
            return name
          }).join('、')
          if (memberCount <= 3) {
            // 3人以内：显示所有昵称 + 人数
            memberInfo = `${memberNames} ${memberCount} 人`
          } else {
            // 超过3人：显示前3个昵称 + "等X人"
            memberInfo = `${memberNames} 等${memberCount}人`
          }
        }
        
        return {
          ...item,
          isOwner,
          formattedCreatedAt,
          memberInfo,
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

  // 格式化日期（精确到分钟）
  formatDate(date: Date): string {
    const now = new Date()
    
    // 获取今天的日期（年月日，时间设为0点）
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    // 获取目标日期的日期（年月日，时间设为0点）
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    // 计算日期差（天数）
    const diffTime = today.getTime() - targetDate.getTime()
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // 处理负数情况（未来时间，可能是时区问题导致的）
    // 如果时间差小于0，说明是未来时间，统一显示为"今天"
    if (days < 0) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `今天 ${hours}:${minutes}`
    }
    
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    if (days === 0) {
      return `今天 ${hours}:${minutes}`
    } else if (days === 1) {
      return `昨天 ${hours}:${minutes}`
    } else {
      // 其他日期：显示月-日 或 年-月-日（跨年时）
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      
      // 如果是今年，只显示月-日；如果是跨年，显示年-月-日
      if (year === now.getFullYear()) {
        return `${month}-${day} ${hours}:${minutes}`
      } else {
        return `${year}-${month}-${day} ${hours}:${minutes}`
      }
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

