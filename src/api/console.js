import request, { get, post } from '@/services/request'

//控制台信息
export const consoleInfo = (data) => {
  return get('/console/info', data);
}
export const consolePort = (data) => {
  return get('/console/discharge_port', data);
}
export const consoleProp = (data) => {
  return get('/console/proportion', data);
}
export const consoleExteriorTitle = (data) => {
  return get('/console/exterior/title', data);
}
export const consoleExteriorBody = (data) => {
  return get('/console/exterior/body', data);
}
export const consoleStart = (data) => {
  return request({
    url: `/execution/start?config_id=${data.config_id}`,
    method: 'POST',
  })
}
export const consoleStop = (data) => {
  return post('/execution/stop', data);
}

export const consoleParams = (data) => {
  return get('/console/params', data);
}
export const consolePolyline = (data) => {
  return request({
    url: `/console/polyline?product_cfg_id=` + data.product_cfg_id +
      '&product_cfg_type=' + data.product_cfg_type,
    method: 'GET',
    data,
  })
}
export const consolePie = (data) => {
  return request({
    url: `/console/pie?product_cfg_id=` + data.product_cfg_id +
      '&product_cfg_type=' + data.product_cfg_type,
    method: 'GET',
    data,
  })
}
export const consoleRanking = (data) => {
  return get('/console/ranking', data);
}
//查询卡片配置
export const queryCardConfig = (data) => {
  return get('/execution/query_card_config', data);
}
//保存卡片配置
export const saveCardConfig = (data) => {
  return post('/execution/save_card_config', data);
}
//查询当前运行状态
export const exeCurrentState = (data) => {
  return get('/execution/current_state', data);
}
//查询运行时错误消息
export const queryRuntimeError = (data) => {
  return get('/execution/error_msg_stream', data);
}
//查询运行时卡片数据错误消息
export const queryRuntimeErrorCard = (data) => {
  return get('/execution/statistics_workflow', data);
}
