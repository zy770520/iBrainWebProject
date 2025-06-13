<template>
    <div class="camera-box" v-loading="loading" :class="{ disabled: isLocked }">
        <el-form :model="workflow" :rules="rules" ref="workflowForm" style="flex:1" label-width=".65rem"
            label-position="left" label-suffix="：">
            <div class="box-header">
                <el-row type="flex" align="middle">
                    <el-col :span="4">
                        <div class="label">相机配置</div>
                    </el-col>
                    <el-col :span="19">
                        <el-form-item label="" label-width="0" prop="camera_id" class="items">
                            <el-select v-model="setCameraInfo._customName" placeholder="请选择"
                                @change="cameraCurrentValue" v-loading="cameraLoading" :disabled="isLocked"
                                @visible-change="handleSelectVisibleChange">
                                <el-option v-for="item in cameraList" :key="JSON.stringify(item)"
                                    :label="item._customName" :value="JSON.stringify(item)">
                                </el-option>
                            </el-select>
                            <span v-if="selectVisible && currentConfigType == 'Quality'"
                                class="select-tip">仅支持已配置触发距离的相机/工位</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="1">
                        <i :class="['lock-icon', isLocked ? 'el-icon-lock' : 'el-icon-unlock']" @click="toggleLock"></i>
                    </el-col>
                </el-row>
            </div>
            <div class="box-body">
                <div class="Station-header" v-if="workflow.camera_type == 'Station'">
                    <div class="buts">
                        <div class="but-item" :class="{ active: cameraType == 'Camera' }"
                            @click="cameraType = 'Camera'">相机
                        </div>
                        <div class="but-item" :class="{ active: cameraType == 'Station' }"
                            @click="cameraType = 'Station'">光源</div>
                    </div>
                </div>
                <el-row v-if="cameraType == 'Camera'">
                    <el-col :span="12">
                        <el-form-item label="相机名称" class="items">
                            <div class="val">{{ cameraInfo.name }}</div>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="相机增益" prop="gain" class="items">
                            <el-input-number size="medium" v-model="workflow.gain" @input="handleInput"
                                @change="handleInput" :min="1" :max="16" :disabled="isLocked"></el-input-number>dB
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="相机IP" class="items">
                            <div class="val">{{ cameraInfo.ip }}</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="曝光时间" prop="exposure_time" class="items">
                            <el-input-number size="medium" v-model="workflow.exposure_time" @input="handleInput"
                                @change="handleInput" :min="0.01" :disabled="isLocked"></el-input-number>ms
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="飞拍接口" class="items">
                            <div class="val" v-if="cameraInfo.controller_id">{{ cameraInfo.controller_id }}号飞拍{{
                                cameraInfo.slot }}号接口</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="currentConfigType == 'Quality'">
                        <el-form-item label="个性化触发位置" class="items">
                            <el-switch v-model="isCustomOffset" @change="handleInput" :disabled="isLocked"></el-switch>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="currentConfigType == 'Quality'">
                        <el-form-item label="触发系统" class="items">
                            <div class="val" v-if="cameraInfo.controller_id">{{ cameraInfo.controller_id }}号飞拍触发系统</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="currentConfigType == 'Quality' && isCustomOffset">
                        <el-form-item label="触发距离" prop="offset" class="items">
                            <el-input-number size="medium" v-model="workflow.offset" @input="handleOffsetInput"
                                @change="handleOffsetInput" :disabled="isLocked" :min="10"
                                :max="2500"></el-input-number>mm
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="workflow.rect">
                        <el-form-item label="合规尺寸" class="items size-input">
                            长:<el-input v-model="workflow.rect.width" :min="0" @input="handleRectWidthInput"
                                :disabled="isLocked"></el-input>
                            像素
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="取图模式" class="items">
                            <div class="val" v-if="currentConfigType == 'Quality'">等待触发</div>
                            <div class="val" v-else>连续</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="workflow.rect">
                        <el-form-item label="" class="items size-input">
                            宽:<el-input v-model="workflow.rect.height" @input="handleRectHeightInput" :min="0"
                                :disabled="isLocked"></el-input>
                            像素
                        </el-form-item>
                    </el-col>
                </el-row>
                <template v-if="cameraType == 'Station'">
                    <el-form-item v-for="v in workflow.lights" :key="v.id" :label="v.name">
                        <el-slider class="slider-class" v-model="v.brightness" :min="1" :max="250" :marks="marks"
                            :disabled="isLocked" show-input @change="handleInput" @input="handleInput"></el-slider>
                    </el-form-item>
                </template>
            </div>
        </el-form>
        <!-- <div class="box-foot">
            <el-button class="comBtn" @click="submitForm()" :disabled="isLocked" :class="{ 'is-disabled': isLocked }">确认
            </el-button>
        </div> -->
    </div>
