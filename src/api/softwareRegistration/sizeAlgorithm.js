import request from "@/services/request";

//查询所有尺寸算法
export const querySizeAlgorithmsList = () => {
    return request({
        url: `/software/query_size_algorithms`,
        method: "GET",
    });
};

//创建尺寸算法
export const createSizeAlgorithm = (data, ProgressCallBack = (e) => { }) => {
    return request({
        url: `/software/add_size_algorithm`,
        method: "POST",
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: function (e) {
            ProgressCallBack(e);
        }
    });
};
//修改尺寸算法
export const updateSizeAlgorithm = (data, ProgressCallBack = (e) => { }) => {
    return request({
        url: `/software/update_size_algorithm`,
        method: "POST",
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: function (e) {
            ProgressCallBack(e);
        }
    });
};


//删除尺寸算法
export const delSizeAlgorithm = ({ id }) => {
    return request({
        url: `/software/delete_size_algorithm?id=${id}`,
        method: "DELETE",
    });
};

//解析输入/输出
export const parseInputsOrOutputs = (type, data, ProgressCallBack = (e) => { }) => {
    return request({
        url: type == 'input' ? `/software/parse_inputs` : `/software/parse_outputs`,
        method: "POST",
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: function (e) {
            ProgressCallBack(e);
        }
    });
};
//查询尺寸算法是否可删除
export const query_size_algorithm_associations = (data) => {
    return request({
        url: `/software/query_size_algorithm_associations?id=${data.id}`,
        method: 'GET',
        data,
    })
}




