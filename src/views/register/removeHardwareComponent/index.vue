<template>
    <div class="remove-hardware-component">
        <el-dialog class="removeDialogClass" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false"
            :modal-append-to-body="false" append-to-body>
            <div class="dialog-conent">
                <i class="iconfont icon-lbznjinggao" style="color: brown;cursor: pointer;"></i>
                <div class="dialog-text"
                    v-if="removeInfo && (removeInfo.station || (removeInfo.workflows && removeInfo.workflows.length > 0) || removeInfo.offset || (removeInfo.work_configs && removeInfo.work_configs.length > 0))">
                    <span>
                        <a>【{{ removeInfo.name }}】</a>禁止删除!该项被系统配置多处关联引用! 您可以:
                    </span>
                    <span>
                        <i>○</i>优先通过修改<a>【{{ removeInfo.name }}】</a>配置满足需求(修改后会即刻生效)
                    </span>
                    <span>
                        <i>○</i> 解除关联后再删除:
                    </span>
                    <!-- 工作流 -->
                    <span class="config" v-if="removeInfo.workflows && removeInfo.workflows.length > 0">
                        <div class="config-class children-config line" @click="checkConfigDetail">
                            <i>▪️</i>解除相关工作配置关联
                        </div>
                    </span>
                    <!-- 工作配置 -->
                    <span class="config" v-if="removeInfo.work_configs && removeInfo.work_configs.length > 0">
                        <div class="config-class children-config line" @click="checkWorkConfigDetail">
                            <i>▪️</i>解除相关工作配置执行器关联
                        </div>
                    </span>
                    <!-- 工位 -->
                    <span class="station" v-if="removeInfo.station">
                        <i>▪️</i>【{{ removeInfo.station.name }}】使用了<a>【{{ removeInfo.name }}】</a>
                        <a class="line" @click="manualStationRelease">手动解除关联</a>
                        <a class="line" @click="removeStation">删除该工位</a>
                    </span>
                    <!-- 触发距离 -->
                    <span class="config" v-if="removeInfo.offset">
                        <div class="config-class">
                            <i>▪️</i>触发系统存在<a>【{{ removeInfo.name }}】</a>触发配置
                            <a class="line" @click="manualOffsetRelease">手动解除关联</a>
                            <a class="line" @click="removeOffset">删除该配置</a>
                        </div>
                    </span>
                </div>
            </div>
            <el-dialog :visible.sync="innerVisible" append-to-body class="removeDialogClass childrenDialogClass">
                <div class="dialog-conent" v-if="workflowList && workflowList.length > 0">
                    <i class="iconfont icon-lbznjinggao" style="color: brown;cursor: pointer;"></i>
                    <div class="dialog-text">
                        <span>以下工作配置使用了<a>【{{ removeInfo.name }}】</a>:</span>
                        <div class="workflow-class">
                            <div class="workflow-item-class" v-for="(workFlowItem, index) in workflowList" :key="index">
                                <el-tooltip :content="`【${workFlowItem.work_config_name}】工作配置【${removeInfo.name}】工作流`"
                                    placement="top"
                                    :disabled="`【${workFlowItem.work_config_name}】工作配置【${removeInfo.name}】工作流`.length > 16 ? false : true">
                                    <span ref="textSpan"><i>○</i><a>【{{ workFlowItem.work_config_name }}】</a>工作配置<a>【{{
                                        removeInfo.name }}】</a>工作流</span>
                                </el-tooltip>
                                <a class="line"
                                    @click="manualWorkflowRelease(workFlowItem.work_config_id, workFlowItem.work_config_name)">手动解除关联</a>
                                <a class="line" @click="removeWorkflow(workFlowItem.workflow_id, index)">删除相关工作流</a>
                            </div>
                        </div>
                        <div class="workflow-all-class" v-if="workflowList.length > 0" @click="removeWorkflows">
                            删除所有相关工作流</div>
                    </div>
                </div>
            </el-dialog>
            <el-dialog :visible.sync="connfigInnerVisible" append-to-body class="removeDialogClass childrenDialogClass">
                <div class="dialog-conent" v-if="workConfigList && workConfigList.length > 0">
                    <i class="iconfont icon-lbznjinggao" style="color: brown;cursor: pointer;"></i>
                    <div class="dialog-text">
                        <span>以下工作配置使用了<a>【{{ removeInfo.name }}】</a>:</span>
                        <div class="workflow-class">
                            <div class="workflow-item-class" v-for="(workFlowItem, index) in workConfigList"
                                :key="index">
                                <el-tooltip :content="`【${workFlowItem.work_config_name}】工作配置【${removeInfo.name}】`"
                                    placement="top"
                                    :disabled="`【${workFlowItem.work_config_name}】工作配置【${removeInfo.name}】`.length > 16 ? false : true">
                                    <span ref="textSpan"><i>○</i><a>【{{ workFlowItem.work_config_name }}】</a>工作配置<a>【{{
                                        removeInfo.name }}】</a></span>
                                </el-tooltip>
                                <a class="line"
                                    @click="manualWorkConfigRelease(workFlowItem.work_config_id, workFlowItem.work_config_name)">手动解除关联</a>
                                <a class="line"
                                    @click="removeWorkConfig(workFlowItem.work_config_id, index)">删除相关工作配置执行器</a>
                            </div>
                        </div>
                        <div class="workflow-all-class" v-if="workConfigList.length > 0" @click="removeWorkConfigs">
                            删除所有相关工作配置执行器</div>
                    </div>
                </div>
            </el-dialog>
        </el-dialog>
    </div>
