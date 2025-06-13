<template>
    <div class="config-container-electric">
        <div class="electric">
            <div class="electric-img">
                <a class="title">飞拍控制器视图-电机</a>
                <div class="electric-img-content">
                    <div class="number">
                        <span v-for="(i, index) in electData" @click='selectCamera(i, "M" + i, index)'
                            :class="{ active: activeIds == index }">{{ i }}</span>
                    </div>
                </div>
            </div>
            <div class="electric-list">
                <a class="title">电机总览表</a>
                <div class="electric-table">
                    <el-table ref="electricTable" :data="tableData" height="500" @row-click="handleRowClick"
                        :highlight-current-row="true" :row-class-name="tableRowClassName">
                        <el-table-column width="50">
                            <template slot-scope="scope">
                                <i class="el-icon-remove-outline" @click="handleDelete(scope.$index, scope.row)"></i>
                            </template>
                        </el-table-column>
                        <el-table-column prop="slot" label="飞拍接口">
                        </el-table-column>
                        <el-table-column prop="name" label="电机名称">
                        </el-table-column>
                        <el-table-column prop="speed" label="速度">
                        </el-table-column>
                        <el-table-column prop="acceleration" label="加速度">
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <div class="electric-config">
            <div class="electric-config-video">
                <a class="title">硬件连接状态</a>
                <div class="electric-config-img">
                    <span class="no">请观察电机是否顺畅有卡顿</span>
                </div>
                <i v-if='active' @click="run" class='el-icon-video-play'></i>
                <i v-else @click="closeWebSocket" class='iconfont icon-lbzntingzhi1'></i>
            </div>
            <div class="electric-config-content">
                <div class="electric-config-header">
                    <div class="title">注册电机
                        <span v-show="showNum">{{ number }}</span>
                    </div>
                    <div class="electric-config-submit">
                        <el-button plain @click="submit">保存</el-button>
                    </div>
                </div>
                <el-form :model="formInline" :rules="rules" ref="formInline">
                    <el-form-item label="电机名称：" prop="name">
                        <el-input v-model="formInline.name" :disabled="!showNum"></el-input>
                    </el-form-item>
                    <el-form-item label="速度：" prop="speed">
                        <el-input-number size="medium" v-model="formInline.speed" @input="handleInput"
                            @change="handleInput" :disabled="!showNum"></el-input-number>Hz
                    </el-form-item>
                    <el-form-item label="加速度：" prop="acceleration">
                        <el-input-number size="medium" v-model="formInline.acceleration" @input="handleInput"
                            @change="handleInput" :disabled="!showNum"></el-input-number>ms
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import { query_motors, save_motor, delete_motor, updateMotor } from "@/api/register.js";
import { WebSocketBaseUrl } from "../../utils/index";
export default {
    name: 'config',
    data() {
        return {
            electData: [6, 5, 4, 3, 2, 1],
            activeIds: null,
            ctlr_id: this.$route.query.id,
            lightVal: 0,
            showNum: false,
            number: '',
            state: '',
            active: true,
            currentRunElectricSlot: null,
            selectedRow: null,
            formInline: {
                id: null,
                name: '',
                speed: '',
                acceleration: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入电机名称', trigger: 'blur' }
                ],
                speed: [
                    { required: true, message: '请输入正确速度', trigger: 'blur', pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/ }
                ],
                acceleration: [
                    { required: true, message: '请输入正确加速度', trigger: 'blur', pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/ }
                ]
            },
            tableData: [],
        }
    },
    mounted() {
        this.initData()
    },
    methods: {
        //初始化
        initData() {
            // 重置选中状态
            this.selectedRow = null;
            this.activeIds = null;
            this.number = '';
            this.showNum = false;

            // 清除表格高亮
            if (this.$refs.electricTable) {
                this.$refs.electricTable.setCurrentRow(null);
            }

            // 获取数据
            let parma = { ctlr_id: this.ctlr_id };
            query_motors(parma).then((res) => {
                if (res.length > 0) {
                    this.tableData = res;
                } else {
                    this.tableData = [];
                }
            })
        },
        //选中
        selectCamera(num, slot, index) {
            if (this.currentRunElectricSlot && slot !== this.currentRunElectricSlot) {
                this.closeWebSocket();
            }
            this.activeIds = index;
            this.number = num;
            this.showNum = true;

            // 清空表单初始值
            this.formInline = {
                id: null,
                name: '',
                speed: '',
                acceleration: ''
            };

            // 查找当前选择的电机
            const currentMotorInfo = this.tableData.find(item => item.slot === slot);

            // 如果找到了对应的电机信息，更新表单和表格选中状态
            if (currentMotorInfo) {
                // 更新表单数据
                this.formInline = { ...currentMotorInfo };

                // 更新表格选中状态
                this.selectedRow = currentMotorInfo;

                // 确保表格中的行被选中
                this.$nextTick(() => {
                    if (this.$refs.electricTable) {
                        this.$refs.electricTable.setCurrentRow(currentMotorInfo);
                    }
                });
            } else {
                // 如果没有找到对应的电机信息，清空表格选中状态
                this.selectedRow = null;
                if (this.$refs.electricTable) {
                    this.$refs.electricTable.setCurrentRow(null);
                }
            }
        },
        //速度变化
        handleInput: _.debounce(function (value) {
            if (!this.active) {
                updateMotor({
                    "speed": Number(this.formInline.speed),
                    "acceleration": this.formInline.acceleration
                }).then(res => {
                    this.$message.success('电机参数更新成功！')
                })
            }
        }, 300),
        //删除
        async handleDelete(index, row) {
            let parma = { id: row.id };
            if (parma) {
                if (row.slot == "M1") {
                    this.$message.warning('主电机不能删除！')
                    return;
                } else {
                    this.$confirm('确定要删除此电机?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        delete_motor(parma).then(() => {
                            this.$message.success('电机删除成功！');
                            this.tableData.splice(index, 1);
                        })
                    });
                }
            }
        },
        //保存
        submit() {
            if (this.showNum) {
                let parma = { id: this.formInline.id, ctlr_id: Number(this.ctlr_id), slot: 'M' + this.number, name: this.formInline.name, speed: Number(this.formInline.speed), acceleration: Number(this.formInline.acceleration) }
                this.$refs["formInline"].validate(valid => {
                    if (valid) {
                        save_motor(parma).then(() => {
                            this.number = ''
                            this.showNum = false
                            this.initData()
                            this.$message.success('保存成功！')
                            this.$refs["formInline"].resetFields();
                            this.activeIds = null;
                        })
                    } else {
                        return false;
                    }
                });
            } else {
                this.$message.warning('请选择电机！')
                return
            }
        },
        //运行
        run() {
            if (this.showNum) {
                this.$refs["formInline"].validate(valid => {
                    if (valid) {
                        //试运行电机
                        this.currentRunElectricSlot = 'M' + this.number;
                        let that = this
                        let addr = `${WebSocketBaseUrl}/hardware/trial_running_motor?ctlr_id=` + this.ctlr_id + `&slot=` + 'M' + this.number + `&speed=` + this.formInline.speed + `&acceleration=` + this.formInline.acceleration;
                        this.WebSocket = new WebSocket(addr);
                        // 连接成功打开时的处理
                        this.WebSocket.onopen = function (event) {
                            that.active = false
                            that.$message.success('电机试运行成功！')
                        };
                        this.WebSocket.onerror = (event) => {
                            this.$message.warning("WebSocket 连接失败!");
                        };
                    } else {
                        return false;
                    }
                });
            } else {
                this.$message.warning('请选择电机！')
                return
            }
        },
        closeWebSocket() {
            if (this.WebSocket && !this.active) {
                this.WebSocket.close();
                this.active = true
                this.$message.success('电机试运行已关闭!');
                this.currentRunElectricSlot = null;
            }
        },
        handleRowClick(row) {
            // 更新选中行
            this.selectedRow = row;

            // 从slot中提取电机编号
            const motorNumber = parseInt(row.slot.replace('M', ''));
            // 找到对应的索引
            const index = this.electData.findIndex(item => item === motorNumber);

            if (index !== -1) {
                // 手动设置表格当前行
                this.$nextTick(() => {
                    if (this.$refs.electricTable) {
                        this.$refs.electricTable.setCurrentRow(row);
                    }
                });

                // 调用选择电机方法，同步左侧视图
                this.selectCamera(motorNumber, row.slot, index);
            }
        },
        tableRowClassName({ row, rowIndex }) {
            if (this.selectedRow && row.id === this.selectedRow.id) {
                return 'selected-row';
            }
            return '';
        }
    },
    beforeDestroy() {
        this.closeWebSocket();
    }
}
</script>

