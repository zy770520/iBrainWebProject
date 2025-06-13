<template>
    <div class="config-container-camera">
        <div class="camera">
            <div class="camera-img">
                <a class="title">飞拍控制器视图-相机</a>
                <div class="camera-img-content">
                    <div class="number">
                        <span v-for="(item, index) in cameraData" @click='selectCamera(item, "C" + item, index)'
                            :class="{ active: activeIds == index }">{{ item }}</span>
                    </div>
                </div>
            </div>
            <div class="camera-list">
                <a class="title">相机总览表</a>
                <div class="camera-table">
                    <el-table ref="cameraTable" :data="tableData" height="500" @row-click="handleRowClick"
                        :highlight-current-row="true" :row-class-name="tableRowClassName">
                        <el-table-column width="40">
                            <template slot-scope="scope">
                                <i class="el-icon-remove-outline" @click="handleDelete(scope.row)"></i>
                            </template>
                        </el-table-column>
                        <el-table-column prop="slot" label="飞拍接口">
                        </el-table-column>
                        <el-table-column prop="brand" label="相机品牌">
                        </el-table-column>
                        <el-table-column prop="name" label="相机名称">
                        </el-table-column>
                        <el-table-column prop="model" label="相机型号">
                        </el-table-column>
                        <el-table-column prop="ip" label="相机IP">
                        </el-table-column>
                        <el-table-column prop="gain" label="相机增益">
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <div class="camera-config">
            <div class="camera-config-video">
                <a class="title">实时调试视图</a>
                <div class="camera-config-img">
                    <img :src="imgUrl" />
                </div>
                <i v-if='active' @click="startRun" class='el-icon-video-play'></i>
                <i v-else @click="stopRun" class='iconfont icon-lbzntingzhi1'></i>
            </div>
            <div class="camera-config-content">
                <div class="camera-config-header">
                    <div class="title">注册相机
                        <span v-show="showCameraSlot">{{ cameraSlot }}</span>
                    </div>
                    <div class="camera-config-submit">
                        <el-button plain @click="submit">保存</el-button>
                    </div>
                </div>
                <el-form :model="formInline" :rules="rules" ref="formInline">
                    <el-form-item label="相机名称：" prop="name">
                        <el-input v-model="formInline.name" :disabled="!showCameraSlot"></el-input>
                    </el-form-item>
                    <el-form-item label="相机品牌：" prop="brand">
                        <el-select v-model="formInline.brand" :disabled="!showCameraSlot" style="width: 100%;">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="相机IP：" prop="ip">
                        <el-input v-model="formInline.ip" :disabled="!showCameraSlot"></el-input>
                    </el-form-item>
                    <el-form-item label="相机型号：" prop="model">
                        <el-input v-model="formInline.model" :disabled="!showCameraSlot"></el-input>
                    </el-form-item>
                    <el-form-item label="曝光时间：" prop="exposure_time">
                        <el-input-number size="medium" v-model="formInline.exposure_time" @input="handleInput"
                            @change="handleInput" :disabled="!showCameraSlot"></el-input-number>ms
                    </el-form-item>
                    <el-form-item label="相机增益：" prop="gain">
                        <el-input-number size="medium" :min="1" :max="16" v-model="formInline.gain" @input="handleInput"
                            @change="handleInput" :disabled="!showCameraSlot"></el-input-number>dB
                    </el-form-item>
                    <el-form-item label="防抖时间：" prop="anti_shake_time">
                        <el-input v-model="formInline.anti_shake_time" :disabled="!showCameraSlot"></el-input>ms
                    </el-form-item>
                    <el-form-item label="合规配置文件：">
                        <el-upload class="upload-demo" action="" :auto-upload="false" :on-change="handleFileChange"
                            :show-file-list="false" :limit="1" ref="uploadSettings">
                            <el-button size="small" type="text" :disabled="!showCameraSlot">点击上传合规配置文件</el-button>
                        </el-upload>
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <RemoveDialog :removeDialogVisible="isShowDialog" :removeData="removeMessage"></RemoveDialog>
    </div>
