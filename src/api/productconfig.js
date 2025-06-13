import request, { get, post } from '@/services/request'
// AI模型列表
export const allModel = (data) => {
  return request({
    url: `/model/all_model_number`,
    method: 'GET',
    data,
  })
}
// 工位
export const allStation = (data) => {
  return request({
    url: `/station/all_station`,
    method: 'GET',
    data,
  })
}
//出料口
export const disChargePort = (data) => {
  return request({
    url: `/discharge_port/all_discharge_port`,
    method: 'GET',
    data,
  })
}
//上传文件
export const uploadFile = (data) => {
  return request({
    url: `/common/upload_files`,
    method: 'POST',
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data,
  })
}
//编辑保存
export const saveProduct = (data) => {
  return request({
    url: `/product_recognition_cfg/save_product_recognition_cfg`,
    method: 'POST',
    data,
  })
}
//查询产品列表
export const searchProduct = (data) => {
  return get('/product_recognition_cfg/search', data);
}
//删除产品
export const delProduct = (data) => {
  return request({
    url: `/product_recognition_cfg/delete?id=${data.productId}`,
    method: 'DELETE',
    data
  })
}
//查询单个产品识别配置
export const getSingleProduct = (data) => {
  return request({
    url: `/product_recognition_cfg/find_product_recognition_cfg?product_id=${data.productId}`,
    method: 'GET',
    data
  })
}
//准备
export const prepare = (data) => {
  return request({
    url: `/product_recognition_cfg/prepare?product_id=${data.product_id}`,
    method: 'POST',
    data
  })
}
//查询与产品关联的所有产品配置的id和name
export const findCfgsById = (data) => {
  return request({
    url: `/product/find_cfgs_by_id?product_id=${data.productId}`,
    method: 'GET',
    data
  })
}

//获取调试信息
export const getDebuggQuery = (data) => {
  return get('/debugging/query', data);
}
//保存调试信息
export const saveDebuggQuery = (data, saveAs) => {
  console.log("🚀 ~ saveDebuggQuery ~ saveAs:", saveAs)
  return post('/debugging/save?save_as=' + saveAs, data);
}