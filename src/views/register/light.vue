<template>
    <div class="config-container-ligth">
        <div class="ligth">
            <div class="ligth-img">
                <a class="title">飞拍控制器视图-光源</a>
                <div class="ligth-img-content">
                    <div class="number">
                        <span v-for="(i, index) in lightData" @click='selectLight(i, "L" + i, index)'
                            :class="{ active: activeIds == index }">{{ i }}</span>
                    </div>
                </div>
            </div>
            <div class="ligth-list">
                <a class="title">光源总览表</a>
                <div class="ligth-table">
                    <el-table ref="lightTable" :data="tableData" height="500" @row-click="handleRowClick"
                        :highlight-current-row="true" :row-class-name="tableRowClassName">
                        <el-table-column width="50">
                            <template slot-scope="scope">
                                <i class="el-icon-remove-outline" @click="handleDelete(scope.$index, scope.row)"></i>
                            </template>
                        </el-table-column>
                        <el-table-column prop="slot" label="飞拍接口">
                        </el-table-column>
                        <el-table-column prop="name" label="光源名称">
                        </el-table-column>
                        <el-table-column prop="lighting_time" label="亮起时间">
                        </el-table-column>
                        <el-table-column prop="brightness" label="亮度值">
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <div class="ligth-config">
            <div class="ligth-config-video">
                <a class="title">实时调试视图</a>
                <div class="ligth-config-img">
                    <span>请观察光源是否被点亮</span>
                    <span>!！注意 光源试运行设置亮度值过高，长时间运行可能损坏!！</span>
                </div>
                <i v-if='active' @click="run" class='el-icon-video-play'></i>
                <i v-else @click="closeWebSocket" class='iconfont icon-lbzntingzhi1'></i>
            </div>
            <div class="ligth-config-content">
                <div class="ligth-config-header">
                    <div class="title">注册光源
                        <span v-show="showNum">{{ number }}</span>
                    </div>
                    <div class="ligth-config-submit">
                        <el-button plain @click="submit">保存</el-button>
                    </div>
                </div>
                <el-form :model="formInline" :rules="rules" ref="formInline">
                    <el-form-item label="光源名称：" prop="name">
                        <el-input v-model="formInline.name" :disabled="!showNum"></el-input>
                    </el-form-item>
                    <el-form-item label="亮起时间：" prop="lighting_time">
                        <el-input v-model="formInline.lighting_time" :disabled="!showNum"></el-input>ms
                    </el-form-item>
                    <el-form-item label="亮度值：" prop="brightness">
                        <el-slider v-model="formInline.brightness" :min="1" :max="250" :marks="marks" show-input
                            @change="changeSliderValue" @input="changeSliderValue" :disabled="!showNum"></el-slider>
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <RemoveDialog :removeDialogVisible="isShowDialog" :removeData="removeMessage"></RemoveDialog>
    </div>
</template>

