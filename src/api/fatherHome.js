import request from '@/services/request'

// 在线设备总数
export const getDevicesCount = (data) => {
    return request({
        url: `/cloud/devices_count`,
        method: 'GET',
        data,
    })
}

// 设备列表
export const getAllDevice = (data) => {
    return request({
        url: `/cloud/all_device`,
        method: 'GET',
        data,
    })
}
// 设备集中监控
export const getDevicesMonitor = (data) => {
    return request({
        url: `/cloud/devices_monitor`,
        method: 'GET',
        data,
    })
}

// 在检产品种类数量
export const getCheckProductsCount = (data) => {
    return request({
        url: `/cloud/checking_products_count`,
        method: 'GET',
        data,
    })
}
// 主要检测产品汇总信息
export const getMainProductInfo = (data) => {
    return request({
        url: `/cloud/main_product_info`,
        method: 'GET',
        data,
    })
}

// 主要检测产品缺陷类型占比
export const getDefectStatistics = (data) => {
    return request({
        url: `/cloud/defect_statistics`,
        method: 'GET',
        data,
    })
}
// 主要检测产品检出缺陷排名
export const getDefectsRanking = (data) => {
    return request({
        url: `/cloud/defects_ranking`,
        method: 'GET',
        data,
    })
}
