<template>

    <div class="camera-box" v-loading="loading">
        <el-form :model="workflow" :rules="rules" ref="workflowForm" style="flex:1;" label-position="right"
            label-width="0.53rem" label-w label-suffix="：">
            <div class="box-header">
                <el-row type="flex" align="middle">
                    <el-col :span="4">
                        <div class="label">相机配置</div>
                    </el-col>
                    <el-col :span="19">
                        <el-form-item label="" label-width="0" prop="camera_id" class="items">
                            <el-select v-model="workflow.camera_id" placeholder="请选择" @change="cameraCurrentValue"
                                v-loading="cameraLoading">
                                <el-option v-for="item in cameraList" :key="item.id" :label="item._customName"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
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

                <el-row :gutter="20" v-if="cameraType == 'Camera'">
                    <el-col :span="12">
                        <el-form-item label="飞拍接口" class="items">
                            <div class="val" v-if="cameraInfo.controller_id">{{ cameraInfo.controller_id }}号飞拍{{
                                cameraInfo.slot }}号接口</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="相机IP" class="items">
                            <div class="val">{{ cameraInfo.ip }}</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="相机名称" class="items">
                            <div class="val">{{ cameraInfo.name }}</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="取图模式" class="items">
                            <div class="val">连续</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="相机增益" prop="gain" class="items">
                            <el-input-number v-model="workflow.gain" :precision="2" :min="0.01"
                                controls-position="right"></el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="曝光时间" prop="exposure_time" class="items">
                            <el-input-number v-model="workflow.exposure_time" :precision="2" :min="0.01"
                                controls-position="right"></el-input-number>
                            ms
                        </el-form-item>
                    </el-col>
                </el-row>
                <template v-if="cameraType == 'Station'">
                    <el-form-item v-for="v in workflow.lights" :key="v.id" :label="v.name">
                        <el-col :span="14">
                            <el-slider v-model="v.brightness" :min="1" :max="250" :marks="marks"></el-slider>
                        </el-col>
                        <el-col :span="1">&nbsp;</el-col>
                        <el-col :span="6">
                            <el-input-number v-model="v.brightness" :min="1" :max="250" controls-position="right"
                                style="width: 80%;"></el-input-number>
                        </el-col>
                    </el-form-item>
                </template>

            </div>
        </el-form>

        <!-- <div class="box-foot">
            <div class="comBtn" @click="submitForm()">确认</div>
        </div> -->
    </div>
</template>
<script>
import { cameras } from '@/api/workflowConfig.js'
export default {
    name: 'cameraMonitorConfig',
    components: {},
    data() {
        return {
            loading: true,
            cameraLoading: false,
            cameraList: [],
            cameraInfo: {},
            workflow: {},
            camerIds: [],
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
                ],
                exposure_time: [
                    { required: true, message: '请输入曝光时间', trigger: 'blur' },
                ]
            }
        }
    },
    watch: {

    },
    created() {

    },
    computed: {

    },
    methods: {
        init(workflow, workflowAll = []) {
            console.log(7878);
            this.loading = true;
            this.workflow = workflow;
            this.cameraList = [];
            this.camerIds = workflowAll.map(v => v.camera_id);
            this.getCamerasList();
        },
        getCamerasList() {
            this.loading = false;
            this.cameraLoading = true;
            this.workflow['camera_type'] = 'Camera';
            cameras().then(res => {
                let data = res || [];
                if (data.length) {
                    data.forEach((v, k) => {
                        res[k]['_customName'] = (v['light'] || []).length > 0 ? `${v.name}(${v['controller_id']}号飞拍)` : `${v.name}(${v['controller_id']}号飞拍${v.slot}号接口)`
                    });
                    if (this.workflow['camera_id']) {
                        let index = this.camerIds.indexOf(this.workflow['camera_id']);
                        if (index > -1) {
                            this.camerIds.splice(index, 1);
                        }
                    }

                    let _data = [];
                    for (let i in data) {
                        if (!this.camerIds.includes(data[i].id)) {
                            _data.push(JSON.parse(JSON.stringify(data[i])))
                        }
                    }
                    this.cameraList = _data;
                    if (!this.workflow['camera_id'] && _data.length > 0) {
                        this.workflow['camera_id'] = _data[0].id;
                        this.$nextTick(() => {
                            this.cameraCurrentValue(this.workflow['camera_id'])
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
            if (!this.workflow['camera_id']) {
                this.cameraInfo = {};
                return false;
            }
            this.cameraInfo = this.cameraList.find(v => v.id == this.workflow['camera_id']) || {};
            let light = JSON.parse(JSON.stringify(this.workflow['lights'])) || [];
            this.workflow['camera_type'] = light.length > 0 ? 'Station' : 'Camera';
            this.workflow['gain'] = this.workflow['gain'] || 0;
            this.workflow['exposure_time'] = this.workflow['exposure_time'] || 0;
            this.cameraType = 'Camera';
            this.workflow['_camera'] = JSON.parse(JSON.stringify(this.workflow['camera'] || this.workflow['_camera']));
            let cameraInfolight = this.cameraInfo['light'] || [];
            light.forEach((v, k) => {
                let info = cameraInfolight.find(lv => lv.id == v.light_id);
                if (info) {
                    light[k]['name'] = info['name'];
                    light[k]['id'] = info['id'];
                }
            })
            this.workflow['lights'] = light;
        },
        cameraCurrentValue(val) {
            if (this.cameraList.length == 0) return false;
            this.cameraInfo = this.cameraList.find(v => v.id == val) || {};
            let light = this.cameraInfo['light'] || [];
            //相机类型 Camera(相机) Station(工位)
            this.workflow['camera_type'] = light.length > 0 ? 'Station' : 'Camera';
            this.workflow['gain'] = this.cameraInfo['gain'] || 0;
            this.workflow['exposure_time'] = this.cameraInfo['exposure_time'] || 0;
            this.cameraType = 'Camera'//light.length > 0 ? 'Station' : 'Camera';
            this.workflow['_camera'] = JSON.parse(JSON.stringify(this.cameraInfo));
            this.workflow['lights'] = light;
        },
        cameraOnlyForm() {
            this.workflow['gain'] = '';   //增益值
            this.workflow['exposure_time'] = '';   //曝光时间
        },
        StationForm() {
            Station
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
    }
}
</script>
<style lang="scss" scoped>
.camera-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .box-header {
        .label {
            font-size: 20px;
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

        .Station-header {
            text-align: center;
            margin-bottom: 21px;

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
    }

    .box-foot {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

}
</style>