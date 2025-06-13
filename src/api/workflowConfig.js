import request, { get, post } from "@/services/request";

//相机及工位列表
export const cameras = () => {
  return request({
    url: `/config/cameras`,
    method: "GET",
  });
};

// 模型文件列表
export const getModels = (data) => {
  return request({
    url: `/config/models`,
    method: "GET",
    data,
  });
};

//获取相机最后一帧图片
export const getLastDisplay = (data) => {
  return request({
    url: `/config/last_display_frame`,
    method: "GET",
    params: data,
    // responseType: "blob",
  });
};

//执行器列表
export const getEecutorsList = (data) => {
  return request({
    url: `/config/executors`,
    method: "GET",
  });
};

// 启动工位试运行
export const startTrialRuningStation = (data) => {
  return request({
    url: `/hardware/start_trial_running_station`,
    method: "POST",
    data,
  });
};

//停止工位试运行
export const stopTrialRuningStation = (data) => {
  return request({
    url: `/hardware/stop_trial_running_station`,
    method: "GET",
  });
};
// 启动动态试运行
export const startDynamicTrialRuning = (data) => {
  return request({
    url: `/config/start_dynamic_trial_running`,
    method: "POST",
    data,
  });
};
//停止动态试运行
export const stopDynamicTrialRuning = (data) => {
  return request({
    url: `/config/stop_dynamic_trial_running`,
    method: "GET",
  });
};
// 启动AI阈值试运行
export const startTrialRuning = (data) => {
  return request({
    url: `/config/start_trial_running`,
    method: "POST",
    data,
  });
};

//停止AI阈值试运行
export const stopTrialRuning = (data) => {
  return request({
    url: `/config/stop_trial_running?algorithm_type=` + data.algorithm_type,
    method: "POST",
  });
};

//保存工作流配置
export const workFlowSave = (data) => {
  return request({
    url: `/config/save`,
    method: "POST",
    data,
  });
};
//复制工作流配置
export const cloneWorkFlow = (data) => {
  return request({
    url: `/config/clone?id=` + data.id,
    method: "POST",
  });
};
//查询工作配置详情
export const getWorkflows = (id) => {
  return request({
    url: `/config/query_config?id=` + id,
    method: "GET",
  });
};

//获取工作配置列表
export const getWorkConfigs = () => {
  return request({
    url: `/config/list_config`,
    method: "GET",
  });
};

// 工作配置删除
export const getDelete = (id) => {
  return request({
    url: `/config/delete/${id}`,
    method: "delete",
  });
};

//保存图片
export const saveImage = (data) => {
  return request({
    url: `/config/save_image`,
    method: "GET",
    params: data,
  });
};

//获取尺寸&厚度试运行实时检测结果
export const getVppResult = (data) => {
  return get('/config/vpp_trial_running_result', data);
};

//获取授权信息
export const getLicense = () => {
  return request({
    url: `/system/query_license`,
    method: "GET",
  });
};
//设置相机裁图框
export const setCameraRoi = (data) => {
  return request({
    url: `/hardware/set_camera_roi`,
    method: "POST",
    data,
  });
};

// 检查JS代码
export const checkJsCode = (data) => {
  return request({
    url: `/config/check_js_code`,
    method: "POST",
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    },
    data,
  });
};
//查询工作配置中相机的触发距离
export const queryDeviceOffset = (data) => {
  return request({
    url: `/config/query_device_offset?device_id=${data.device_id}` + `&device_type=${data.device_type}`,
    method: 'GET',
    data
  })
}
//启动电机试运行
export const startMotorTrialRuning = (data) => {
  return request({
    url: `/config/start_motor_trial_running`,
    method: "POST",
    data,
  });
};
//停止电机试运行
export const stopMotorTrialRuning = (data) => {
  return request({
    url: `/config/stop_motor_trial_running`,
    method: "GET",
  });
};
//更新电机参数
export const updateMotorParams = (data) => {
  return request({
    url: `/config/update_motor`,
    method: "POST",
    data,
  });
};