</template>
<script>
import { cameras, queryDeviceOffset } from '@/api/workflowConfig.js'
import { updateCamera, updateStation, updateOffset } from "@/api/register.js";
import _, { min } from 'lodash';
export default {
    name: 'cameraExecutorConfig',
    components: {},
    data() {
        return {
            workflowAll: [],
            cameraLoading: true,
            loading: true,
            cameraList: [],
            cameraInfo: {},
            workflow: {},
            currentConfigType: '',
            setCameraInfo: {
                _customName: '',
            },
            marks: {
                1: '1',
                250: '250',
            },
            cameraType: 'Camera',
            rules: {
                camera_id: [
                    { required: true, message: '请选择相机', trigger: 'blur' }
                ],
                gain: [
                    { required: true, message: '请输入相机增益', trigger: 'blur' },
                    { type: 'number', message: '相机增益必须为数字', trigger: 'blur' },
                    {
                        validator: (rule, value, callback) => {
                            if (value === null || value === undefined || value === '') {
                                callback(new Error('请输入相机增益'));
                            } else if (value < 0) {
                                callback(new Error('相机增益不能小于0'));
                            } else {
                                callback();
                            }
                        }, trigger: 'blur'
                    }
                ],
                exposure_time: [
                    { required: true, message: '请输入曝光时间', trigger: 'blur' },
                    { type: 'number', message: '曝光时间必须为数字', trigger: 'blur' },
                    {
                        validator: (rule, value, callback) => {
                            if (value === null || value === undefined || value === '') {
                                callback(new Error('请输入曝光时间'));
                            } else if (value < 0) {
                                callback(new Error('曝光时间不能小于0'));
                            } else {
                                callback();
                            }
                        }, trigger: 'blur'
                    }
                ],
                offset: [
                    { required: true, message: '请输入触发距离', trigger: 'blur' },
                    { type: 'number', message: '触发距离必须为数字', trigger: 'blur' },
                ]
            },
            isLocked: true,
            selectVisible: false,
        }
    },
    props: {
        configType: {
            type: String,
            default: () => '',
        },
    },
    watch: {
        configType: {
            handler(value) {
                this.currentConfigType = value;
            },
            deep: true,
            immediate: true
        },
    },
    created() {

    },
    computed: {
        isCustomOffset: {
            get() {
                return this.workflow.offset !== null &&
                    this.workflow.offset !== undefined &&
                    this.workflow.offset !== 0 &&
                    this.workflow.offset !== '';
            },
            set(value) {
                if (value) {
                    this.queryDeviceOffset().then(offset => {
                        this.workflow.offset = offset;
                        this.workflow['offset'] = offset;
                    });
                } else {
                    this.workflow.offset = null;
                }
            }
        }
    },
    methods: {
        init(workflow, workflowAll = []) {
            console.log('初始化相机');
            console.log("🚀 ~ init ~ workflow:", workflow)
            this.isLocked = true;
            this.loading = true;
            this.workflow = workflow;
            this.cameraList = [];
            // this.camerIds = workflowAll.map(v => v.camera_id);
            this.camerIds = workflowAll.map(v => v);
            this.getCamerasList();
        },
        getCamerasList() {
            this.loading = false;
            this.cameraLoading = true;
            cameras().then(res => {
                //质检下data中将exist_offset为false的相机过滤掉
                let data = (this.currentConfigType == 'Quality' ? res.filter(item => item.exist_offset) : res) || [];
                if (data.length) {
                    data.forEach((v, k) => {
                        res[k]['_customName'] = (v['light'] || []).length > 0 ? `${v.name}(${v['controller_id']}号飞拍)` : `${v.name}(${v['controller_id']}号飞拍${v.slot}号接口)`
                    });

                    if (this.workflow) {
                        let index = this.camerIds.indexOf(this.workflow);
                        if (index > -1) {
                            this.camerIds.splice(index, 1);
                        }
                    }
                    let _data = [];
                    for (let i in data) {
                        if (!this.camerIds.some(cam => (cam.camera_id === data[i].id) &&
                            ((cam.lights.length > 0 && data[i].light.length > 0) || (cam.lights.length == 0 && data[i].light.length == 0)))) {
                            _data.push(JSON.parse(JSON.stringify(data[i])))
                        }
                    }
                    this.cameraList = _data;
                    if (!this.workflow['camera_id'] && _data.length > 0) {
                        this.workflow['camera_id'] = _data[0].id;
                        this.$nextTick(() => {
                            this.cameraCurrentValue(JSON.stringify(_data[0]));
                        })
                    } else {
                        this.defCurrentValue();
                    }
                }
            }).finally(e => {
                this.cameraLoading = false;
            })
        },
        defCurrentValue() {
            console.log(13131313);
            if (!this.workflow['camera_id']) {
                this.cameraInfo = {};
                return false;
            }
            this.cameraInfo = this.cameraList.find(v => v.id == this.workflow['camera_id'] && ((this.workflow.lights.length > 0 && v.light.length > 0) || (this.workflow.lights.length == 0 && v.light.length == 0))) || {};
            this.setCameraInfo._customName = this.cameraInfo._customName;
            let lightParams = JSON.parse(JSON.stringify(this.workflow['lights'])) || [];
            this.workflow['camera_type'] = lightParams.length > 0 ? 'Station' : 'Camera';
            this.workflow['camera_id'] = this.cameraInfo.id;
            // 保留工作流中已有的gain值，如果不存在则使用cameraInfo中的值
            console.log('🚀 ~ defCurrentValue ~ this.workflow:', this.workflow.gain)
            console.log('🚀 ~ defCurrentValue ~ this.cameraInfo:', this.cameraInfo.gain)
            this.workflow['gain'] = this.workflow['gain'] ? String(this.workflow['gain']) : String(this.cameraInfo['gain'] || 0);
            // 确保exposure_time是字符串类型
            this.workflow['exposure_time'] = String(this.workflow['exposure_time'] || 0);
            // 添加空对象作为默认值
            const cameraData = this.workflow['camera'] || this.workflow['_camera'] || {};
            this.workflow['_camera'] = JSON.parse(JSON.stringify(cameraData));
            let cameraInfolight = this.cameraInfo['light'] || [];
            lightParams.forEach((v, k) => {
                let info = cameraInfolight.find(lv => lv.id == v.light_id);
                if (info) {
                    lightParams[k]['name'] = info['name'];
                    lightParams[k]['id'] = info['id'];
                }
            })
            this.workflow['lights'] = lightParams;
            if (this.currentConfigType == 'Quality') {
                if (this.workflow.offset) {
                    this.workflow['offset'] = this.workflow.offset;
                } else {
                    this.queryDeviceOffset();
                }
            }
        },
        cameraCurrentValue(val) {
            console.log(12121212);
            let parseValue = JSON.parse(val);
            if (this.cameraList.length == 0) return false;
            this.cameraInfo = this.cameraList.find(v => v.id == parseValue.id && ((v.light.length > 0 && parseValue.light.length > 0) || (v.light.length == 0 && parseValue.light.length == 0))) || {};
            let lightParams = this.cameraInfo['light'] || [];
            //相机类型 Camera(相机) Station(工位)
            this.setCameraInfo._customName = parseValue._customName;
            this.workflow['camera_id'] = parseValue.id;
            this.workflow['camera_type'] = lightParams.length > 0 ? 'Station' : 'Camera';
            // 如果是初次选择相机或切换了相机，才使用cameraInfo中的gain值
            this.workflow['gain'] = String(this.cameraInfo['gain'] || 0);
            // 确保exposure_time是字符串类型，同样保留已有值
            this.workflow['exposure_time'] = String(this.cameraInfo['exposure_time'] || 0);
            this.workflow['_camera'] = JSON.parse(JSON.stringify(this.cameraInfo));
            this.workflow['lights'] = lightParams;
            if (this.currentConfigType == 'Quality') {
                if (this.workflow.offset) {
                    this.workflow['offset'] = this.workflow.offset;
                } else {
                    this.queryDeviceOffset();
                }
            }
        },
        //查询相机的触发距离
        queryDeviceOffset() {
            return queryDeviceOffset({
                device_id: this.workflow['camera_id'],
                device_type: this.workflow['camera_type']
            }).then(res => {
                console.log("🚀 ~ queryDeviceOffset ~ res:", res)
                return res;
            });
        },
        cameraOnlyForm() {
            this.workflow['gain'] = '';   //增益值
            this.workflow['exposure_time'] = '';   //曝光时间
        },
        //相机参数变化
        handleInput: _.debounce(function (value) {
            console.log('相机参数变化---this.isUpdateCamera', this.$store.state.applicationInfo.isUpdateCamera);
            if (this.$store.state.applicationInfo.isUpdateCamera) {
                if (this.workflow.camera_type == 'Camera') {
                    console.log('更新相机参数');
                    updateCamera({
                        "exposure_time": String(this.workflow.exposure_time),
                        "gain": String(this.workflow.gain)
                    }).then(res => {
                        this.$message.success('参数更新成功！');
                        // 通过事件总线通知相机参数已更新
                        this.$baseEventBus.$emit('cameraParamUpdated');
                    });
                } else {
                    if (this.workflow.lights && this.workflow.lights.every(light => light.slot !== '')) {
                        console.log('更新工位参数');
                        let obj = this.workflow;
                        let updateLightsPamars;
                        if (obj.camera) {
                            updateLightsPamars = obj.camera.light.map(cameraLight => {
                                let light = obj.lights.find(light => light.id === cameraLight.id);
                                return {
                                    slot: cameraLight.slot,
                                    brightness: light ? light.brightness : null
                                };
                            });
                        } else {
                            updateLightsPamars = obj.lights.map(light => {
                                return {
                                    slot: light.slot,
                                    brightness: light.brightness
                                };
                            });
                        }
                        updateStation({
                            "camera": {
                                "exposure_time": String(this.workflow.exposure_time),
                                "gain": String(this.workflow.gain)
                            },
                            "lights": updateLightsPamars
                        }).then(res => {
                            this.$message.success('参数更新成功！');
                            // 通过事件总线通知相机参数已更新
                            this.$baseEventBus.$emit('cameraParamUpdated');
                        });
                    }
                }
            }
            if (this.$store.state.applicationInfo.isUpdateOffset) {
                this.handleOffsetInput(this.workflow.offset);
            }
        }, 300),
        //触发位置参数变化-----只有在动态试运行情况下生效
        handleOffsetInput: _.debounce(function (value) {
            console.log('触发距离参数变化---this.isUpdateOffset', this.$store.state.applicationInfo.isUpdateOffset);
            if (this.$store.state.applicationInfo.isUpdateOffset && this.isCustomOffset) {
                if (this.workflow.lights && this.workflow.lights.every(light => light.slot !== '')) {
                    console.log('更新触发距离参数');
                    let obj = this.workflow;
                    let updateLightsPamars;
                    if (obj.camera) {
                        updateLightsPamars = obj.camera.light.map(cameraLight => {
                            let light = obj.lights.find(light => light.id === cameraLight.id);
                            return {
                                slot: cameraLight.slot,
                                brightness: light ? light.brightness : null
                            };
                        });
                    } else {
                        updateLightsPamars = obj.lights.map(light => {
                            return {
                                slot: light.slot,
                                brightness: light.brightness
                            };
                        });
                    }
                    updateOffset({
                        "camera": {
                            "exposure_time": String(this.workflow.exposure_time),
                            "gain": String(this.workflow.gain)
                        },
                        "lights": updateLightsPamars,
                        "offset": value ? value.toString() : null
                    }).then(res => {
                        this.$message.success('参数更新成功！');
                        // 通过事件总线通知相机参数已更新
                        this.$baseEventBus.$emit('cameraParamUpdated');
                    });
                }
            }
        }, 300),
        //设定合规尺寸-长
        handleRectWidthInput(value) {
            let numValue = Number(value);

            // 如果输入为空或非数字，设置为原始图片宽度
            if (value === '' || isNaN(numValue)) {
                if (this.workflow._camera && this.workflow._camera.originalWidth) {
                    this.workflow.rect.width = this.workflow._camera.originalWidth;
                }
            } else {
                // 检查是否超出原始图片尺寸
                if (this.workflow._camera && this.workflow._camera.originalWidth &&
                    numValue > this.workflow._camera.originalWidth) {
                    this.$message.warning(`裁剪宽度超出原图宽度，已自动调整为原图尺寸`);
                    // 超出范围，自动设置为原图宽度
                    this.workflow.rect.width = this.workflow._camera.originalWidth;
                } else {
                    this.workflow.rect.width = numValue;
                }
            }
        },
        //设定合规尺寸-宽
        handleRectHeightInput(value) {
            let numValue = Number(value);

            // 如果输入为空或非数字，设置为原始图片高度
            if (value === '' || isNaN(numValue)) {
                if (this.workflow._camera && this.workflow._camera.originalHeight) {
                    this.workflow.rect.height = this.workflow._camera.originalHeight;
                }
            } else {
                // 检查是否超出原始图片尺寸
                if (this.workflow._camera && this.workflow._camera.originalHeight &&
                    numValue > this.workflow._camera.originalHeight) {
                    this.$message.warning(`裁剪高度超出原图高度，已自动调整为原图尺寸`);
                    // 超出范围，自动设置为原图高度
                    this.workflow.rect.height = this.workflow._camera.originalHeight;
                } else {
                    this.workflow.rect.height = numValue;
                }
            }
        },
        submitForm() {
            this.$refs.workflowForm.validate((valid) => {
                if (valid) {
                    this.$emit('submitConfig', true)
                } else {
                    return false;
                }
            });
        },
        //锁定
        toggleLock() {
            this.isLocked = !this.isLocked;
        },
        //展开下拉菜单
        handleSelectVisibleChange(visible) {
            this.selectVisible = visible;
        },
    },
}
</script>

