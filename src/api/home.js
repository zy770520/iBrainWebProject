
import request, { get } from '@/services/request'
// 设备使用率
export const getUtilization = (data) => {
    // return request({
    //     url: `/dashboard/utilization?device_name=${data.deviceName}`,
    //     method: 'GET',
    //     data,
    // })
    return get('/dashboard/utilization', data);
}
// 左侧产品信息列表
export const getProduct = (data) => {
    // return request({
    //     url: `/dashboard/product?device_name=${data.deviceName}`,
    //     method: 'GET',
    //     data,
    // })
    return get('/dashboard/product', data);
}
// 九日状态
export const getDailyStatus = (data) => {
    // return request({
    //     url: `/dashboard/daily_status?device_name=${data.deviceName}`,
    //     method: 'GET',
    //     data,
    // })
    return get('/dashboard/daily_status', data);
}

// 历史数据
export const getDailyResult = (data) => {
    // return request({
    //     url: `/dashboard/daily_result?device_name=${data.deviceName}`,
    //     method: 'GET',
    //     data,
    // })
    return get('/dashboard/daily_result', data);
}
// 最近批次数据
export const getRecentBatch = (data) => {
    // return request({
    //     url: `/dashboard/recent_batch?device_name=${data.deviceName}`,
    //     method: 'GET',
    //     data,
    // })
    return get('/dashboard/recent_batch', data);

}

// 不合格参数项排名
export const getCategoryRatio = (data) => {
    // return request({
    //     url: `/dashboard/category_ratio?device_name=${data.deviceName}`,
    //     method: 'GET',
    //     data,
    // })
    return get('/dashboard/category_ratio', data);
}
// 产品参数占比
export const getStationRatio = (data) => {
    // return request({
    //     url: `/dashboard/station_ratio?device_name=${data.deviceName}`,
    //     method: 'GET',
    //     data,
    // })
    return get('/dashboard/station_ratio', data);
}

// 出料分档
export const getDischargePort = (data) => {
    // return request({
    //     url: `/dashboard/discharge_port?device_name=${data.deviceName}`,
    //     method: 'GET',
    //     data,
    // })
    return get('/dashboard/discharge_port', data);
}
// 安全运行天数
export const getSafetyDays = (data) => {
    // return request({
    //     url: `/dashboard/safety_days?device_name=${data.deviceName}`,
    //     method: 'GET',
    //     data,
    // })
    return get('/dashboard/safety_days', data);
}
// 查询拖拽
export const queryDragConfig = (data) => {
    return request({
        url: `/dashboard/query_drag_config`,
        method: 'GET',
        data,
    })
}
// 保存拖拽
export const saveDragConfig = (data) => {
    return request({
        url: `/dashboard/save_drag_config`,
        method: 'POST',
        data,
    })
}