</template>
<script>
import { query_cameras, query_camera_associations, save_camera, delete_camera, updateCamera } from "@/api/register.js";
import { WebSocketBaseUrl, EventSourceUrl } from "../../utils/index";
import RemoveDialog from "./removeHardwareComponent/index.vue";
export default {
    name: 'config',
    components: {
        RemoveDialog
    },
    data() {
        return {
            cameraData: [1, 3, 5, 7, 9, 11, 13, 15, 2, 4, 6, 8, 10, 12, 14, 16],
            tableData: null,
            activeIds: null,
            imgUrl: null,
            ctlr_id: this.$route.query.id,
            WebSocket: null,
            showCameraSlot: false,
            cameraSlot: null,
            active: true,
            currentRunCameraIp: null,
            currentSelectCameraIp: null,
            isShowDialog: false,
            removeMessage: {},
            selectedRow: null,
            settingsFile: null, // 保存上传的文件
            formInline: {
                id: null,
                ip: null,
                ctlr_id: null,
                slot: null,
                name: null,
                brand: null,
                model: null,
                gain: null,
                exposure_time: null,
                anti_shake_time: null,
            },
            options: [{
                value: 'Hik',
                label: 'Hik'
            }],
            rules: {
                name: [
                    { required: true, message: '请输入相机名称', trigger: 'blur' }
                ],
                ip: [
                    { required: true, message: '请输入正确相机IP', trigger: 'blur', pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/ }
                ],
                exposure_time: [
                    { required: true, message: '请输入正确曝光时间', trigger: 'blur', pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/ }
                ],
                brand: [
                    { required: true, message: '请选择相机品牌', trigger: 'blur' }
                ],
                model: [
                    { required: true, message: '请输入相机型号', trigger: 'blur' }
                ],
                gain: [
                    { required: true, message: '请输入相机增益', trigger: 'blur' }
                ],
                anti_shake_time: [
                    { required: true, message: '请输入防抖时间', trigger: 'blur' }
                ]
            },
        }
    },
    mounted() {
        this.initData();
    },
    methods: {
        // 处理文件变化
        handleFileChange(file) {
            if (file.raw) {
                this.settingsFile = file.raw;
                this.$message.success(`文件 "${file.name}" 已选择，将在保存时上传`);
            } else {
                this.settingsFile = null;
                this.$message.warning('文件选择失败，请重试');
            }
        },
        //初始化
        initData() {
            this.cameraSlot = null;
            this.showCameraSlot = false;
            this.activeIds = null;
            this.selectedRow = null;
            this.settingsFile = null;
            this.$refs["formInline"].resetFields();
            // 重置上传组件
            if (this.$refs.uploadSettings) {
                this.$refs.uploadSettings.clearFiles();
            }
            let params = { ctlr_id: Number(this.ctlr_id) };
            query_cameras(params).then((res) => {
                if (res.length > 0) {
                    this.tableData = res;
                } else {
                    this.tableData = [];
                }
            })
        },
        //选中
        selectCamera(cameraNumber, cameraSlot, index, skipResetUpload = false) {
            this.activeIds = index;
            this.cameraSlot = cameraNumber;
            this.showCameraSlot = true;
            this.imgUrl = null;

            // 重置文件上传组件，除非明确指定跳过
            if (!skipResetUpload) {
                this.settingsFile = null;
                if (this.$refs.uploadSettings) {
                    this.$refs.uploadSettings.clearFiles();
                }
            }

            let currentCameraInfo = this.tableData.filter(item => item.slot === cameraSlot);

            // 如果没有找到对应的相机信息，先清空表格选中状态
            if (currentCameraInfo.length === 0) {
                // 清空表格选中样式
                this.selectedRow = null;
                if (this.$refs.cameraTable) {
                    this.$refs.cameraTable.setCurrentRow(null);
                }

                // 清空右侧表单
                for (let key in this.formInline) {
                    if (this.formInline.hasOwnProperty(key)) {
                        this.formInline[key] = null;
                    };
                };
                this.settingsFile = null;
                return;
            }

            // 如果当前正在运行的相机与选择的相机不同，先停止运行
            if (this.currentRunCameraIp && currentCameraInfo[0].ip !== this.currentRunCameraIp) {
                this.stopRun();
            }

            // 检查当前是否有选中的行，且与要选择的相机不同
            if (this.selectedRow && this.selectedRow.slot !== cameraSlot) {
                // 清空之前的选中状态，设置新的选中状态
                this.selectedRow = null;
                // 先清除表格当前行高亮
                if (this.$refs.cameraTable) {
                    this.$refs.cameraTable.setCurrentRow(null);
                }

                // 在下一帧设置新的选中行
                this.$nextTick(() => {
                    this.selectedRow = currentCameraInfo[0];
                    if (this.$refs.cameraTable) {
                        this.$refs.cameraTable.setCurrentRow(currentCameraInfo[0]);
                    }
                });
            } else {
                // 直接设置选中状态
                this.selectedRow = currentCameraInfo[0];
                if (this.$refs.cameraTable) {
                    this.$refs.cameraTable.setCurrentRow(currentCameraInfo[0]);
                }
            }

            // 设置表单数据
            this.formInline = { ...currentCameraInfo[0] };
            this.currentSelectCameraIp = currentCameraInfo[0].ip;
            this.settingsFile = null;
        },
        // 表格行点击事件
        handleRowClick(row, column, event) {
            // 更新选中行
            this.selectedRow = row;

            // 重置文件上传组件
            this.settingsFile = null;
            if (this.$refs.uploadSettings) {
                this.$refs.uploadSettings.clearFiles();
            }

            // 从slot中提取相机编号
            const cameraNumber = parseInt(row.slot.replace('C', ''));
            // 找到对应的索引
            const index = this.cameraData.findIndex(item => item === cameraNumber);

            if (index !== -1) {
                // 直接调用selectCamera方法，传入true表示跳过重置上传组件，因为已经在这里重置过了
                this.selectCamera(cameraNumber, row.slot, index, true);

                // 手动设置表格当前行
                this.$nextTick(() => {
                    this.$refs.cameraTable.setCurrentRow(row);
                });
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
        async handleDelete(row) {
            let params = { id: row.id };
            //检查是否可删
            const data = await query_camera_associations(params);
            if (!data.station && data.workflows && data.workflows.length == 0 && !data.offset) {
                this.$confirm('确定要删除此相机?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    delete_camera(params).then(() => {
                        this.$message.success('相机删除成功！');
                        this.initData();
                    })
                })
            } else {
                this.isShowDialog = false;
                this.removeMessage = {};
                this.$nextTick(() => {
                    this.isShowDialog = true;
                    this.removeMessage = data;
                    this.removeMessage.ctlrId = this.ctlr_id;
                    this.removeMessage.removeId = row.id;
                    this.removeMessage.removeType = 'Camera';
                });
                return
            }
        },
        //相机参数变化
        handleInput: _.debounce(function (value) {
            if (!this.active) {
                updateCamera({
                    "exposure_time": this.formInline.exposure_time,
                    "gain": this.formInline.gain
                }).then(res => {
                    this.$message.success('相机参数更新成功！')
                });
            }
        }, 300),
        //保存
        submit() {
            if (this.showCameraSlot) {
                let cameraIps
                let cameraOtherIps
                if (this.tableData) {
                    cameraIps = this.tableData.map(item => item.ip);
                    cameraOtherIps = this.tableData.map(item => item.ip).filter(item => item !== this.currentSelectCameraIp);
                }
                if (((cameraIps && cameraIps.includes(this.formInline.ip)) && !this.formInline.id) ||
                    ((cameraOtherIps && cameraOtherIps.includes(this.formInline.ip)) && this.formInline.id)) {
                    this.$message.warning('相机IP不可重复！')
                } else {
                    this.$refs["formInline"].validate(async valid => {
                        if (valid) {
                            try {
                                // 构建相机对象
                                const cameraObj = {
                                    ctlr_id: Number(this.ctlr_id),
                                    slot: this.formInline.id ? this.formInline.slot : 'C' + this.cameraSlot,
                                    name: this.formInline.name,
                                    brand: this.formInline.brand,
                                    model: this.formInline.model,
                                    ip: this.formInline.ip,
                                    gain: this.formInline.gain,
                                    exposure_time: this.formInline.exposure_time,
                                    anti_shake_time: this.formInline.anti_shake_time,
                                    id: this.formInline.id || null
                                };

                                // 创建FormData对象
                                const formData = new FormData();

                                // 将相机对象转为JSON字符串，添加到FormData中
                                formData.append('camera', JSON.stringify(cameraObj));

                                // 如果有上传文件，直接添加到FormData中
                                if (this.settingsFile) {
                                    formData.append('settings', this.settingsFile);
                                }

                                // 发送保存请求
                                await save_camera(formData);
                                this.$message.success('保存成功！');
                                this.initData();
                            } catch (error) {
                                console.error('保存失败:', error);
                                this.$message.warning('保存失败');
                            }
                        } else {
                            return false;
                        }
                    });
                }
            } else {
                this.$message.warning('请先选择相机！')
                return
            }
        },
        //试运行
        startRun() {
            if (this.showCameraSlot) {
                this.$refs["formInline"].validate(valid => {
                    if (valid) {
                        //试运行相机
                        this.currentRunCameraIp = this.formInline.ip;
                        let that = this;
                        let addr = `${WebSocketBaseUrl}/hardware/trial_running_camera?ip=` + this.formInline.ip + `&exposure_time=` + this.formInline.exposure_time + `&gain=` + this.formInline.gain;
                        this.WebSocket = new WebSocket(addr);
                        // 连接成功打开时的处理
                        this.WebSocket.onopen = function (event) {
                            that.active = false;
                            that.$message.success(`${that.formInline.slot}` + '相机试运行成功！');
                            that.imgUrl = `${EventSourceUrl}/view?ip=` + that.formInline.ip;
                        };
                        this.WebSocket.onerror = (event) => {
                            this.$message.warning("WebSocket 连接失败!");
                        };
                    } else {
                        return false;
                    }
                });
            } else {
                this.$message.warning('请先选择相机！')
                return
            }
        },
        //试运行停止
        stopRun() {
            if (this.WebSocket && !this.active) {
                this.WebSocket.close();
                this.active = true;
                this.$message.success(`${this.formInline.slot}` + '相机试运行已关闭!');
                this.currentRunCameraIp = null;
            }
        }
    },
    beforeDestroy() {
        this.stopRun();
    }
}
</script>

