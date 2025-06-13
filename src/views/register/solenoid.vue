<template>
    <div class="config-container-solenoid">
        <div class="solenoid">
            <div class="solenoid-img">
                <a class="title">飞拍控制器视图-电磁阀</a>
                <div class="solenoid-img-content">
                    <div class="number">
                        <span v-for="(i, index) in 12" @click='selectSolenoid(i, "E" + i, index)'
                            :class="{ active: activeIds == index }">{{ i }}</span>
                    </div>
                </div>
            </div>
            <div class="solenoid-list">
                <a class="title">电磁阀总览表</a>
                <div class="solenoid-table">
                    <el-table :data="tableData" height="500" ref="solenoidTable" @row-click="handleRowClick"
                        :highlight-current-row="true" :row-class-name="tableRowClassName">
                        <el-table-column width="50">
                            <template slot-scope="scope">
                                <i class="el-icon-remove-outline" @click="handleDelete(scope.$index, scope.row)"></i>
                            </template>
                        </el-table-column>
                        <el-table-column prop="slot" label="飞拍接口">
                        </el-table-column>
                        <el-table-column prop="name" label="名称">
                        </el-table-column>
                        <el-table-column prop="executing_time" label="吹气时长">
                        </el-table-column>
                        <el-table-column label="状态">
                            <template slot-scope="scope">
                                <span>启动</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <div class="solenoid-config">
            <div class="solenoid-config-video">
                <a class="title">硬件连接状态</a>
                <div class="solenoid-config-img">
                    <span class="no">请观察电磁阀是否正常吹气</span>
                </div>
                <div class="solenoid-config-run">
                    <div class="system">
                        <el-form :model="rateForm" :rules="rule" ref="rateForm">
                            <el-form-item prop="rate" label="频率：">
                                <el-input-number size="medium" v-model="rateForm.rate" @input="handleInput"
                                    @change="handleInput" :disabled="!showNum"></el-input-number>Hz
                            </el-form-item>
                        </el-form>
                    </div>
                    <i v-if='active' @click="run" class='operateBtn el-icon-video-play'></i>
                    <i v-else @click="closeWebSocket" class='operateBtn iconfont icon-lbzntingzhi1'></i>
                </div>
            </div>
            <div class="solenoid-config-content">
                <div class="solenoid-config-header">
                    <div class="title">注册电磁阀
                        <span v-show="showNum">{{ number }}</span>
                    </div>
                    <div class="solenoid-config-submit">
                        <el-button plain @click="submit">保存</el-button>
                    </div>
                </div>
                <el-form :model="formInline" :rules="rules" ref="formInline">
                    <el-form-item label="名称：" prop="name">
                        <el-input v-model="formInline.name" :disabled="!showNum"></el-input>
                    </el-form-item>
                    <el-form-item label="吹气时长：" prop="executing_time">
                        <el-input-number size="medium" v-model="formInline.executing_time" @input="handleInput"
                            @change="handleInput" :disabled="!showNum"></el-input-number>ms
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <RemoveDialog :removeDialogVisible="isShowDialog" :removeData="removeMessage"></RemoveDialog>
    </div>
</template>

