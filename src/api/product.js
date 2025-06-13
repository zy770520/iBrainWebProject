import request, { get } from '@/services/request'

// 新建产品
export const addProduct = (data) => {
  return request({
    url: `/product/create`,
    method: 'POST',
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
export const editProduct = (data) => {
  return request({
    url: `/product/edit`,
    method: 'PUT',
    data,
  })
}
//查询产品列表
export const searchProduct = (data) => {
  return get('/product/search', data);
}
//删除产品
export const delProduct = (data) => {
  return request({
    url: `/product/delete?id=${data.productId}`,
    method: 'DELETE',
    data
  })
}
//查询单个产品
export const getSingleProduct = (data) => {
  return request({
    url: `/product/find_single_product?id=${data.productId}`,
    method: 'GET',
    data
  })
}

export const deleteProduct = (id) => {
  return request({
    url: `/product/delete?id=${id}`,
    method: 'DELETE',
  })
}
//附件预览
export const previewAttachment = (data) => {
  return request({
    url: `/product/preview_attachment?product_id=${data.productId}`,
    method: 'GET',
    responseType: 'blob',
    data
  })
}