<style lang="scss">
.config-container-camera {
    height: calc(100vh - 90px);
    padding: 0px 0px 0px 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .camera {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .camera-img {
            flex: 1;

            .camera-img-content {
                width: 560px;
                height: 420px;
                background: url(../../assets/imgs/bitmap.png) no-repeat center;
                background-size: 100%;
                margin: 10px auto;
                position: relative;

                .number {
                    position: absolute;
                    top: 57px;
                    left: 30px;
                    width: 488px;
                    height: 100px;
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    row-gap: 10px;
                    column-gap: 18px;
                }

                span {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    line-height: 40px;
                    border-radius: 50%;
                    text-align: center;
                    font-weight: bold;
                    color: #fff;
                    background: #81B337;
                    cursor: pointer;
                    font-size: 18px;

                    &.active {
                        display: inline-block;
                        width: 42px;
                        height: 42px;
                        line-height: 42px;
                        border-radius: 50%;
                        text-align: center;
                        font-weight: bold;
                        color: #fff;
                        background: #81B337;
                        box-shadow: 0px 2px 9px 6px rgba(76, 121, 5, 1);
                        cursor: pointer;
                    }
                }
            }
        }

        .camera-list {
            flex: 1;
            display: flex;
            flex-direction: column;

            .camera-table {
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

    .camera-config {
        height: 100vh;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 10px 20px;
        background: #ffffff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #87a848;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .camera-config-video {
            display: flex;
            flex-direction: column;
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
            margin-bottom: 20px;

            .camera-config-img {
                height: 380px;
                margin-bottom: 10px;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
            }

            i {
                margin-left: auto;
                font-size: 24px;
            }
        }

        .camera-config-content {
            min-height: calc(100vh - 660px);
            max-height: calc(100vh - 660px);
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .camera-config-header {
                display: flex;
                flex-direction: row;

                .camera-config-submit {
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
                    min-width: 320px;
                    max-width: 320px;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    margin-right: 20px;

                    .el-form-item__label {
                        width: 110px;
                        max-width: 110px;
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

                            .el-input-number__decrease {
                                border-radius: 10px 0 0 10px;
                                left: 2px !important;
                                height: 34px;
                            }

                            .el-input-number__increase {
                                border-radius: 0 10px 10px 0;
                                height: 34px;
                            }
                        }
                    }

                    .el-upload {
                        .el-button {
                            span {
                                font-size: 14px;
                                color: #81B337;
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
