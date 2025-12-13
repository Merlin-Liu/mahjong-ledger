// member-list.ts
import { generateQRCodeImage, saveQRCodeToAlbum, QRCodeStyleOptions } from '../../../utils/qrcode'

interface Member {
  id: number
  userId: number
  username: string
  avatarUrl?: string | null
  balance?: number
  formattedBalance?: string
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    members: {
      type: Array,
      value: [] as Member[]
    },
    roomCode: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showQRCodeDialog: false,
    qrCodeImageUrl: '',
    generatingQRCode: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onMemberTap(e: any) {
      const member = e.currentTarget.dataset.member as Member
      this.triggerEvent('membertap', { member })
    },

    onCopyRoomCode() {
      // 复制房间号
      wx.setClipboardData({
        data: this.data.roomCode,
        success: () => {
          wx.showToast({
            title: '房间号已复制',
            icon: 'success',
          })
        },
        fail: () => {
          wx.showToast({
            title: '复制失败',
            icon: 'none',
          })
        },
      })
    },

    // 生成二维码
    async onGenerateQRCode() {
      const roomCode = this.data.roomCode
      if (!roomCode) {
        wx.showToast({
          title: '房间号无效',
          icon: 'none',
        })
        return
      }

      this.setData({ generatingQRCode: true, showQRCodeDialog: true })

      try {
        // 二维码尺寸（更小）
        const qrCodeSize = 160
        
        // 生成分享链接URL（与房间底部分享按钮一致）
        // 格式：/pages/room/room?code=房间号
        const shareUrl = `/pages/room/room?code=${roomCode}`
        
        // 配置二维码样式，参考"开房间"按钮的紫色渐变
        // 按钮颜色：linear-gradient(135deg, #667eea 0%, #764ba2 100%)
        // 使用渐变中的主色调作为二维码前景色
        const logoSize = 48 // Logo 尺寸增大到 48px（占二维码的30%）
        const styleOptions: QRCodeStyleOptions = {
          background: '#ffffff', // 白色背景
          foreground: '#667eea', // 使用"开房间"按钮的蓝紫色作为前景色
          correctLevel: 2, // 高级纠错级别，支持添加 Logo
          // 添加 Logo 到二维码中心
          image: {
            imageResource: '/images/logo.png', // Logo 图片路径
            dx: (qrCodeSize - logoSize) / 2, // Logo 在 canvas 上的 x 坐标（居中）
            dy: (qrCodeSize - logoSize) / 2, // Logo 在 canvas 上的 y 坐标（居中）
            dWidth: logoSize, // Logo 宽度（占二维码的30%）
            dHeight: logoSize  // Logo 高度（占二维码的30%）
          }
        }

        // 生成二维码图片，使用分享URL而不是房间号，传入组件实例 this 和样式配置
        const qrCodeImageUrl = await generateQRCodeImage(shareUrl, qrCodeSize, 'qrcode-canvas', this, styleOptions)
        this.setData({ 
          qrCodeImageUrl,
          generatingQRCode: false
        })
      } catch (err: any) {
        console.error('生成二维码失败:', err)
        this.setData({ generatingQRCode: false })
        wx.showToast({
          title: err.message || '生成二维码失败',
          icon: 'none',
        })
        // 如果生成失败，关闭弹窗
        setTimeout(() => {
          this.setData({ showQRCodeDialog: false })
        }, 2000)
      }
    },

    // 保存二维码到相册
    async onSaveQRCode() {
      const qrCodeImageUrl = this.data.qrCodeImageUrl
      if (!qrCodeImageUrl) {
        wx.showToast({
          title: '二维码未生成',
          icon: 'none',
        })
        return
      }

      try {
        await saveQRCodeToAlbum(qrCodeImageUrl)
      } catch (err: any) {
        console.error('保存二维码失败:', err)
        wx.showToast({
          title: err.message || '保存失败',
          icon: 'none',
        })
      }
    },

    // 关闭二维码弹窗
    onCloseQRCodeDialog() {
      this.setData({ 
        showQRCodeDialog: false,
        qrCodeImageUrl: ''
      })
    }
  }
})