</template>
<script>
import { delete_station, delete_workflow, delete_offset, query_station_associations, delete_workconfig_executor, query_offset_associations } from "@/api/register.js";

export default {
    name: '',
    props: {
        removeDialogVisible: {
            type: Boolean,
            default: () => false,
        },
        removeData: {
            type: Object,
            default: () => { },
        }
    },
    watch: {
        removeDialogVisible: {
            handler(value) {
                this.dialogVisible = value;
            },
            deep: true,
        },
        removeData: {
            handler(value) {
                console.log("🚀 ~ handler ~ value:", value)
                this.removeInfo = value;
            },
            deep: true,
        }
    },
    data() {
        return {
            dialogVisible: false,
            removeInfo: {},
            innerVisible: false,
            connfigInnerVisible: false,
            workflowList: null,
            workConfigList: null,
        }
    },
    mounted() {
    },
    methods: {
        //打开工作流二级弹窗
        checkConfigDetail() {
            //获取工位关联的工作流
            this.workflowList = this.removeInfo.workflows;
            if (this.workflowList && this.workflowList.length > 0) {
                this.innerVisible = true;
            }
        },
        //打开工作配置二级弹窗
        checkWorkConfigDetail() {
            //获取电磁阀关联的工作配置
            this.workConfigList = this.removeInfo.work_configs;
            if (this.workConfigList && this.workConfigList.length > 0) {
                this.connfigInnerVisible = true;
            }
        },
        //删除工位
        removeStation() {
            //删除工位前需先查询工位是否可以删除
            query_station_associations({ id: this.removeInfo.station.id }).then(res => {
                //如果不可删，则弹出工作流列表弹窗
                if (res.workflows && res.workflows.length > 0) {
                    this.innerVisible = true;
                    this.workflowList = res.workflows;
                    this.removeInfo.workflows = res.workflows;
                } else {
                    //如果可删，则直接删除工位
                    let params = { id: this.removeInfo.station.id };
                    this.$confirm('确定要删除此工位?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        delete_station(params).then(() => {
                            this.$message.success('删除成功！');
                            this.removeInfo.station = null;

                            // 检查所有关联项是否都已解除
                            const hasNoStation = !this.removeInfo.station || this.removeInfo.station === null;
                            const hasNoWorkflows = !this.removeInfo.workflows || this.removeInfo.workflows.length === 0;
                            const hasNoOffset = !this.removeInfo.offset;
                            const hasNoWorkConfigs = !this.removeInfo.work_configs || this.removeInfo.work_configs.length === 0;

                            // 如果所有关联都已解除，则关闭弹窗
                            if (hasNoStation && hasNoWorkflows && hasNoOffset && hasNoWorkConfigs) {
                                this.dialogVisible = false;
                            }
                        })
                    });
                }
            })
        },
        //删除触发配置
        removeOffset() {
            //删除触发距离前需先查询触发距离是否可以删除
            let removeParams = {
                ctlr_id: Number(this.removeInfo.ctlrId),
                devices: [
                    {
                        id: this.removeInfo.removeId,
                        type: this.removeInfo.removeType
                    }
                ]
            };
            query_offset_associations(removeParams).then(res => {
                if (!res || !res[0]) {
                    // 如果res[0]为null或undefined，直接删除
                    this.deleteOffset();
                } else if ((res[0].workflows && res[0].workflows.length > 0) || (res[0].work_configs && res[0].work_configs.length > 0)) {
                    //如果不可以删除
                    this.$message.warning('触发距离被工作配置关联，请先解除关联！');
                } else {
                    //如果可以删除，则删除
                    this.deleteOffset();
                }
            });
        },
        //删除触发距离
        deleteOffset() {
            let params = {
                ctlr_id: this.removeInfo.ctlrId,
                device_id: this.removeInfo.removeId,
                device_type: this.removeInfo.removeType
            };
            this.$confirm('确定要删除此触发距离?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                delete_offset(params).then(res => {
                    this.$message.success('触发距离删除成功！')
                    this.removeInfo.offset = null;
                    // 检查所有关联项是否都已解除
                    const hasNoStation = !this.removeInfo.station || this.removeInfo.station === null;
                    const hasNoWorkflows = !this.removeInfo.workflows || this.removeInfo.workflows.length === 0;
                    const hasNoOffset = !this.removeInfo.offset;
                    const hasNoWorkConfigs = !this.removeInfo.work_configs || this.removeInfo.work_configs.length === 0;

                    // 如果所有关联都已解除，则关闭弹窗
                    if (hasNoStation && hasNoWorkflows && hasNoOffset && hasNoWorkConfigs) {
                        this.dialogVisible = false;
                    }
                })
            });
        },
        //删除工作流
        removeWorkflow(workFlowId, index) {
            this.$confirm('确定要删除此工作流?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                delete_workflow({ ids: workFlowId }).then(res => {
                    this.$message.success('工作流删除成功！')
                    // 更新工作流列表
                    this.workflowList.splice(index, 1);
                    // 同步更新removeInfo中的工作流数据
                    this.removeInfo.workflows = this.removeInfo.workflows.filter(item => item.workflow_id !== workFlowId);
                    if (this.workflowList.length == 0) {
                        this.innerVisible = false;

                        // 检查所有关联项是否都已解除
                        const hasNoStation = !this.removeInfo.station || this.removeInfo.station === null;
                        const hasNoWorkflows = !this.removeInfo.workflows || this.removeInfo.workflows.length === 0;
                        const hasNoOffset = !this.removeInfo.offset;
                        const hasNoWorkConfigs = !this.removeInfo.work_configs || this.removeInfo.work_configs.length === 0;

                        // 如果所有关联都已解除，则关闭弹窗
                        if (hasNoStation && hasNoWorkflows && hasNoOffset && hasNoWorkConfigs) {
                            this.dialogVisible = false;
                        }
                    }
                })
            });
        },
        //删除所有工作流
        removeWorkflows() {
            let workFlowIds = this.removeInfo.workflows.map(item => item.workflow_id);
            this.$confirm('确定要删除全部工作流?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                delete_workflow({ ids: workFlowIds }).then(res => {
                    this.$message.success('全部工作流删除成功！');
                    this.workflowList = [];
                    this.removeInfo.workflows = [];
                    this.innerVisible = false;

                    // 检查所有关联项是否都已解除
                    const hasNoStation = !this.removeInfo.station || this.removeInfo.station === null;
                    const hasNoWorkflows = !this.removeInfo.workflows || this.removeInfo.workflows.length === 0;
                    const hasNoOffset = !this.removeInfo.offset;
                    const hasNoWorkConfigs = !this.removeInfo.work_configs || this.removeInfo.work_configs.length === 0;

                    // 如果所有关联都已解除，则关闭弹窗
                    if (hasNoStation && hasNoWorkflows && hasNoOffset && hasNoWorkConfigs) {
                        this.dialogVisible = false;
                    }
                })
            });
        },
        //删除工作配置执行器
        removeWorkConfig(workConfigId, index) {
            this.$confirm('确定要删除此工作配置执行器?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let params = {
                    "executor_id": this.removeInfo.removeId,
                    "work_config_ids": [workConfigId]
                }
                delete_workconfig_executor(params).then(res => {
                    this.$message.success('工作配置执行器删除成功！');
                    // 更新工作配置列表
                    this.workConfigList.splice(index, 1);
                    // 同步更新removeInfo中的工作配置数据
                    this.removeInfo.work_configs = this.removeInfo.work_configs.filter(item => item.work_config_id !== workConfigId);
                    if (this.workConfigList.length == 0) {
                        this.connfigInnerVisible = false;

                        // 检查所有关联项是否都已解除
                        const hasNoStation = !this.removeInfo.station || this.removeInfo.station === null;
                        const hasNoWorkflows = !this.removeInfo.workflows || this.removeInfo.workflows.length === 0;
                        const hasNoOffset = !this.removeInfo.offset;
                        const hasNoWorkConfigs = !this.removeInfo.work_configs || this.removeInfo.work_configs.length === 0;

                        // 如果所有关联都已解除，则关闭弹窗
                        if (hasNoStation && hasNoWorkflows && hasNoOffset && hasNoWorkConfigs) {
                            this.dialogVisible = false;
                        }
                    }
                })
            });
        },
        //删除所有工作配置执行器
        removeWorkConfigs() {
            this.$confirm('确定要删除所有工作配置执行器?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let params = {
                    "executor_id": this.removeInfo.removeId,
                    "work_config_ids": this.workConfigList.map(item => item.work_config_id)
                }
                delete_workconfig_executor(params).then(res => {
                    this.$message.success('工作配置所有执行器删除成功！');
                    this.workConfigList = [];
                    this.removeInfo.work_configs = [];
                    this.connfigInnerVisible = false;

                    // 检查所有关联项是否都已解除
                    const hasNoStation = !this.removeInfo.station || this.removeInfo.station === null;
                    const hasNoWorkflows = !this.removeInfo.workflows || this.removeInfo.workflows.length === 0;
                    const hasNoOffset = !this.removeInfo.offset;
                    const hasNoWorkConfigs = !this.removeInfo.work_configs || this.removeInfo.work_configs.length === 0;

                    // 如果所有关联都已解除，则关闭弹窗
                    if (hasNoStation && hasNoWorkflows && hasNoOffset && hasNoWorkConfigs) {
                        this.dialogVisible = false;
                    }
                })
            });
        },
        //手动解除工位
        manualStationRelease() {
            // 关闭当前弹窗
            this.dialogVisible = false;
            // 跳转到硬件注册工位页面
            this.$router.push({
                path: '/workflowConfig/station',
                query: {
                    // 传递控制器ID，确保左侧导航能正确选中
                    id: this.removeInfo.ctlrId
                }
            });
        },
        //手动解除触发配置
        manualOffsetRelease() {
            // 关闭当前弹窗
            this.dialogVisible = false;
            // 跳转到触发系统页面
            this.$router.push({
                path: '/workflowConfig/system',
                query: {
                    // 传递控制器ID，确保左侧导航能正确选中
                    id: this.removeInfo.ctlrId
                }
            });
        },
        //手动解除工作流
        manualWorkflowRelease(workConfigId, workConfigName) {
            // 关闭当前弹窗
            this.innerVisible = false;
            this.dialogVisible = false;
            // 跳转到工作配置页面
            this.$router.push({
                path: '/workflowConfig/index',
                query: {
                    id: workConfigId,
                    name: workConfigName,
                }
            });
        },
        //手动解除工作配置
        manualWorkConfigRelease(workConfigId, workConfigName) {
            // 关闭当前弹窗
            this.connfigInnerVisible = false;
            this.dialogVisible = false;
            // 跳转到工作配置页面
            this.$router.push({
                path: '/workflowConfig/index',
                query: {
                    id: workConfigId,
                    name: workConfigName,
                }
            });
        },
    },
    beforeDestroy() {
    }
}
</script>

