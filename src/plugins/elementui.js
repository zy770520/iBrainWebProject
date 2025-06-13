import Vue from 'vue'
import ElementUI, { Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 重写Message组件，统一配置
const messageTypes = ['success', 'warning', 'info', 'error'];

// 默认配置
const defaultOptions = {
    duration: 2000,        // 显示时间，单位毫秒
    showClose: true,       // 显示关闭按钮
    customClass: 'custom-message-box', // 自定义CSS类
    offset: 20             // 消息距离窗口边缘的偏移量
};

// 创建自定义Message
const MessageCustom = {};

// 重写Message类型方法
messageTypes.forEach(type => {
    const originalMethod = Message[type];
    MessageCustom[type] = function (options) {
        if (typeof options === 'string') {
            options = {
                message: options,
                ...defaultOptions
            };
        } else {
            options = { ...defaultOptions, ...options };
        }

        const instance = originalMethod(options);

        // 添加点击外部关闭的功能
        const handleOutsideClick = (event) => {
            // 检查点击是否在消息框内部
            if (instance && instance.close && !event.target.closest('.el-message')) {
                instance.close();
                document.removeEventListener('click', handleOutsideClick);
            }
        };

        // 延迟添加事件监听，避免刚出现就被点击关闭
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 300);

        return instance;
    };
});

// 复制基础方法
const originalBaseMessage = Message;
MessageCustom.closeAll = Message.closeAll;

// 创建基础调用方法
MessageCustom.install = function (Vue) {
    Vue.prototype.$message = function (options) {
        if (typeof options === 'string') {
            options = {
                message: options,
                type: 'info',
                ...defaultOptions
            };
        } else {
            options = { ...defaultOptions, ...options };
        }

        const instance = originalBaseMessage(options);

        // 添加点击外部关闭的功能
        const handleOutsideClick = (event) => {
            // 检查点击是否在消息框内部
            if (instance && instance.close && !event.target.closest('.el-message')) {
                instance.close();
                document.removeEventListener('click', handleOutsideClick);
            }
        };

        // 延迟添加事件监听，避免刚出现就被点击关闭
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 300);

        return instance;
    };

    // 添加各种类型
    messageTypes.forEach(type => {
        Vue.prototype.$message[type] = MessageCustom[type];
    });

    // 添加关闭所有方法
    Vue.prototype.$message.closeAll = Message.closeAll;
};

// 先安装ElementUI
Vue.use(ElementUI);

// 再安装自定义Message
MessageCustom.install(Vue);

// 添加全局样式
const style = document.createElement('style');
style.innerHTML = `
  .custom-message-box {
    min-width: 280px;
    max-width: 330px;
    box-sizing: border-box;
    z-index: 9999 !important;
    border-radius: 8px;
    padding: 10px 15px;
    overflow: hidden;
    pointer-events: all;
    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  }
  
  /* 右侧弹出样式 */
  .el-message {
    top: 20px !important;
    left: auto !important;
    right: 20px !important;
    transform: translateX(0) !important;
    will-change: transform, opacity;
    animation: slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;
  }
  
  /* 设置消息堆叠时的间距 */
  .el-message + .el-message {
    margin-top: 50px;
  }
  
  /* 右侧滑入动画 */
  @keyframes slide-in-right {
    0% {
      opacity: 0;
      transform: translateX(20px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  /* 定义关闭时的动画 */
  .el-message-fade-leave-active {
    animation: slide-out-right 0.2s cubic-bezier(0.33, 1, 0.68, 1) forwards !important;
    will-change: transform, opacity;
  }
  
  @keyframes slide-out-right {
    0% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 0;
      transform: translateX(20px);
    }
  }
  
  /* 禁用默认的Element UI消息过渡 */
  .el-message-fade-enter,
  .el-message-fade-leave-to {
    opacity: 1 !important;
    transform: none !important;
  }
`;
document.head.appendChild(style);
