/**
 * weapp-qrcode 类型声明
 */
declare module 'weapp-qrcode' {
  interface DrawQrcodeOptions {
    width: number
    height: number
    canvasId: string
    text: string
    typeNumber?: number
    correctLevel?: number
    background?: string
    foreground?: string
    _this?: any
    callback?: () => void
    x?: number
    y?: number
    image?: {
      imageResource: string
      dx: number
      dy: number
      dWidth: number
      dHeight: number
    }
  }

  function drawQrcode(options: DrawQrcodeOptions): void

  export = drawQrcode
}