<script>
import { query_executors, save_executor, delete_executor, updatExecutor, query_executor_associations } from "@/api/register.js";
import { WebSocketBaseUrl } from "../../utils/index";
import RemoveDialog from "./removeHardwareComponent/index.vue";
export default {
    name: 'config',
    components: {
        RemoveDialog
    },
    data() {
        return {
            activeIds: null,
            ctlr_id: this.$route.query.id,
            WebSocket: null,
            lightVal: 0,
            showNum: false,
            number: '',
            state: '',
            active: true,
            currentRunSolenoid: null,
            isShowDialog: false,
            removeMessage: {},
            infolist: {
                number: 1,
                port: 2,
                version: '1.0'
            },
            formInline: {
                name: '',
                executing_time: ''
            },
            rateForm: {
                rate: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' }
                ],
                executing_time: [
                    { required: true, message: '请输入正确吹气时长', trigger: 'blur', pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/ }
                ]
            },
            rule: {
                rate: [
                    { required: true, message: '请输入正确频率', trigger: 'blur' }
                ]
            },
            headData: [{
                lable: '飞拍接口',
                prop: ''
            }, {
                lable: '名称',
                prop: 'address'
            }, {
                lable: '吹气时长',
                prop: 'address'
            }],
            tableData: [],
            selectedRow: null,
        }
    },
    mounted() {
        this.initData()
    },
    methods: {
        tableRowClassName({ row, rowIndex }) {
            if (this.selectedRow && row.slot === this.selectedRow.slot) {
                return 'selected-row';
            }
            return '';
        },
        handleRowClick(row, column, event) {
            this.selectedRow = row;
            if (row) {
                const slotNumber = row.slot.replace('E', '');
                const index = parseInt(slotNumber) - 1;

                this.selectSolenoid(parseInt(slotNumber), row.slot, index);

                this.$refs.solenoidTable.setCurrentRow(row);
            }
        },
        initData() {
            let params = { ctlr_id: this.ctlr_id }
            query_executors(params).then((res) => {
                if (res.length > 0) {
                    this.tableData = res
                }

                this.selectedRow = null;
                this.activeIds = null;
                this.number = '';
                this.showNum = false;

                if (this.$refs.solenoidTable) {
                    this.$refs.solenoidTable.setCurrentRow(null);
                }
            })
        },
        selectSolenoid(num, slot, index) {
            this.activeIds = index;
            this.number = num
            this.showNum = true
            if (this.currentRunSolenoid && slot !== this.currentRunSolenoid) {
                this.closeWebSocket();
            }
            this.formInline = {
                name: '',
                executing_time: ''
            };

            let foundSolenoid = null;
            this.tableData.forEach(item => {
                if (item.slot == slot) {
                    this.formInline = item;
                    foundSolenoid = item;
                }
            });

            this.selectedRow = foundSolenoid;
            if (this.$refs.solenoidTable) {
                this.$refs.solenoidTable.setCurrentRow(foundSolenoid);
            }
        },
        async handleDelete(index, row) {
            let params = { id: row.id };
            const data = await query_executor_associations(params);
            if (data.work_configs && data.work_configs.length == 0 && !data.offset) {
                this.$confirm('确定要删除此电磁阀?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    delete_executor(params).then(() => {
                        this.$message.success('删除成功！')
                        this.tableData.splice(index, 1);
                    })
                });
            } else {
                this.isShowDialog = false;
                this.removeMessage = {};
                this.$nextTick(() => {
                    this.isShowDialog = true;
                    this.removeMessage = data;
                    this.removeMessage.ctlrId = this.ctlr_id;
                    this.removeMessage.removeId = row.id;
                    this.removeMessage.removeType = 'Executor';
                });
                return
            }
        },
        //吹气时长变化
        handleInput: _.debounce(function (value) {
            if (!this.active) {
                updatExecutor({
                    "frequency": Number(this.rateForm.rate),
                    "executing_time": this.formInline.executing_time
                }).then(res => {
                    this.$message.success('电磁阀参数更新成功！')
                })
            }
        }, 300),
        //保存
        submit() {
            if (this.showNum) {
                let params = { id: this.formInline.id, ctlr_id: Number(this.ctlr_id), slot: 'E' + this.number, ...this.formInline }
                this.$refs["formInline"].validate(valid => {
                    if (valid) {
                        save_executor(params).then(() => {
                            this.number = ''
                            this.showNum = false
                            this.initData()
                            this.$message.success('保存成功！')
                            this.$refs["formInline"].resetFields();
                            this.activeIds = null
                        })
                    } else {
                        return false;
                    }
                });
            } else {
                this.$message.warning('请选择电磁阀！')
                return
            }
        },
        //运行
        run() {
            if (!this.showNum) {
                this.$message.warning('请选择电磁阀！')
                return
            }
            this.$refs["rateForm"].validate(valid => {
                if (valid) {
                    //试运行电磁阀
                    this.currentRunSolenoid = 'E' + this.number;
                    let that = this
                    let addr = `${WebSocketBaseUrl}/hardware/trial_running_executor?ctlr_id=` + this.ctlr_id + `&slot=` + 'E' + this.number + `&executing_time=` + this.formInline.executing_time + `&frequency=` + this.rateForm.rate;
                    this.WebSocket = new WebSocket(addr);
                    // 连接成功打开时的处理
                    this.WebSocket.onopen = function (event) {
                        that.active = false
                        that.$message.success('电磁阀试运行成功！')
                    };
                } else {
                    return false;
                }
            });
        },
        closeWebSocket() {
            if (this.WebSocket && !this.active) {
                this.WebSocket.close();
                this.active = true
                this.$message.success('电磁阀试运行已关闭!');
                this.currentRunSolenoid = null;
            }
        }
    },
    beforeDestroy() {
        this.closeWebSocket();
    }
}
</script>

