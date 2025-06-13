/*
 * @Author: your name
 * @Date: 2022-04-13 09:27:20
 * @LastEditTime: 2022-08-05 11:44:26
 * @LastEditors: DESKTOP-03CCBDA\ghp 1823824442@qq.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \integrated-linkage-front-end\my-project\src\service\index.js
 */
//封装 Axios
import Vue from "vue"
import axios from "axios"
import router from "../router"
import { Message } from "element-ui"
// import { Decrypt } from "@/utils/CryptoJs"
// import { config } from "vue/types/umd"

const service2 = axios.create({
  baseURL: '/905',
  timeout: 50000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    // "Content-Type": "multipart/form-data",
  },
})

// 配置统一的基准地址
// if (process.env.NODE_ENV === 'development')
// service.defaults.baseURL = '/main';

// 拦截器 --请求拦截
service2.interceptors.request.use(
  (config) => {
    //请求成功、部分接口需要拿到token
    let token = localStorage.getItem("Admin")
    if (token) {
      config.headers.Authorization = "Bearer" + " " + token
    }
    return config
  },
  (err) => {
    console.log(err)
    //失败
    return Promise.reject(err)
  }
)

// 拦截器 -- 响应拦截
service2.interceptors.response.use(
  (res) => {
    return res.data
  },
  (err) => {
    if (err.__CANCEL__) {
      return new Promise(() => {
      }) // 取消axios请求时不报错
    }
    // 如果token失效重新去登录
    // if (err.response.status == 401) {
    //   // 每次手动关闭所有弹框
    //   Message.closeAll()
    //   Message.error({
    //     message: "登录已经过期，请重新登录！"
    //   })
    //   // 清除用户信息及token
    //   localStorage.removeItem("Admin")
    //   router.push({
    //     path: "/login"
    //   })
    //   return new Promise(() => { })
    // }
    // 每次响应时清除当前已有的message
    Message.closeAll()
    httpErrorStatusHandle(err)
    return Promise.reject(err)
  }
)

function httpErrorStatusHandle(error) {
  let message = ""
  if (error && error.response) {
    switch (error.response.status) {
      case 302:
        message = "接口重定向了！"
        break
      case 400:
        message = error.response.data ? error.response.data : "参数不正确！"
        break
      case 401:
        message = "您未登录，或者登录已经超时，请先登录！"
        break
      case 403:
        message = "您没有权限操作！"
        break
      case 404:
        message = `请求地址出错: ${error.response.config.url}`
        break
      case 408:
        message = "请求超时！"
        break
      case 409:
        message = "系统已存在相同数据！"
        break
      case 500:
        message = "服务器内部错误！"
        break
      case 501:
        message = "服务未实现！"
        break
      case 502:
        message = "网关错误！"
        break
      case 503:
        message = "服务不可用！"
        break
      case 504:
        message = "服务暂时无法访问，请稍后再试！"
        break
      case 505:
        message = "HTTP版本不受支持!"
        break
      default:
        message = "异常问题，请联系管理员！"
        break
    }
  }
  if (error.message.includes("timeout")) message = "网络请求超时！"
  if (error.message.includes("Network"))
    message = window.navigator.onLine ? "服务端异常！" : "您断网了！"
  console.log(message)
  Message.error({
    message,
  })
}

export const get = (url, params, config) => {
  return service2.get(url, { params, ...config })
}

export const post = (url, data, config) => {
  return service2.post(url, data, config)
}

export default service2
