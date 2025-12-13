/**
 * 二维码生成工具
 * 使用 weapp-qrcode 库生成二维码
 */

// 使用 require 方式引入，微信小程序需要先构建 npm
// 构建方法：在微信开发者工具中点击 工具 -> 构建 npm
// @ts-ignore
const drawQrcode = require('weapp-qrcode')

/**
 * 二维码样式配置选项
 */
export interface QRCodeStyleOptions {
  /** 二维码背景颜色，默认值白色 */
  background?: string
  /** 二维码前景色，默认值黑色 */
  foreground?: string
  /** 二维码纠错级别，取值：L(1), M(0), Q(3), H(2)，默认值 H(2) */
  correctLevel?: number
  /** 在二维码上绘制图片（Logo） */
  image?: {
    imageResource: string
    dx: number
    dy: number
    dWidth: number
    dHeight: number
  }
}

/**
 * 生成二维码图片
 * 使用 weapp-qrcode 库在 canvas 上绘制，然后转换为图片
 */
export function generateQRCodeImage(
  text: string,
  size: number = 160,
  canvasId: string = 'qrcode-canvas',
  component?: any,
  styleOptions?: QRCodeStyleOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 使用 weapp-qrcode 在 canvas 上绘制二维码
      const options: any = {
        width: size,
        height: size,
        canvasId: canvasId,
        text: text,
        correctLevel: styleOptions?.correctLevel ?? 2, // 默认高级纠错 H(2)
        background: styleOptions?.background ?? '#ffffff', // 默认白色背景
        foreground: styleOptions?.foreground ?? '#000000', // 默认黑色前景
        _this: component, // 如果在组件中使用，需要传入 this
        callback: () => {
          // 绘制完成后，将 canvas 转换为图片
          setTimeout(() => {
            exportCanvasToImage(canvasId, component)
              .then(resolve)
              .catch(reject)
          }, 200) // 延迟一下确保绘制完成
        }
      }

      // 如果配置了图片（Logo），添加到选项中
      if (styleOptions?.image) {
        options.image = styleOptions.image
      }

      drawQrcode(options)
    } catch (error) {
      reject(new Error('生成二维码失败: ' + (error as Error).message))
    }
  })
}

/**
 * 将 canvas 导出为图片
 */
function exportCanvasToImage(canvasId: string, component?: any): Promise<string> {
  return new Promise((resolve, reject) => {
    // 使用新的 Canvas API (基础库 2.9.0+)
    const query = component
      ? wx.createSelectorQuery().in(component)
      : wx.createSelectorQuery()
    
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res && res[0] && res[0].node) {
          // 新 API
          wx.canvasToTempFilePath({
            canvas: res[0].node,
            success: (canvasRes) => {
              resolve(canvasRes.tempFilePath)
            },
            fail: (err) => {
              reject(new Error(err.errMsg || '导出图片失败'))
            }
          }, component)
        } else {
          // 旧 API
          wx.canvasToTempFilePath({
            canvasId: canvasId,
            success: (canvasRes) => {
              resolve(canvasRes.tempFilePath)
            },
            fail: (err) => {
              reject(new Error(err.errMsg || '导出图片失败'))
            }
          }, component)
        }
      })
  })
}

/**
 * 保存二维码图片到相册
 */
export function saveQRCodeToAlbum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 先获取权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // 请求权限
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              saveImageToAlbum(filePath).then(resolve).catch(reject)
            },
            fail: () => {
              wx.showModal({
                title: '提示',
                content: '需要您授权保存相册权限',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (settingRes) => {
                        if (settingRes.authSetting['scope.writePhotosAlbum']) {
                          saveImageToAlbum(filePath).then(resolve).catch(reject)
                        } else {
                          reject(new Error('用户拒绝授权'))
                        }
                      }
                    })
                  } else {
                    reject(new Error('用户取消授权'))
                  }
                }
              })
            }
          })
        } else {
          saveImageToAlbum(filePath).then(resolve).catch(reject)
        }
      }
    })
  })
}

/**
 * 保存图片到相册
 */
function saveImageToAlbum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.showToast({
          title: '已保存到相册',
          icon: 'success'
        })
        resolve(filePath)
      },
      fail: (err) => {
        console.error('保存图片失败:', err)
        reject(new Error(err.errMsg || '保存图片失败'))
      }
    })
  })
}
