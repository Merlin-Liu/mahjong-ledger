// recent-rooms.ts
interface RoomItem {
  id: number  // 房间 ID，用于 wx:key
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
  isOwner: boolean
  formattedCreatedAt: string
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    rooms: {
      type: Array,
      value: [] as RoomItem[]
    },
    userId: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击房间卡片
    onRoomTap(e: any) {
      const roomCode = e.currentTarget.dataset.code
      if (roomCode) {
        this.triggerEvent('roomtap', { roomCode })
      }
    },

    // 点击查看更多
    onViewMore() {
      this.triggerEvent('viewmore')
    }
  }
})