<style lang="scss">
.config-container-solenoid {
    height: calc(100vh - 90px);
    padding: 0px 0px 0px 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;


    .solenoid {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .solenoid-img {
            flex: 1;

            .solenoid-img-content {
                width: 620px;
                height: 420px;
                background: url(../../assets/imgs/elemap.png) no-repeat center;
                background-size: 100%;
                margin: 10px auto;
                position: relative;

                .number {
                    position: absolute;
                    top: 355px;
                    right: 50px;
                    width: 290px;
                    height: 300px;
                    display: flex;
                    flex-wrap: wrap;
                    flex-direction: row-reverse;
                    column-gap: 5px;
                    cursor: pointer;
                }

                span {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    line-height: 12px;
                    border-radius: 50%;
                    text-align: center;
                    color: #fff;
                    background: #81B337;
                    font-size: 10px;

                    &.active {
                        display: inline-block;
                        width: 12px;
                        height: 12px;
                        line-height: 12px;
                        border-radius: 50%;
                        text-align: center;
                        color: #fff;
                        background: #81B337;
                        font-size: 10px;
                        box-shadow: 0px 2px 9px 6px rgba(76, 121, 5, 1);
                        cursor: pointer;
                    }
                }
            }
        }

        .solenoid-list {
            flex: 1;
            display: flex;
            flex-direction: column;

            .solenoid-table {
                width: 768px;
                max-width: 768px;
                min-height: calc(100vh - 660px);
                max-height: calc(100vh - 660px);
                overflow-x: auto;
                padding: 20px;
                background: #ffffff;
                border-radius: 10px;
                box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

                .el-table {
                    max-height: calc(100vh - 680px) !important;

                    .cell {
                        font-size: 14px !important;
                    }

                    .selected-row {
                        background-color: #f1f1f1;
                        color: #495165;
                        font-weight: bold;
                    }

                    /* 自定义表格行鼠标悬停样式 */
                    .el-table__body tr:hover>td {
                        background-color: #f1f1f1 !important;
                        cursor: pointer;
                    }

                    /* 确保选中行的悬停样式优先级更高 */
                    .selected-row:hover>td {
                        background-color: #f1f1f1 !important;
                        cursor: pointer;
                    }

                    .el-table__body tr.current-row>td.el-table__cell {
                        background-color: #f1f1f1 !important;
                        cursor: pointer;
                    }
                }
            }
        }

    }

    .solenoid-config {
        height: 100vh;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 10px 20px;
        background: #ffffff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #87a848;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .solenoid-config-video {
            display: flex;
            flex-direction: column;
            padding: 20px 20px 10px 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
            margin-bottom: 20px;

            .solenoid-config-img {
                height: 365px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #FF0000;
                font-size: 18px;
            }


            .solenoid-config-run {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                margin-left: auto;

                .system {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    margin-bottom: 10px;

                    .state {
                        margin-left: 15px;
                    }
                }

                .operateBtn {
                    font-size: 24px;
                }
            }


        }

        .solenoid-config-content {
            min-height: calc(100vh - 660px);
            max-height: calc(100vh - 660px);
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .solenoid-config-header {
                display: flex;
                flex-direction: row;

                .solenoid-config-submit {
                    margin-left: auto;

                    .el-button {
                        font-size: 14px;
                        font-weight: bold;
                        background: #000000;
                        color: #fff;
                        padding: 8px 15px;
                        text-align: center;
                        border-radius: 12px;
                        margin-left: auto;
                        cursor: pointer;
                    }
                }
            }



        }

        .el-form {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            margin-top: 10px;

            .el-form-item {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                margin-right: 20px;
                margin-bottom: 0px !important;

                .el-form-item__label {
                    width: 100px;
                    max-width: 100px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-align: left;
                }

                .el-form-item__content {
                    .el-select {
                        width: 180px !important;
                    }

                    .el-input {
                        width: 180px !important;
                    }

                    .el-input-number--medium {
                        width: 180px !important;
                        line-height: 36px !important;

                        .el-input-number__decrease {
                            border-radius: 10px 0 0 10px;
                            left: 2px !important;
                            height: 33px;
                        }

                        .el-input-number__increase {
                            border-radius: 0 10px 10px 0;
                            height: 33px;
                        }
                    }
                }

            }
        }
    }

    .title {
        color: #000000;
        padding: 5px;
        font-size: 18px;
        font-weight: 900;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        span {
            display: inline-block;
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            background: #81B337;
            margin-left: 10px;
            color: #fff;
            border-radius: 50%;
        }
    }
}
</style>
