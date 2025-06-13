import request, { get } from "@/services/request";

// 相机及工位列表
export const getCameras = (data) => {
  return request({
    url: `/config/cameras`,
    method: "GET",
    data,
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

// 工作流列表
export const getWorkflows = (data) => {
  return request({
    url: `/config/workflows/${data.id}`,
    method: "GET",
    data,
  });
};

// 工作配置删除
export const getDelete = (data) => {
  return request({
    url: `/config/delete/${data.id}`,
    method: "delete",
    data,
  });
};

// 工作配置保存
export const getSave = (data) => {
  return request({
    url: `/config/save`,
    method: "POST",
    data,
  });
};
// 查看相机拍摄画面
export const getView = (data) => {
  return get("/view", data);
};

// 查询所有电磁阀
export const query_executors = (data) => {
  return request({
    url: `/hardware/query_executors`,
    method: "GET",
    params: data,
  });
};

// 查询所有电磁阀id
export const query_ctlrs = (data) => {
  return request({
    url: `/hardware/query_ctlrs`,
    method: "GET",
    data,
  });
};
// 阈值试运行参数实时更新
export const updateTrialRunning = (params, data) => {
  // 使用 URLSearchParams 动态构建查询参数
  const queryParams = new URLSearchParams();

  // 仅当 min_area 有值（非 undefined/null）时添加
  if (params.min_area != null) {
    queryParams.append('min_area', params.min_area);
  }

  return request({
    url: `/config/update_trial_running?${queryParams.toString()}`,
    method: "POST",
    data,
  });
};