<style lang="scss">
.removeDialogClass {
    .el-dialog {
        border-radius: 10px;
        width: 760px !important;

        .el-dialog__header {
            .el-dialog__headerbtn {
                .el-dialog__close {
                    color: #d01b03;
                    font-size: 20px;
                    font-weight: 500;
                }
            }
        }

        .el-dialog__body {
            padding: 10px !important;

            .dialog-conent {
                display: flex;
                flex-direction: row;
                align-items: flex-start;

                i {
                    font-size: 34px;
                }

                .dialog-text {
                    display: flex;
                    flex-direction: column;
                    margin-left: 10px;

                    span {
                        display: flex;
                        align-items: center;
                        font-size: 16px;
                        color: #000000;
                        margin-bottom: 10px;

                        i {
                            font-size: 12px;
                            font-style: normal;
                            margin-right: 5px;
                        }

                        a {
                            font-size: 16px;
                            color: #d01b03;
                        }

                        .config-class {
                            margin-bottom: 10px;
                        }

                        .line {
                            text-decoration: underline;
                            color: #6b99ef;
                            cursor: pointer;
                            margin-left: 20px;
                        }
                    }

                    .config {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start !important;

                        .children-config {
                            margin-left: 15px;
                            font-size: 16px !important;
                        }
                    }

                    .config-class {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        margin-left: 15px;

                        .config-item-class {
                            font-size: 16px;
                            color: #000000;
                            margin-bottom: 10px;
                            margin-left: 10px;
                            display: flex;
                            flex-direction: row;

                            .config-class {
                                margin-bottom: 10px;
                                margin-right: 30px;

                                i {
                                    font-size: 12px;
                                    font-style: normal;
                                    margin-right: 5px;
                                }
                            }

                            .line {
                                text-decoration: underline;
                                color: #6b99ef;
                                cursor: pointer;
                                margin-left: auto;
                            }
                        }

                    }

                    .station {
                        display: flex;
                        flex-direction: row;
                        margin-left: 15px;
                        font-size: 16px !important;
                    }

                    .workflow-class {
                        display: flex;
                        flex-direction: column;
                        max-height: 500px;
                        overflow-y: auto;
                        margin-bottom: 5px;

                        .workflow-item-class {
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            margin-bottom: 10px;

                            span {
                                display: inline-block;
                                margin-bottom: 0px !important;

                                &:nth-child(1) {
                                    width: 300px;
                                    max-width: 300px;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                            }

                            .line {
                                text-decoration: underline;
                                color: #6b99ef;
                                cursor: pointer;
                                margin-left: 20px;
                            }
                        }

                    }

                    .workflow-all-class {
                        display: flex;
                        margin-left: auto;
                        text-decoration: underline;
                        color: #6b99ef;
                        cursor: pointer;
                    }
                }
            }
        }
    }
}

.childrenDialogClass {
    .el-dialog {
        width: 700px !important;
    }
}
</style>