<style lang="scss">
.config-container-electric {
    height: calc(100vh - 90px);
    padding: 0px 0px 0px 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .electric {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .electric-img {
            flex: 1;

            .electric-img-content {
                width: 560px;
                height: 420px;
                background: url(../../assets/imgs/bitmap.png) no-repeat center;
                background-size: 100%;
                margin: 10px auto;
                position: relative;

                .number {
                    position: absolute;
                    bottom: 40px;
                    right: 10px;
                    width: 120px;
                    height: 100px;
                    display: flex;
                    flex-wrap: wrap;
                    row-gap: 1px;
                    column-gap: 13px;
                    cursor: pointer;
                }

                span {
                    display: inline-block;
                    width: 26px;
                    height: 45px;
                    line-height: 45px;
                    text-align: center;
                    font-weight: bold;
                    color: #fff;
                    background: #8cb24b;
                    cursor: pointer;


                    &.active {
                        display: inline-block;
                        width: 26px;
                        height: 45px;
                        line-height: 45px;
                        text-align: center;
                        font-weight: bold;
                        color: #fff;
                        background: #81B337;
                        box-shadow: 0px 2px 9px 6px rgba(76, 121, 5, 1);
                        cursor: pointer;
                    }

                    &:nth-child(15),
                    &:nth-child(20) {
                        margin-left: 35px;
                    }
                }
            }
        }

        .electric-list {
            flex: 1;
            display: flex;
            flex-direction: column;

            .electric-table {
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

    .electric-config {
        height: 100vh;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 10px 20px;
        background: #ffffff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #87a848;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .electric-config-video {
            display: flex;
            flex-direction: column;
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
            margin-bottom: 20px;

            .electric-config-img {
                height: 380px;
                margin-bottom: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #FF0000;
                font-size: 18px;
            }

            i {
                margin-left: auto;
                font-size: 24px;
            }
        }

        .electric-config-content {
            min-height: calc(100vh - 660px);
            max-height: calc(100vh - 660px);
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .electric-config-header {
                display: flex;
                flex-direction: row;

                .electric-config-submit {
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


            .el-form {
                display: flex;
                flex-direction: column;
                margin-top: 10px;

                .el-form-item {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    margin-bottom: 25px !important;

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

                        .el-slider__runway {
                            margin-right: 250px !important;
                            width: 230px !important;
                        }

                        .el-slider__input {
                            width: 180px !important;

                            .el-input-number__decrease {
                                border-radius: 10px 0 0 10px;
                            }

                            .el-input-number__increase {
                                border-radius: 0 10px 10px 0;
                            }
                        }

                        .el-input-number--small {
                            line-height: 38px !important;
                        }

                        .el-input-number--medium {
                            width: 180px !important;
                            line-height: 34px !important;

                            .el-input-number__decrease {
                                border-radius: 10px 0 0 10px;
                                left: 2px !important;
                            }

                            .el-input-number__increase {
                                border-radius: 0 10px 10px 0;
                            }
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
