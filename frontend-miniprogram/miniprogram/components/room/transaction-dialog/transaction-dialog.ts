// transaction-dialog.ts
interface Member {
  id: number
  userId: number
  username: string
  avatarUrl?: string | null
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    targetMember: {
      type: Object,
      value: null as Member | null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    transactionAmount: '',
    inputFocus: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onAmountInput(e: any) {
      let value = e.detail.value
      
      // 移除非数字和小数点的字符
      value = value.replace(/[^\d.]/g, '')
      
      // 限制只能有一个小数点
      const parts = value.split('.')
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('')
      }
      
      // 重新分割以获取最新的 parts
      const updatedParts = value.split('.')
      
      // 限制小数点后最多2位
      if (updatedParts.length === 2 && updatedParts[1].length > 2) {
        value = updatedParts[0] + '.' + updatedParts[1].substring(0, 2)
      }
      
      // 如果整数部分超过4位，截断为9999
      if (updatedParts[0] && updatedParts[0].length > 4) {
        value = '9999'
      }
      
      // 限制最大值为9999（双重校验）
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue > 9999) {
        value = '9999'
      }
      
      this.setData({
        transactionAmount: value
      })
      this.triggerEvent('amountinput', { value })
    },

    onConfirm() {
      this.triggerEvent('confirm', {
        amount: this.data.transactionAmount
      })
    },

    onCancel() {
      this.setData({
        transactionAmount: '',
        inputFocus: false
      })
      this.triggerEvent('cancel')
    }
  },

  observers: {
    'visible': function(visible: boolean) {
      if (visible) {
        // 对话框打开时重置表单
        this.setData({
          transactionAmount: ''
        })
        // 延迟聚焦输入框，确保dialog已完全显示
        setTimeout(() => {
          this.setData({
            inputFocus: true
          })
        }, 300)
      } else {
        // 对话框关闭时取消聚焦
        this.setData({
          inputFocus: false
        })
      }
    },
    'targetMember': function(targetMember: Member | null) {
      if (targetMember && this.data.visible) {
        // 切换目标成员时重置表单
        this.setData({
          transactionAmount: ''
        })
        // 重新聚焦输入框
        setTimeout(() => {
          this.setData({
            inputFocus: true
          })
        }, 100)
      }
    }
  }
})

