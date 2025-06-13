<template>
    <div class="sizeAlgorithm-layout">
        <div class="list-box" v-loading="loading">
            <div class="list-body">
                <div class="list-header">尺寸算法总览表</div>
                <div style="width: 100%;flex:1">
                    <el-table :data="sizeAlgorithmsList" ref="sizeAlgorithmsRef" class="custom-row-gap" height="100%"
                        highlight-current-row :row-class-name="tableRowClassName" style="width: 100%"
                        @row-click="tableRowClick">
                        <el-table-column prop="number" label="序号" width="100">
                            <template slot-scope="scope">
                                <div class="number-box-call">
                                    <div class="number-icon">
                                        <svg class="icon"
                                            style="width: 100%;height:100%;vertical-align: middle;fill: currentColor;overflow: hidden;"
                                            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                            p-id="4917">
                                            <path
                                                d="M918.208 424.96L207.04 13.824C139.456-25.088 55.488 23.552 55.488 101.376v821.76c0 77.824 83.968 125.952 151.04 87.04l711.68-410.624c67.072-38.912 67.072-136.192 0-174.592z"
                                                p-id="4918"></path>
                                        </svg>
                                    </div>
                                    <div class="number-txt">{{ scope.$index + 1 }}</div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="名称" min-width="200" show-overflow-tooltip>
                            <template slot-scope="scope">
                                <font class="state-txt">{{ scope.row['name'] || '未配置' }}</font>
                            </template>
                        </el-table-column>
                        <el-table-column prop="type" label="类型" show-overflow-tooltip>
                            <template slot-scope="scope">
                                <font class="state-txt">{{ scope.row['inputs_outputs'].type | getDataType }}</font>
                            </template>
                        </el-table-column>
                        <el-table-column prop="type" label="" width="60">
                            <template slot-scope="scope">
                                <el-tooltip content="删除">
                                    <i class="el-icon-remove-outline rowDel"
                                        @click="delSizeAlgorithm(scope.row, scope.$index)"></i>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="create-btns">
                    <div style="display: flex; align-items: center;">
                        <i class="el-icon-circle-plus-outline" @click="createSizeAlgorithm()"></i> 新增算法
                    </div>
                </div>
            </div>
        </div>
        <div class="config-layout">
            <configLayout ref="configLayoutRef" @dataRefresh="init" @dataRowUpdata="dataRowUpdata"
                :isCreated="createBol">
            </configLayout>
        </div>
        <RemoveDialog :removeDialogVisible="isShowDialog" :removeData="removeMessage"></RemoveDialog>
    </div>
</template>