<style scoped lang="scss">
.camera-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .box-header {
        .label {
            font-size: 20px;
            font-weight: 600;
        }

        .items {
            margin-bottom: 0;
        }

        margin-bottom: 36px;
    }

    .box-body {
        flex: 1;

        .items {
            color: rgba(17, 17, 17, 1);
            font-size: 14px;
        }

        .el-form-item {
            margin-bottom: 15px !important;
        }

        .size-input {
            .el-input {
                width: 80px !important;
                margin: 0 5px;
            }

            &:nth-child(2) {
                margin-left: 85px;
                /* 调整左边距以对齐上方的输入框 */
            }
        }

        .Station-header {
            text-align: center;
            margin-bottom: 51px;

            .buts {
                border-radius: 10px 10px 10px 10px;
                background-color: rgba(237, 237, 237, 1);
                color: rgba(173, 173, 173, 1);
                box-sizing: border-box;
                padding: 5px;
                font-size: 18px;
                display: inline-flex;

                .but-item {
                    cursor: pointer;
                    border-radius: 10px 10px 10px 10px;
                    box-sizing: border-box;
                    padding: 3px 12px;

                    &.active {
                        background-color: rgba(249, 149, 0, 1);
                        color: rgba(255, 255, 255, 1);
                    }
                }
            }

        }

        .el-row {
            .el-col {
                .el-form-item {
                    .el-form-item__content {
                        .el-input-number--medium {
                            width: 150px !important;

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

                        .el-switch.is-checked .el-switch__core {
                            border-color: #000000;
                            background-color: #000000;
                        }
                    }
                }
            }
        }
    }

    .box-foot {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .comBtn {
            margin-right: 12px;
            background-color: rgba(0, 0, 0, 1);
            color: rgba(255, 255, 255, 1);
            font-size: 16px;
            text-align: center;
            padding: 8px 15px;
            border-radius: 10px;
            cursor: pointer;
        }

        .is-disabled {
            opacity: 0.8;
        }
    }

    &.disabled {

        ::v-deep .el-input,
        ::v-deep .el-select,
        ::v-deep .el-input-number,
        ::v-deep .el-slider {
            pointer-events: none;
            opacity: 0.8;
        }
    }

    .lock-icon {
        cursor: pointer;
        font-size: 24px;
        color: #666;

        &.el-icon-lock,
        &.el-icon-unlock {
            color: #989797;
        }
    }

}

.select-tip {
    margin-left: 10px;
    color: #eb8f1f;
    font-size: 16px;
    font-weight: 600;
}
</style>