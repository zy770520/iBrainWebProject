import request from '@/services/request'
//飞拍总览串口
export const list_ports = () => {
  return request({
    url: `/hardware/list_ports`,
    method: 'GET'
  })
}
//控制器
export const query_ctlrs = () => {
  return request({
    url: `/hardware/query_ctlrs`,
    method: 'GET'
  })
}
//版本
export const version = (data) => {
  return request({
    url: `/hardware/version?name=${data.name}`,
    method: 'GET',
    data
  })
}
//查询所有硬件
export const query_ctlr_bindings = (data) => {
  return request({
    url: `/hardware/query_ctlr_bindings?id=${data.id}`,
    method: 'GET',
    data
  })
}
//保存
export const save_ctlr = (data) => {
  return request({
    url: `/hardware/save_ctlr`,
    method: 'POST',
    data,
  })
}
//删除
export const delete_ctlr = (data) => {
  return request({
    url: `/hardware/delete_ctlr?id=${data.id}`,
    method: 'DELETE',
    data,
  })
}
//所有相机
export const query_cameras = (data) => {
  return request({
    url: `/hardware/query_cameras?ctlr_id=${data.ctlr_id}`,
    method: 'GET',
    data
  })
}
//查询相机是否可删除
export const query_camera_associations = (data) => {
  return request({
    url: `/hardware/query_camera_associations?id=${data.id}`,
    method: 'GET',
    data,
  })
}
//保存
export const save_camera = (data) => {
  return request({
    url: `/hardware/save_camera`,
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
//删除
export const delete_camera = (data) => {
  return request({
    url: `/hardware/delete_camera?id=${data.id}`,
    method: 'DELETE',
    data,
  })
}
//试运行
export const trial_running_camera = (data) => {
  return request({
    url: `/hardware/trial_running_camera`,
    method: 'GET',
    data,
  })
}
//所有光源
export const query_lights = (data) => {
  return request({
    url: `/hardware/query_lights?ctlr_id=${data.ctlr_id}`,
    method: 'GET',
    data
  })
}
//查询光源是否可删除
export const query_light_associations = (data) => {
  return request({
    url: `/hardware/query_light_associations?id=${data.id}`,
    method: 'GET',
    data,
  })
}
//保存
export const save_light = (data) => {
  return request({
    url: `/hardware/save_light`,
    method: 'POST',
    data,
  })
}
//删除
export const delete_light = (data) => {
  return request({
    url: `/hardware/delete_light?id=${data.id}`,
    method: 'DELETE',
    data,
  })
}
//试运行
export const trial_running_light = (data) => {
  return request({
    url: `/hardware/trial_running_light`,
    method: 'GET',
    data,
  })
}
//所有电机
export const query_motors = (data) => {
  return request({
    url: `/hardware/query_motors?ctlr_id=${data.ctlr_id}`,
    method: 'GET',
    data
  })
}
//保存
export const save_motor = (data) => {
  return request({
    url: `/hardware/save_motor`,
    method: 'POST',
    data,
  })
}
//删除
export const delete_motor = (data) => {
  return request({
    url: `/hardware/delete_motor?id=${data.id}`,
    method: 'DELETE',
    data,
  })
}
//试运行
export const trial_running_motor = (data) => {
  return request({
    url: `/hardware/trial_running_motor`,
    method: 'GET',
    data,
  })
}
//所有上料器
export const query_feeder = (data) => {
  return request({
    url: `/hardware/query_feeder?ctlr_id=${data.ctlr_id}`,
    method: 'GET',
    data
  })
}
//保存
export const save_feeder = (data) => {
  return request({
    url: `/hardware/save_feeder`,
    method: 'POST',
    data,
  })
}
//试运行上料器
export const trial_running_feeder = (data) => {
  return request({
    url: `/hardware/trial_running_feeder`,
    method: 'GET',
    data,
  })
}
//所有工位
export const query_stations = (data) => {
  return request({
    url: `/hardware/query_stations?ctlr_id=${data.ctlr_id}`,
    method: 'GET',
    data
  })
}
//查询是否可以保存工位
export const query_could_save_station = (data) => {
  return request({
    url: `/hardware/query_could_save_station`,
    method: 'POST',
    data,
  })
}
//保存
export const save_station = (data) => {
  return request({
    url: `/hardware/save_station`,
    method: 'POST',
    data,
  })
}
//查询工位是否可删除
export const query_station_associations = (data) => {
  return request({
    url: `/hardware/query_station_associations?id=${data.id}`,
    method: 'GET',
    data,
  })
}
//删除
export const delete_station = (data) => {
  return request({
    url: `/hardware/delete_station?id=${data.id}`,
    method: 'DELETE',
    data,
  })
}
//试运行工位
export const trial_running_station = (data) => {
  return request({
    url: `/hardware/trial_running_station`,
    method: 'GET',
    data,
  })
}
//所有电磁阀
export const query_executors = (data) => {
  return request({
    url: `/hardware/query_executors?ctlr_id=${data.ctlr_id}`,
    method: 'GET',
    data
  })
}
//保存
export const save_executor = (data) => {
  return request({
    url: `/hardware/save_executor`,
    method: 'POST',
    data,
  })
}
//查询电磁阀是否可删除
export const query_executor_associations = (data) => {
  return request({
    url: `/hardware/query_executor_associations?id=${data.id}`,
    method: 'GET',
    data,
  })
}
//删除
export const delete_executor = (data) => {
  return request({
    url: `/hardware/delete_executor?id=${data.id}`,
    method: 'DELETE',
    data,
  })
}
//删除执行器
export const delete_workconfig_executor = (data) => {
  return request({
    url: `/config/delete/executor`,
    method: 'DELETE',
    data,
  })
}
//试运行电磁阀
export const trial_running_executor = (data) => {
  return request({
    url: `/hardware/trial_running_executor`,
    method: 'GET',
    data,
  })
}
//试运行三色灯
export const trial_running_monitor = (data) => {
  return request({
    url: `/hardware/trial_running_monitor`,
    method: 'GET',
    data,
  })
}
//触发系统
export const list_trigger_devices = (data) => {
  return request({
    url: `/trigger/list_trigger_devices?ctlr_id=${data.ctlr_id}`,
    method: 'GET',
    data
  })
}
//查看所有
export const query_triggers = (data) => {
  return request({
    url: `/trigger/query_triggers?ctlr_id=${data.ctlr_id}`,
    method: 'GET',
    data
  })
}
//保存
export const save_trigger = (data) => {
  return request({
    url: `/trigger/save_trigger`,
    method: 'POST',
    data,
  })
}
//删除
export const delete_trigger = (data) => {
  return request({
    url: `/trigger/delete_trigger?id=${data.id}`,
    method: 'DELETE',
    data,
  })
}
//更新触发距离
export const update_offset = (data) => {
  return request({
    url: `/trigger/update_offset?offset=${data.offset}`,
    method: 'GET',
    data
  })
}
//查询报警器
export const query_alarm = (data) => {
  return request({
    url: `/hardware/query_alarm?ctlr_id=${data.ctlr_id}`,
    method: 'GET',
    data,
  })
}
//保存报警器
export const save_alarm = (data) => {
  return request({
    url: `/hardware/save_alarm`,
    method: 'POST',
    data,
  })
}
//更新试运行相机参数
export const updateCamera = (data) => {
  return request({
    url: `/hardware/update_camera`,
    method: 'POST',
    data,
  })
}
//更新试运行光源参数
export const updateLight = (data) => {
  return request({
    url: `/hardware/update_light`,
    method: 'POST',
    data,
  })
}
//更新试运行工位参数
export const updateStation = (data) => {
  return request({
    url: `/hardware/update_station`,
    method: 'POST',
    data,
  })
}
//更新试运行电机参数
export const updateMotor = (data) => {
  return request({
    url: `/hardware/update_motor`,
    method: 'POST',
    data,
  })
}
//更新试运行电磁阀参数
export const updatExecutor = (data) => {
  return request({
    url: `/hardware/update_executor`,
    method: 'POST',
    data,
  })
}
//更新试运行触发距离参数
export const updateOffset = (data) => {
  return request({
    url: `/config/update_offset`,
    method: 'POST',
    data,
  })
}
//删除工作流
export const delete_workflow = (data) => {
  // 处理多个 ids
  const idsParam = Array.isArray(data.ids)
    ? data.ids.map(id => `ids=${id}`).join('&')
    : `ids=${data.ids}`;

  return request({
    url: `/config/delete/workflow?${idsParam}`,
    method: 'DELETE',
    data,
  })
}
//删除触发距离
export const delete_offset = (data) => {
  return request({
    url: `/trigger/delete_offset?ctlr_id=` + data.ctlr_id +
      '&device_id=' + data.device_id +
      '&device_type=' + data.device_type,
    method: 'DELETE',
    data,
  })
}
//查询触发距离是否可删除
export const query_offset_associations = (data) => {
  return request({
    url: `/trigger/query_offset_associations`,
    method: 'POST',
    data,
  })
}
//保存工位图片
export const save_station_img = (data) => {
  return request({
    url: `/hardware/save_image?ip=${data.ip}`,
    method: 'GET',
    data,
  })
}
