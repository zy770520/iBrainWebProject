import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
import Layout from '@/layout'
// 路由
export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      redirect: "/console/index",
      hidden: true,
    },
    {
      path: '/login',
      component: () => import('@/views/login/index'),
      name: 'login',
      hidden: true,
      meta: { title: '登录' }
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/404'),
      hidden: true,
      meta: { title: '404' }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/home/index'),
    },
    // {
    //   path: '/fatherHome',
    //   name: 'fatherHome',
    //   component: () => import('@/views/fatherHome/index'),
    //   meta: { title: '首页' }
    // },

    {
      path: '/console',
      name: 'console',
      component: Layout,
      children: [
        {
          path: 'index',
          component: () => import('@/views/console/index'),
          meta: { title: '运行', navTitle: '' }
        }
      ]
    },
    // {
    //   path: '/workflowConfig',
    //   name: 'workflowConfig',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import('@/views/workflowConfig/index'),
    //       meta: { title: '配置', navTitle: '' }
    //     }
    //   ]
    // },

    {
      path: '/workflowConfig',
      name: 'workflowConfig',
      component: Layout,
      children: [
        {
          path: 'index',
          name: 'index',
          component: () => import('@/views/workflowConfig/index'),
          meta: { title: '工作配置', navTitle: '工作配置' }
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/register/index')
        },
        {
          path: 'camera',
          name: 'camera',
          component: () => import('@/views/register/camera')
        },
        {
          path: 'light',
          name: 'light',
          component: () => import('@/views/register/light')
        },
        {
          path: 'electric',
          name: 'electric',
          component: () => import('@/views/register/electric')
        },
        {
          path: 'feeder',
          name: 'feeder',
          component: () => import('@/views/register/feeder')
        },
        {
          path: 'solenoid',
          name: 'solenoid',
          component: () => import('@/views/register/solenoid')
        },
        {
          path: 'station',
          name: 'station',
          component: () => import('@/views/register/station')
        },
        {
          path: 'triColor',
          name: 'triColor',
          component: () => import('@/views/register/triColor')
        },
        {
          path: 'stop',
          name: 'stop',
          component: () => import('@/views/register/stop')
        },
        {
          path: 'system',
          name: 'system',
          component: () => import('@/views/register/system')
        },
      ]
    },
    {
      path: '/softwareRegistration',
      name: 'softwareRegistration',
      component: Layout,
      children: [
        {
          path: 'sizeAlgorithm',
          name: 'sizeAlgorithm',
          component: () => import('@/views/softwareRegistration/sizeAlgorithm/index'),
          meta: { title: '尺寸算法', navTitle: '尺寸算法' }
        },
      ]
    },
  ]
})