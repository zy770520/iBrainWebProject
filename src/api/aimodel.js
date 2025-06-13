import request, { get } from '@/services/request'

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
//新建编辑保存
export const saveModel = (data) => {
  return request({
    url: `/model/save`,
    method: 'POST',
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data,
  })
}
export const searchModel = (data) => {
  return get('/model/search', data);
}
//删除模型
export const delModel = (data) => {
  return request({
    url: `/model/delete?id=${data.productId}`,
    method: 'DELETE',
    data
  })
}