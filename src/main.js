// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import './styles/main.scss'
// 路由
import router from './router'
// ui组件
import './plugins/elementui'
// 组件二次封装
import iBrainComponments from './iBrain-components'
Vue.use(iBrainComponments)
// 阿里矢量图标库
import './assets/icon/iconfont.css'
import vClickOutside from 'v-click-outside'

Vue.use(vClickOutside)
// vuex
import store from './store'
import settingsModule from './store/modules/settings'

// 注册settings模块
store.registerModule('settings', settingsModule)
// 请求
import axios from '../src/services/request.js'
Object.defineProperty(Vue.prototype, '$http', {
  get() {
    return axios
  },
})
//全局注册sessionStorage
Vue.prototype.$sessionStorage = {
  setItem(key, value) {
    sessionStorage.setItem(key, value);
  },
  getItem(key) {
    return sessionStorage.getItem(key);
  },
  removeItem(key) {
    sessionStorage.removeItem(key);
  },
  clear() {
    sessionStorage.clear();
  }
};
// 适配插件
// import 'lib-flexible'
import './utils/lib-flexbile.js'
//dataV
import dataV from '@jiaminghi/data-view'
Vue.use(dataV)
import VueCompositionApi from '@vue/composition-api'

Vue.use(VueCompositionApi)
Vue.config.productionTip = false
//全局事件总线
Vue.prototype.$baseEventBus = new Vue();
//图片预览插件
import Viewer from 'v-viewer';
import 'viewerjs/dist/viewer.css';

Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 9999,
    shown: true,
    viewed: true,
    rotatable: true,
    scalable: true,
    zoomable: true,
    movable: true,
    tooltip: true,
    shown: true,
    loop: true,
    navbar: true,
    title: true,
    toolbar: {
      delete: {
        show: false,
      },
    },
  },
});
Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 9999, // 设置图片预览组件的层级，确保能在其他组件之上
  },
})
//颜色选择器
import vcolorpicker from 'vcolorpicker'
Vue.use(vcolorpicker)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
