import request from '@/services/request'

export const userLogin = (data) => {
  return request({
    url: `/authn/login`,
    method: 'POST',
    data,
  })
}
export const userLogout = (data) => {
  return request({
    url: `/authn/logout`,
    method: 'DELETE',
    data,
  })
}