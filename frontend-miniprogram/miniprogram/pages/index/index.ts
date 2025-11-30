// index.ts
import { userApi, roomApi } from '../../utils/api'
import { getUserUniqueId } from '../../utils/util'

interface IAppOption {
  globalData: {
    userInfo: {
      id: number
      username: string
      avatarUrl: string
      nickName: string
    } | null
    uniqueUserId: string | null  // 用户唯一ID（本地生成）
  }
}

const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    userId: 0,
    loading: false,
    roomCodeInput: '',  // 房间ID输入框
    showUserDialog: false,  // 显示用户信息输入对话框
    dialogNickName: '',  // 对话框中的昵称
    dialogAvatarUrl: defaultAvatarUrl,  // 对话框中的头像
    pendingAction: null as (() => Promise<void>) | null,  // 待执行的操作
    dialogConfirmBtn: { content: '创建', disabled: true },  // 确认按钮配置
  },

  onLoad() {
    // 只加载用户信息用于显示，不阻止功能使用
    this.loadUserInfo()
  },

  onShow() {
    // 每次显示页面时刷新用户信息
    this.loadUserInfo()
  },

  // 加载用户信息（仅用于显示）
  loadUserInfo() {
    const appUserInfo = (app.globalData as IAppOption['globalData']).userInfo
    if (appUserInfo && appUserInfo.id) {
      this.setData({
        userInfo: {
          avatarUrl: appUserInfo.avatarUrl || defaultAvatarUrl,
          nickName: appUserInfo.nickName || appUserInfo.username || '',
        },
        userId: appUserInfo.id,
      })
    } else {
      // 尝试从本地存储获取
      const storedUserInfo = wx.getStorageSync('userInfo') as any
      if (storedUserInfo && storedUserInfo.id) {
        this.setData({
          userInfo: {
            avatarUrl: storedUserInfo.avatarUrl || defaultAvatarUrl,
            nickName: storedUserInfo.nickName || storedUserInfo.username || '',
          },
          userId: storedUserInfo.id,
        })
        app.globalData.userInfo = storedUserInfo
      } else {
        // 没有用户信息，显示默认值
        this.setData({
          userInfo: {
            avatarUrl: defaultAvatarUrl,
            nickName: '',
          },
          userId: 0,
        })
      }
    }
  },

  // 检查用户信息，如果没有则弹出对话框
  async checkAndCreateUser(action: () => Promise<void>) {
    if (this.data.userId) {
      // 已有用户信息，直接执行操作
      await action()
      return
    }

    // 没有用户信息，保存待执行的操作并弹出对话框
    this.setData({
      pendingAction: action,
      showUserDialog: true,
      dialogNickName: '',
      dialogAvatarUrl: defaultAvatarUrl,
      dialogConfirmBtn: {
        content: '创建',
        disabled: true,
      },
    })
  },

  // 对话框中选择头像
  onDialogChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    this.setData({
      dialogAvatarUrl: avatarUrl,
    })
  },

  // 对话框输入昵称
  onDialogNickNameInput(e: any) {
    const value = e.detail?.value ?? e.detail ?? ''
    const nickName = typeof value === 'string' ? value : ''
    const trimmedNickName = nickName.trim()
    
    this.setData({
      dialogNickName: nickName,
      dialogConfirmBtn: {
        content: '创建',
        disabled: !trimmedNickName || trimmedNickName.length === 0,
      },
    })
  },

  // 关闭对话框
  onDialogClose() {
    this.setData({
      showUserDialog: false,
      pendingAction: null,
    })
  },

  // 确认创建用户
  async onDialogConfirm() {
    const { dialogNickName, dialogAvatarUrl, dialogConfirmBtn } = this.data
    
    // 如果按钮被禁用，直接返回
    if (dialogConfirmBtn.disabled) {
      return
    }
    
    if (!dialogNickName || !dialogNickName.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none',
      })
      return
    }

    if (dialogAvatarUrl === defaultAvatarUrl) {
      wx.showToast({
        title: '请选择头像',
        icon: 'none',
      })
      return
    }

    try {
      // 创建用户
      await this.createOrUpdateUser(dialogNickName.trim(), dialogAvatarUrl)
      
      // 关闭对话框
      this.setData({
        showUserDialog: false,
      })

      // 执行待执行的操作
      const action = this.data.pendingAction
      if (action) {
        this.setData({ pendingAction: null })
        await action()
      }
    } catch (err: any) {
      console.error('创建用户失败:', err)
      wx.showToast({
        title: err.message || '创建用户失败',
        icon: 'none',
      })
    }
  },


  // 创建或更新用户
  async createOrUpdateUser(username: string, avatarUrl: string) {
    // 获取用户唯一ID（本地生成，无需后端）
    const globalData = app.globalData as IAppOption['globalData']
    const uniqueUserId = globalData.uniqueUserId || getUserUniqueId()
    
    // 使用本地生成的唯一ID作为wxOpenId传给后端
    const userData = await userApi.createOrGetUser(uniqueUserId, username)
    
    const userInfo: IAppOption['globalData']['userInfo'] = {
      id: userData.id,
      username: userData.username,
      avatarUrl,
      nickName: username,
    }
    
    this.setData({
      userId: userData.id,
      userInfo: {
        avatarUrl,
        nickName: username,
      },
    })
    
    // 保存到全局和本地存储
    globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  // 开房间
  async createRoom() {
    if (this.data.loading) return

    await this.checkAndCreateUser(async () => {
      this.setData({ loading: true })

      try {
        const room = await roomApi.createRoom(this.data.userId, '我的房间')
        wx.showToast({
          title: '房间创建成功',
          icon: 'success',
        })
        
        // 跳转到房间页面
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/room/room?code=${room.code}`,
          })
        }, 1000)
      } catch (err: any) {
        console.error('创建房间失败:', err)
        const errorMessage = err.message || '创建房间失败'
        
        // 如果是数据库相关错误，提供重试选项
        if (errorMessage.includes('数据库正在恢复中') || 
            errorMessage.includes('数据库连接异常') ||
            errorMessage.includes('resuming')) {
          const isConnecting = errorMessage.includes('连接异常')
          wx.showModal({
            title: '提示',
            content: isConnecting 
              ? '数据库连接异常，请稍后重试。是否立即重试？'
              : '数据库正在恢复中，请稍后重试。是否立即重试？',
            confirmText: '重试',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                // 延迟2秒后重试
                setTimeout(() => {
                  this.createRoom()
                }, 2000)
              } else {
                this.setData({ loading: false })
              }
            },
          })
        } else {
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 3000,
          })
          this.setData({ loading: false })
        }
      }
    })
  },

  // 输入房间ID
  onRoomCodeInput(e: any) {
    const value = e.detail.value
    this.setData({
      roomCodeInput: value  // 不立即trim，保留用户输入，在提交时再trim
    })
  },

  // 通过房间ID加入房间
  async joinRoomByCode() {
    const roomCode = this.data.roomCodeInput.trim()
    
    if (!roomCode) {
      wx.showToast({
        title: '请输入房间ID',
        icon: 'none',
      })
      return
    }

    if (this.data.loading) return

    await this.checkAndCreateUser(async () => {
      this.setData({ loading: true })

      try {
        // 先获取房间信息
        await roomApi.getRoomInfo(roomCode)
        
        // 加入房间
        await roomApi.joinRoom(roomCode, this.data.userId)
        
        wx.showToast({
          title: '加入房间成功',
          icon: 'success',
        })
        
        // 清空输入框
        this.setData({ roomCodeInput: '' })
        
        // 跳转到房间页面
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/room/room?code=${roomCode}`,
          })
        }, 1000)
      } catch (err: any) {
        console.error('加入房间失败:', err)
        const errorMessage = err.message || '加入房间失败'
        
        // 如果已经在房间中，直接跳转到房间页面
        if (errorMessage.includes('已经在房间中') || errorMessage.includes('已在房间中')) {
          // 清空输入框
          this.setData({ roomCodeInput: '', loading: false })
          // 直接跳转到房间页面
          wx.redirectTo({
            url: `/pages/room/room?code=${roomCode}`,
          })
          return
        }
        
        // 如果是数据库相关错误，提供重试选项
        if (errorMessage.includes('数据库正在恢复中') || 
            errorMessage.includes('数据库连接异常') ||
            errorMessage.includes('resuming')) {
          const isConnecting = errorMessage.includes('连接异常')
          wx.showModal({
            title: '提示',
            content: isConnecting 
              ? '数据库连接异常，请稍后重试。是否立即重试？'
              : '数据库正在恢复中，请稍后重试。是否立即重试？',
            confirmText: '重试',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                setTimeout(() => {
                  this.joinRoomByCode()
                }, 2000)
              } else {
                this.setData({ loading: false })
              }
            },
          })
        } else {
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 3000,
          })
          this.setData({ loading: false })
        }
      }
    })
  },

  // 扫码进入房间
  scanCode() {
    this.checkAndCreateUser(async () => {
      wx.scanCode({
        success: async (res) => {
        const roomCode = res.result
        if (!roomCode) {
          wx.showToast({
            title: '无效的房间码',
            icon: 'none',
          })
          return
        }

          try {
            // 先获取房间信息
            await roomApi.getRoomInfo(roomCode)
            
            // 加入房间
            await roomApi.joinRoom(roomCode, this.data.userId)
            
            wx.showToast({
              title: '加入房间成功',
              icon: 'success',
            })
            
            // 跳转到房间页面
            setTimeout(() => {
              wx.redirectTo({
                url: `/pages/room/room?code=${roomCode}`,
              })
            }, 1000)
          } catch (err: any) {
          console.error('加入房间失败:', err)
          const errorMessage = err.message || '加入房间失败'
          
          // 如果已经在房间中，直接跳转到房间页面
          if (errorMessage.includes('已经在房间中') || errorMessage.includes('已在房间中')) {
            wx.redirectTo({
              url: `/pages/room/room?code=${roomCode}`,
            })
          } else if (errorMessage.includes('数据库正在恢复中') || 
                     errorMessage.includes('数据库连接异常') ||
                     errorMessage.includes('resuming')) {
            // 数据库相关错误，提供重试选项
            const isConnecting = errorMessage.includes('连接异常')
            wx.showModal({
              title: '提示',
              content: isConnecting 
                ? '数据库连接异常，请稍后重试。是否立即重试？'
                : '数据库正在恢复中，请稍后重试。是否立即重试？',
              confirmText: '重试',
              cancelText: '取消',
              success: (res) => {
                if (res.confirm) {
                  setTimeout(() => {
                    this.scanCode()
                  }, 2000)
                }
              },
            })
          } else {
            wx.showToast({
              title: errorMessage,
              icon: 'none',
            })
          }
        }
      },
      fail: (err) => {
        console.error('扫码失败:', err)
        if (err.errMsg !== 'scanCode:fail cancel') {
          wx.showToast({
            title: '扫码失败',
            icon: 'none',
          })
        }
      },
    })
    })
  },
})

