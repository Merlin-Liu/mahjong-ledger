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
 */
export const theme: ThemeConfig = {
  // 主色系 - 基于 Logo 和分享卡片的绿色
  primary: {
    main: '#1A7A5E',       // 深绿色（Logo 背景色）
    light: '#5EC9A8',      // 中绿色
    lighter: '#7FDDB8',    // 浅绿色（分享卡片背景）
    dark: '#0E6647',       // 更深的绿色
  },
  
  // 辅助色系
  secondary: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      light: '#CCCCCC',
      main: '#999999',
      dark: '#666666',
    },
  },
  
  // 功能色
  functional: {
    success: '#0E9B68',    // 成功色（对勾的绿色）
    warning: '#FF9800',    // 警告色
    danger: '#F44336',     // 危险色
    info: '#2196F3',       // 信息色
    accent: '#D32F2F',     // 强调色（麻将"中"字红色）
  },
  
  // 背景色
  background: {
    page: '#F5F5F5',       // 页面背景
    card: '#FFFFFF',       // 卡片背景
    gradient: {            // 渐变背景（分享卡片的渐变）
      start: '#7FDDB8',
      end: '#5EC9A8',
    },
    mask: 'rgba(0, 0, 0, 0.5)', // 半透明蒙层
  },
  
  // 文字颜色
  text: {
    primary: '#333333',    // 主要文字
    secondary: '#666666',  // 次要文字
    hint: '#999999',       // 提示文字
    white: '#FFFFFF',      // 白色文字
    disabled: '#CCCCCC',   // 禁用文字
  },
  
  // 边框和分割线
  border: {
    light: '#F0F0F0',      // 浅色边框
    main: '#E0E0E0',       // 常规边框
    dark: '#CCCCCC',       // 深色边框
  },
  
  // 阴影
  shadow: {
    light: '0 2rpx 8rpx rgba(0, 0, 0, 0.08)',
    main: '0 4rpx 16rpx rgba(0, 0, 0, 0.12)',
    heavy: '0 8rpx 24rpx rgba(0, 0, 0, 0.16)',
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