<script>
import { query_lights, query_light_associations, save_light, delete_light, updateLight } from "@/api/register.js";
import { WebSocketBaseUrl } from "../../utils/index";
import RemoveDialog from "./removeHardwareComponent/index.vue";
export default {
    name: 'config',
    components: {
        RemoveDialog
    },
    data() {
        return {
            lightData: [3, 6, 9, 11, 14, 17, 20, 23, 26, 28, 31, 2, 5, 8, 13, 16, 19, 22, 25, 30, 1, 4, 7, 10, 12, 15, 18, 21, 24, 27, 29],
            activeIds: null,
            ctlr_id: this.$route.query.id,
            WebSocket: null,
            lightVal: 0,
            showNum: false,
            number: '',
            state: '',
            active: true,
            currentRunLightSlot: null,
            isShowDialog: false,
            removeMessage: {},
            selectedRow: null,
            marks: {
                1: '1',
                250: '250',
            },
            formInline: {
                id: null,
                name: '',
                lighting_time: '',
                brightness: 1,
            },
            rules: {
                name: [
                    { required: true, message: '请输入光源名称', trigger: 'blur' }
                ],
                lighting_time: [
                    { required: true, message: '请输入正确亮起时间', trigger: 'blur', pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/ }
                ],
                brightness: [
                    { required: true, message: '请输入亮度值', trigger: 'blur' }
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
            this.number = '';
            this.showNum = false;
            this.activeIds = null;
            this.selectedRow = null; // 重置选中行

            if (this.$refs.lightTable) {
                this.$refs.lightTable.setCurrentRow(null);
            }

            if (this.$refs.formInline) {
                this.$refs.formInline.resetFields();
            }

            let parma = { ctlr_id: this.ctlr_id }
            query_lights(parma).then((res) => {
                if (res.length > 0) {
                    this.tableData = res
                } else {
                    this.tableData = [];
                }
            })
        },
        //选中
        selectLight(num, slot, index) {
            if (this.currentRunLightSlot && slot !== this.currentRunLightSlot) {
                this.closeWebSocket();
            }
            this.activeIds = index;
            this.number = num;
            this.showNum = true;

            // 查找当前选择的光源
            const currentLightInfo = this.tableData.filter(item => item.slot === slot);

            // 如果没有找到对应的光源信息，先清空表格选中状态
            if (currentLightInfo.length === 0) {
                // 清空表格选中样式
                this.selectedRow = null;
                if (this.$refs.lightTable) {
                    this.$refs.lightTable.setCurrentRow(null);
                }

                // 初始化表单
                this.formInline = {
                    id: null,
                    name: '',
                    lighting_time: '',
                    brightness: 1
                };
                return;
            }

            // 检查当前是否有选中的行，且与要选择的光源不同
            if (this.selectedRow && this.selectedRow.slot !== slot) {
                // 清空之前的选中状态，设置新的选中状态
                this.selectedRow = null;
                // 先清除表格当前行高亮
                if (this.$refs.lightTable) {
                    this.$refs.lightTable.setCurrentRow(null);
                }

                // 在下一帧设置新的选中行
                this.$nextTick(() => {
                    this.selectedRow = currentLightInfo[0];
                    if (this.$refs.lightTable) {
                        this.$refs.lightTable.setCurrentRow(currentLightInfo[0]);
                    }
                });
            } else {
                // 直接设置选中状态
                this.selectedRow = currentLightInfo[0];
                if (this.$refs.lightTable) {
                    this.$refs.lightTable.setCurrentRow(currentLightInfo[0]);
                }
            }

            // 设置表单数据
            this.formInline = { ...currentLightInfo[0] };
        },
        // 表格行点击事件
        handleRowClick(row, column, event) {
            // 从slot中提取光源编号
            const lightNumber = parseInt(row.slot.replace('L', ''));
            // 找到对应的索引
            const index = this.lightData.findIndex(item => item === lightNumber);

            if (index !== -1) {
                // 直接调用selectLight方法，不再重复设置selectedRow
                this.selectLight(lightNumber, row.slot, index);
            }
        },
        // 表格行类名方法
        tableRowClassName({ row, rowIndex }) {
            if (this.selectedRow && row.id === this.selectedRow.id) {
                return 'selected-row';
            }
            return '';
        },
        //删除
        async handleDelete(index, row) {
            let parma = { id: row.id };
            //检查是否可删
            const data = await query_light_associations(parma);
            if (!data.station && !data.offset) {
                this.$confirm('确定要删除此光源?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    delete_light(parma).then(() => {
                        this.$message.success('光源删除成功！')
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
                    this.removeMessage.removeType = 'Light';
                });
                return
            }
        },
        //亮度值变化
        changeSliderValue: _.debounce(function (value) {
            if (!this.active) {
                updateLight({ brightness: this.formInline.brightness }).then(res => {
                    this.$message.success('光源参数更新成功！')
                })
            }
        }, 300),
        //保存
        submit() {
            if (this.showNum) {
                let parma = { id: this.formInline.id, ctlr_id: Number(this.ctlr_id), slot: 'L' + this.number, ...this.formInline }
                this.$refs["formInline"].validate(valid => {
                    if (valid) {
                        save_light(parma).then(() => {
                            this.number = '';
                            this.showNum = false;
                            this.activeIds = null;
                            this.selectedRow = null; // 重置选中行

                            if (this.$refs.lightTable) {
                                this.$refs.lightTable.setCurrentRow(null);
                            }

                            this.initData();
                            this.$message.success('保存成功！');
                            this.$refs["formInline"].resetFields();
                        })
                    } else {
                        return false;
                    }
                });
            } else {
                this.$message.warning('请选择光源！')
                return
            }
        },
        //运行
        run() {
            if (this.showNum) {
                this.$refs["formInline"].validate(valid => {
                    if (valid) {
                        //试运行光源 
                        this.currentRunLightSlot = 'L' + this.number;
                        let that = this
                        let addr = `${WebSocketBaseUrl}/hardware/trial_running_light?ctlr_id=` + this.ctlr_id + `&slot=` + 'L' + this.number + `&brightness=` + this.formInline.brightness;
                        this.WebSocket = new WebSocket(addr);
                        // 连接成功打开时的处理
                        this.WebSocket.onopen = function (event) {
                            that.active = false
                            that.$message.success('光源试运行成功！')
                        };
                        this.WebSocket.onerror = (event) => {
                            this.$message.warning("WebSocket 连接失败!");
                        };
                    } else {
                        return false;
                    }
                });
            } else {
                this.$message.warning('请选择光源！')
                return
            }
        },
        closeWebSocket() {
            if (this.WebSocket && !this.active) {
                this.WebSocket.close();
                this.active = true;
                this.$message.success('光源试运行已关闭!');
                this.currentRunLightSlot = null;
            }
        }
    },
    beforeDestroy() {
        this.closeWebSocket();
    }
}
</script>

<style lang="scss">
.config-container-ligth {
    height: calc(100vh - 90px);
    padding: 0px 0px 0px 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .ligth {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .ligth-img {
            flex: 1;

            .ligth-img-content {
                width: 560px;
                height: 420px;
                background: url(../../assets/imgs/bitmap.png) no-repeat center;
                background-size: 100%;
                margin: 10px auto;
                position: relative;

                .number {
                    width: 395px;
                    height: 100px;
                    position: absolute;
                    top: 168px;
                    left: 33px;
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    row-gap: 35px;
                    column-gap: 1px;
                    cursor: pointer;
                }

                span {
                    display: inline-block;
                    width: 35px;
                    height: 35px;
                    line-height: 35px;
                    border-radius: 50%;
                    text-align: center;
                    font-weight: bold;
                    color: #fff;
                    background: #81B337;
                    cursor: pointer;
                    font-size: 18px;

                    &.active {
                        display: inline-block;
                        width: 35px;
                        height: 35px;
                        line-height: 35px;
                        border-radius: 50%;
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

        .ligth-list {
            flex: 1;
            display: flex;
            flex-direction: column;

            .ligth-table {
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
                        font-size: 12px !important;
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

    .ligth-config {
        height: 100vh;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 10px 20px;
        background: #ffffff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #87a848;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .ligth-config-video {
            display: flex;
            flex-direction: column;
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
            margin-bottom: 20px;

            .ligth-config-img {
                height: 380px;
                margin-bottom: 10px;
                display: flex;
                flex-direction: column;
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

        .ligth-config-content {
            min-height: calc(100vh - 660px);
            max-height: calc(100vh - 660px);
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .ligth-config-header {
                display: flex;
                flex-direction: row;

                .ligth-config-submit {
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
                flex-direction: row;
                flex-wrap: wrap;
                margin-top: 10px;

                .el-form-item {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    margin-right: 20px;

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

                            .el-slider__bar {
                                background-color: #87a848 !important;
                            }

                            .el-slider__button-wrapper {
                                .el-slider__button {
                                    border: 2px solid #779340 !important;
                                }
                            }
                        }

                        .el-slider__input {
                            width: 180px !important;

                            .el-input-number__decrease {
                                border-radius: 10px 0 0 10px;
                                left: 2px !important;
                            }

                            .el-input-number__increase {
                                border-radius: 0 10px 10px 0;
                            }
                        }

                        .el-input-number--small {
                            line-height: 34px !important;
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