<script>
import configLayout from './config.vue';
import { querySizeAlgorithmsList, delSizeAlgorithm, query_size_algorithm_associations } from '@/api/softwareRegistration/sizeAlgorithm.js'
import RemoveDialog from "@/views/register/removeHardwareComponent/index.vue";
export default {
    name: 'sizeAlgorithm',
    components: { configLayout, RemoveDialog },
    data() {
        return {
            sizeAlgorithmsList: [],
            loading: true,
            createBol: false,
            isShowDialog: false,
            removeMessage: {}
        }
    },
    filters: {
        getDataType(v) {
            return v == 'Size' ? '尺寸' : (v == 'Thick' ? '厚度' : '未配置');
        }
    },
    watch: {
    },
    created() {
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        if (window.history && window.history.pushState) {
            window.addEventListener('popstate', this.goBack, false);
        }
    },
    computed: {

    },
    mounted() {
        this.sizeAlgorithmsList = [];
        this.init()
    },
    beforeDestroy() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        window.removeEventListener('popstate', this.goBack, false);
    },
    methods: {
        handleBeforeUnload(event) {
            const message = '系统可能不会保存您所做的更改';
            event.returnValue = message;
            return message;
        },
        goBack() {
            // 获取url历史记录
            if (confirm('系统可能不会保存您所做的更改')) {
                window.removeEventListener('popstate', this.goBack, false);
                window.history.go(-1);
            } else {
                window.history.pushState('forward', null, '');
                window.history.forward(1);
            }

        },
        init() {
            this.createBol = false;
            this.loading = true;
            this.sizeAlgorithmsList = [];
            querySizeAlgorithmsList().then(res => {
                console.log("🚀 ~ querySizeAlgorithmsList ~ res:", res)
                this.sizeAlgorithmsList = res;
            }).finally((e) => {
                this.loading = false;
            })
        },
        tableRowClassName({ row, rowIndex }) {
            return 'com-trColumn';
        },
        tableRowClick(row, column, event) {
            this.$refs.configLayoutRef.init(row)
        },
        dataRowUpdata(obj) {
            this.init()
        },
        delSizeAlgorithm(obj, index) {
            if (obj.id == 0) {
                this.sizeAlgorithmsList.splice(index, 1);
                this.$refs.configLayoutRef.initData();
                this.createBol = false;
                return;
            }
            query_size_algorithm_associations({ id: obj.id }).then(res => {
                if (res.workflows && res.workflows.length > 0) {
                    this.isShowDialog = true;
                    this.removeMessage = {};
                    this.$nextTick(() => {
                        this.isShowDialog = true;
                        this.removeMessage = res;
                    });
                    return;
                } else {
                    this.$confirm(`确定要删除此算法?`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        delSizeAlgorithm({ id: obj.id }).then(res => {
                            this.$message({
                                type: 'success',
                                message: `算法删除成功！`
                            });
                            this.sizeAlgorithmsList.splice(index, 1);
                            this.$refs.configLayoutRef.initData()
                        })
                    }).catch(() => {
                        this.delActionIndex = '';
                    });
                }
            })
        },
        createSizeAlgorithm() {
            if (this.createBol) {
                this.$message.warning('当前有正在新增的尺寸算法数据')
                return false;
            }
            let row = { id: 0, name: '', blueprint: '', inputs_outputs: { type: '' } }
            this.sizeAlgorithmsList.push(row);
            this.createBol = true;
            this.$nextTick(() => {
                this.$refs.sizeAlgorithmsRef.setCurrentRow(row);
                this.$refs.configLayoutRef.initData()
            })

        }
    }
}
</script>
<style lang="scss">
.sizeAlgorithm-layout .el-table .com-trColumn {
    margin-bottom: 1px;
}

.sizeAlgorithm-layout .el-table .com-trColumn td {
    background: #FFF !important;
    padding: 8px 0;
}

.sizeAlgorithm-layout .el-table .com-trColumn .cell {
    background: #F5F5F5 !important;
    height: 38px;
    line-height: 38px;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.sizeAlgorithm-layout .el-table .com-trColumn .cell {
    background: #F5F5F5 !important;
    height: 38px;
    line-height: 38px;
    cursor: pointer;
}

.sizeAlgorithm-layout .rowDel {
    font-size: 23px;
    color: #bebebe;

    &:hover {
        color: red;
    }
}


.sizeAlgorithm-layout .el-table .current-row .cell {
    background: rgba(222, 134, 143, .4) !important;
}
</style>
<style lang="scss" scoped>
.sizeAlgorithm-layout {
    float: right;
    display: flex;
    width: calc(100% - 1.2rem);
    height: calc(100vh - 0.26rem);

    .list-box {
        flex: 1;
        padding: 28px;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;

        .list-body {
            flex: 1;
            background: #FFF;
            border-radius: 10px;
            padding: 28px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        .list-header {
            color: #111;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .number-box-call {
            position: relative;
            width: 100%;
            height: 47px;
        }

        .state-txt {
            color: #030303;
            font-weight: bold;
        }

        .number-txt {
            position: absolute;
            width: 100px;
            height: 47px;
            top: 0px;
            left: 0px;
            color: #FFF;
            line-height: 40px;
            z-index: 2;
        }

        .number-icon {
            position: absolute;
            width: 100px;
            height: 150px;
            top: -30px;
            left: -58px;
            transform: rotate(90deg);
            z-index: 1;
        }

        ;

    }

    .config-layout {
        width: 781px;
        height: 100%;
    }

    .create-btns {
        height: 50px;
        display: flex;
        align-items: flex-start;
        color: rgba(154, 154, 154, 1);
        font-size: 16px;
        padding-left: 5px;
        margin-top: 10px;
        margin-bottom: 10px;

        .el-icon-circle-plus-outline {
            font-size: 32px;
            color: #BEBEBE;
            cursor: pointer;
            margin-right: 7px;
        }
    }


}
</style>
