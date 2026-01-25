/**
 * 小程序主题配置
 * 基于分享卡片和 Logo 的配色方案
 */

export interface ThemeConfig {
  // 主色系
  primary: {
    main: string;      // 主色
    light: string;     // 浅色
    lighter: string;   // 更浅色
    dark: string;      // 深色
  };
  
  // 辅助色系
  secondary: {
    white: string;
    black: string;
    gray: {
      light: string;
      main: string;
      dark: string;
    };
  };
  
  // 功能色
  functional: {
    success: string;   // 成功色
    warning: string;   // 警告色
    danger: string;    // 危险色
    info: string;      // 信息色
    accent: string;    // 强调色（麻将红）
  };
  
  // 背景色
  background: {
    page: string;           // 页面背景
    card: string;           // 卡片背景
    gradient: {             // 渐变背景
      start: string;
      end: string;
    };
    mask: string;           // 蒙层
  };
  
  // 文字颜色
  text: {
    primary: string;        // 主要文字
    secondary: string;      // 次要文字
    hint: string;          // 提示文字
    white: string;         // 白色文字
    disabled: string;      // 禁用文字
  };
  
  // 边框和分割线
  border: {
    light: string;         // 浅色边框
    main: string;          // 常规边框
    dark: string;          // 深色边框
  };
  
  // 阴影
  shadow: {
    light: string;         // 浅阴影
    main: string;          // 常规阴影
    heavy: string;         // 重阴影
  };
  
  // 圆角
  radius: {
    small: string;         // 小圆角
    medium: string;        // 中圆角
    large: string;         // 大圆角
    round: string;         // 圆形
  };
  
  // 间距
  spacing: {
    xs: string;            // 超小间距
    sm: string;            // 小间距
    md: string;            // 中间距
    lg: string;            // 大间距
    xl: string;            // 超大间距
  };
}

/**
 * 默认主题配置
 * 优化后的现代配色方案
 */
export const theme: ThemeConfig = {
  // 主色系 - 优化的绿色系，更柔和现代
  primary: {
    main: '#2D9F7A',       // 主绿色（更亮更现代）
    light: '#4EC9A8',      // 中绿色（更柔和）
    lighter: '#E8F8F4',    // 极浅绿色（背景用）
    dark: '#1A7A5E',       // 深绿色（保持品牌色）
  },
  
  // 辅助色系 - 优化的灰色系
  secondary: {
    white: '#FFFFFF',
    black: '#1A1A1A',      // 更柔和的黑色
    gray: {
      light: '#E5E5E5',    // 更柔和的浅灰
      main: '#8E8E93',     // iOS 风格的中灰
      dark: '#636366',     // 更柔和的深灰
    },
  },
  
  // 功能色 - 统一使用绿色系
  functional: {
    success: '#2D9F7A',    // 主绿色（成功）
    warning: '#4EC9A8',    // 浅绿色（警告/提示）
    danger: '#1A7A5E',     // 深绿色（危险/关闭）
    info: '#4EC9A8',       // 中绿色（信息）
    accent: '#2D9F7A',     // 主绿色（强调）
  },
  
  // 背景色 - 更温暖的背景
  background: {
    page: '#F7F7F7',       // 更温暖的页面背景
    card: '#FFFFFF',       // 卡片背景
    gradient: {            // 优化的渐变背景
      start: '#E8F8F4',
      end: '#D4F0E8',
    },
    mask: 'rgba(0, 0, 0, 0.4)', // 更柔和的蒙层
  },
  
  // 文字颜色 - 更好的对比度
  text: {
    primary: '#1A1A1A',    // 更柔和的黑色
    secondary: '#636366',   // iOS 风格的次要文字
    hint: '#8E8E93',       // iOS 风格的提示文字
    white: '#FFFFFF',      // 白色文字
    disabled: '#C7C7CC',    // iOS 风格的禁用文字
  },
  
  // 边框和分割线 - 更柔和的边框
  border: {
    light: '#F2F2F7',      // iOS 风格的浅色边框
    main: '#E5E5EA',       // iOS 风格的常规边框
    dark: '#C7C7CC',       // iOS 风格的深色边框
  },
  
  // 阴影 - 更自然的阴影
  shadow: {
    light: '0 1rpx 3rpx rgba(0, 0, 0, 0.06), 0 1rpx 2rpx rgba(0, 0, 0, 0.04)',
    main: '0 2rpx 8rpx rgba(0, 0, 0, 0.08), 0 1rpx 4rpx rgba(0, 0, 0, 0.06)',
    heavy: '0 4rpx 16rpx rgba(0, 0, 0, 0.12), 0 2rpx 8rpx rgba(0, 0, 0, 0.08)',
  },
  
  // 圆角
  radius: {
    small: '4rpx',
    medium: '8rpx',
    large: '16rpx',
    round: '50%',
  },
  
  // 间距（基于 8rpx 栅格系统）
  spacing: {
    xs: '8rpx',
    sm: '16rpx',
    md: '24rpx',
    lg: '32rpx',
    xl: '48rpx',
  },
};

/**
 * 导出默认主题
 */
export default theme;
