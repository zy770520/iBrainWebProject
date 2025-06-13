<template>
    <div class="workflow-layout" v-loading="loading">
        <div class="toolbar">
            <div class="lock-buttons">
                <!-- :disabled="btnExecuteDisabled" -->
                <el-button class="comBtn" @click="saveWorkFlowData">保存</el-button>
            </div>
        </div>
        <div class="workflow-box">
            <div class="header">
                <div class="name-box">
                    <div v-if="!updateNameBol">
                        <el-tooltip effect="dark" :content="flowList.name" placement="top"
                            v-if="flowList.name.length > 6">
                            <div class="name">{{ flowList.name }}</div>
                        </el-tooltip>
                        <div class="name" v-else>{{ flowList.name }}</div>
                    </div>
                    <el-button v-if="!updateNameBol" type="text" icon="el-icon-edit" class="btnUpdateName"
                        @click="updateNameHead"></el-button>
                    <el-input v-if="updateNameBol" v-model="updateName" placeholder="工作配置名称" maxlength="50"
                        show-word-limit @blur="updateNameHead"></el-input>
                </div>
                <div class="type">
                    <el-select size="small" v-model="workflowType" @change="workflowTypeChange" placeholder="请选择"
                        :disabled="workflowType ? true : false">
                        <el-option v-for="item in typeOptions" :key="item.type" :label="item.label" :value="item.type">
                        </el-option>
                    </el-select>
                </div>
                <div class="batch-box">
                    <a>批次：</a>
                    <el-input v-model="flowList.batch" placeholder="工作配置批次" maxlength="50" show-word-limit
                        @blur="updateBatchHead"></el-input>
                </div>
            </div>
            <div class="body" v-if="workflowType">
                <div :class="[
                    'workflow-class',
                    workflowType !== 'Quality' ? 'workflow-monitor-class' : ''
                ]">
                    <div class="container-left">
                        <div class="start-btn">
                            <el-button round>工作流</el-button>
                        </div>
                    </div>
                    <div class="container-center">
                        <div style="display: flex; align-items: stretch;">
                            <div v-if="flowList" class="flow-box">
                                <div>
                                    <div v-for="(v, k) in flowList.comFlowList" style="display: flex;"
                                        class="flow-item">
                                        <div class="item-btns del-btn" @click="delHeader(v, k)"><i
                                                class="el-icon-remove-outline"></i></div>
                                        <div class="line"><i class="el-icon-caret-right"></i></div>
                                        <div class="item-btns selp-btn">{{ k + 1 }}</div>
                                        <!-- <div class="item-btns state-btn">
                                            <el-tooltip effect="dark" content="参数未配置完整" placement="bottom"
                                                v-if="v.state == 0">
                                                <i class="el-icon-warning"></i>
                                            </el-tooltip>
                                            <div class="normal" v-if="v.state == 1"><i class="el-icon-check"></i></div>
                                        </div> -->
                                        <div v-for="(nv, nk) in v.list" class="selp-box">
                                            <!-- :disabled="flowBtnDisabled(v, nk, k)" -->
                                            <el-button class="selp-btn"
                                                :class="{ active: activeIds == `${k}-${nk}` && !btnExecute }"
                                                @click="getFlowItem(nv, nk, k)">{{
                                                    nv.name }}</el-button>
                                            <i v-if="nk < 2" class="el-icon-d-arrow-right"></i>
                                        </div>

                                        <el-tooltip v-if="flowList.workflow[k]._camera && flowList.workflow[k]._camera.name &&
                                            flowList.workflow[k]._camera.name.length > 7" effect="dark"
                                            :content="'(' + flowList.workflow[k]._camera.name + ')'" placement="top">
                                            <a>({{ flowList.workflow[k]._camera.name }})</a>
                                        </el-tooltip>
                                        <a v-else>({{
                                            flowList.workflow[k]._camera.name
                                            }})</a>
                                        <el-switch v-model="flowList.workflow[k].enable_workflow" active-color="#1B2133"
                                            inactive-color="#E2E2E3"
                                            @change="() => handleWorkflowEnableChange(flowList.workflow[k], k)">
                                        </el-switch>
                                        <el-tooltip effect="dark" content="工作流高级参数设置" placement="top">
                                            <i class="el-icon-more" @click="moreCamera(k)"></i>
                                        </el-tooltip>
                                        <el-dialog title="工作流高级设置" :visible.sync="dialogVisible"
                                            :close-on-click-modal="false" @close="handleClose"
                                            :modal-append-to-body="false" width="600px">
                                            <div class="dialog-content">
                                                <div class="item">
                                                    <span>图片保存：</span>
                                                    <el-switch v-if="flowList.workflow[workflowIndex]"
                                                        v-model="flowList.workflow[workflowIndex].enable_save_image"
                                                        @change="handleSaveImageEnableChange">
                                                    </el-switch>
                                                </div>
                                                <template
                                                    v-if="flowList.workflow[workflowIndex] && flowList.workflow[workflowIndex].enable_save_image">
                                                    <div class="item indented-item">
                                                        <span>保存范围：</span>
                                                        <el-radio-group v-if="flowList.workflow[workflowIndex]"
                                                            v-model="flowList.workflow[workflowIndex].save_image_behaviour"
                                                            @change="handleSaveImageChange">
                                                            <el-radio :label="'SaveAll'">所有</el-radio>
                                                            <el-radio :label="'SaveQualified'"
                                                                v-if="workflowType == 'Quality'">合格</el-radio>
                                                            <el-radio :label="'SaveUnqualified'"
                                                                v-if="workflowType == 'Quality'">不合格</el-radio>
                                                            <el-radio :label="'SaveQualified'"
                                                                v-if="workflowType == 'Monitor'">无目标</el-radio>
                                                            <el-radio :label="'SaveUnqualified'"
                                                                v-if="workflowType == 'Monitor'">有目标</el-radio>
                                                            <el-radio :label="'SaveKeyFrame'"
                                                                v-if="workflowType == 'Monitor'">关键帧</el-radio>
                                                        </el-radio-group>
                                                    </div>

                                                    <div class="item indented-item">
                                                        <span>保存类型：</span>
                                                        <el-radio-group v-if="flowList.workflow[workflowIndex]"
                                                            v-model="flowList.workflow[workflowIndex].save_image_type"
                                                            @change="handleSaveImageTypeChange">
                                                            <el-radio :label="'Original'">原图</el-radio>
                                                            <el-radio :label="'Marked'">标记图</el-radio>
                                                        </el-radio-group>
                                                    </div>
                                                    <div class="item mark-options"
                                                        v-if="flowList.workflow[workflowIndex] && flowList.workflow[workflowIndex].save_image_type === 'Marked'">
                                                        <div class="checkbox-container">
                                                            <el-checkbox
                                                                v-model="flowList.workflow[workflowIndex].drawing_number_when_save"
                                                                role="checkbox">包括编号</el-checkbox>
                                                            <el-checkbox
                                                                v-model="flowList.workflow[workflowIndex].drawing_cycle_when_save"
                                                                role="checkbox">包括标记</el-checkbox>
                                                        </div>
                                                    </div>
                                                </template>

                                                <div class="item">
                                                    <span>数据存储：</span>
                                                    <el-switch v-if="flowList.workflow[workflowIndex]"
                                                        v-model="flowList.workflow[workflowIndex].enable_save_result">
                                                    </el-switch>
                                                </div>
                                            </div>
                                        </el-dialog>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="create-btn-flow">
                            <div style="display: flex; align-items: center;">
                                <i class="el-icon-circle-plus-outline" @click="createFlow()"></i> 新增图像工作流
                            </div>
                        </div>
                    </div>
                </div>
                <div class="execute-btn" v-if="workflowType == 'Quality'">
                    <div class="start-btn">
                        <el-button round>执行机构</el-button>
                    </div>
                    <div class="solenoid-class" @click="clickExecuteHeader()" :class="{ activeExecute: btnExecute }">电磁阀
                    </div>
                </div>
                <!-- 添加硬件联动部分 -->
                <div class="hardware-link-btn" v-if="workflowType == 'Quality'">
                    <div class="start-btn">
                        <el-button round>硬件联动</el-button>
                    </div>
                    <div class="hardware-link-options">
                        <div class="hardware-option no-material-option" @click="clickHardwareLink('noMaterial')"
                            :class="{ activeHardware: hardwareLinkType === 'noMaterial' }">
                            无料/低速报警
                        </div>
                        <div class="hardware-option" @click="clickHardwareLink('motorLink')"
                            :class="{ activeHardware: hardwareLinkType === 'motorLink' }">
                            电机联动
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getWorkflows, getWorkConfigs, getDelete, cameras } from '@/api/workflowConfig.js'
import { getModels } from "@/api/config";
import { querySizeAlgorithmsList } from "@/api/softwareRegistration/sizeAlgorithm";
import { query_motors, query_ctlrs, query_lights } from "@/api/register.js";

export default {
    name: 'workflow',
    components: {},
    data() {
        return {
            loading: false,
            updateNameBol: false,
            updateName: '',
            updateBatchBol: false,
            initBol: false,
            btnExecute: false,
            dialogVisible: false,
            activeIds: '0-0',
            workflowIndex: 0,
            hardwareLinkType: '', // 添加硬件联动类型
            modelList: [],
            algorithmList: [],
            flowList: { id: 0, name: '工作流配置', batch: '', comFlowList: [], workflow: [], executing: {}, type: '' },
            flowObj: [{ type: 'camera', name: '相机' }, { type: 'model', name: '模型' }, { type: 'threshold', name: '阈值' }],
            workflowType: '',//工作配置类型 Monitor,Quality
            typeOptions: [
                { type: 'Monitor', label: '监控' },
                { type: 'Quality', label: '质检' },
            ],
            //工作流参数
            workflow: {
                id: 0, //工作流id 新增时传0 多条工作流的时候也是0
                work_configuration_id: 0, //工作配置id 新增时传0 多条工作流的时候也是0
                /*-------工作流中相机参数--------*/
                camera_id: '', //相机id
                camera_type: '', //相机类型 或者 Camera(相机) Station(工位)
                algorithm_type: 'Ai',
                exposure_time: '', //曝光时间
                gain: '', //增益值
                offset: null, //触发距离
                /*-------工作流中裁图框参数--------*/
                rect: null,//裁图信息 非必填
                /*-------工作流中模型参数--------*/
                model_path: '', //AI模型----路径
                //min_area: '', //AI噪点过滤----面积  此字段非必传，启用传，不启用不传
                /*-------工作流中阈值参数--------*/
                classes: {
                    type: "Surface",
                    classes: [
                        {
                            "class": "C1",
                            "name": "类别1",
                            "parameter": {
                                "area": 10,
                                "count": 0,
                                "length": 0,
                                "ratio": 0,
                                "width": 0
                            }
                        }
                    ],
                },
                /*-------工作流中光源参数--------*/
                lights: [],
                _camera: {},
                enable_workflow: true,//启用工作流
                enable_save_image: true,// 新增字段：启用图片保存
                save_image_behaviour: 'SaveAll',//图片保存行为 SaveQualified 保存合格 SaveUnqualified 保存不合格 SaveAll 保存所有 SaveKeyFrame 保存关键帧
                enable_save_result: true,//启用数据存储
                save_image_type: 'Original', // 新增字段：保存图片类型 Original(原图) Marked(标记图)
                drawing_number_when_save: true, // 新增字段：包括编号
                drawing_cycle_when_save: true, // 新增字段：包括标记
            },
            //执行参数
            executing: {
                type: 'Monitor', //执行类型Monitor,Quality
                //绿灯参数
                green: {},
                //黄灯参数
                yellow: {},
                //红灯参数
                red: {},
                //蜂鸣
                buzzer: {},
                //吹气动作
                inner: []
            },
            //硬件联动参数
            alarm: {
                no_material_alarm: {
                    enabled: false,
                    duration: 60,//无料持续时长
                    enable_yellow: true,
                    enable_red: false,
                    enable_buzzer: true,
                    alarm_duration: 300,
                    alarm_frequency: 2,
                },
                low_speed_alarm: {
                    enabled: false,
                    duration: 300,//低速持续时长
                    threshold: 100,//低速阈值
                    enable_yellow: true,
                    enable_red: false,
                    enable_buzzer: true,
                    alarm_duration: 300,
                    alarm_interval: 200,
                    alarm_frequency: 2,
                }
            },
            //电机联动参数
            motor: {
                camera_move_motor: {
                    enabled: false,
                    condition: "FirstTime",
                    motor_id: "",
                    light_id: "",
                    pulse_wave_per_millimeter: 800,
                    backward_distance: 50,
                    forward_distance: 30
                },
                loading_motor: {
                    enabled: false,
                    motor_id: "",
                },
                unloading_motor: {
                    enabled: false,
                    motor_id: "",
                },
            },
            registeredMotors: [],
            registeredLights: [],
            selectedCtlrId: null,
        }
    },
    watch: {
        flowList: {
            handler(nv, ov) {
                this.$nextTick(() => {
                    if (!this.flowList) {
                        localStorage.removeItem('flowList')
                    } else {
                        localStorage.setItem('flowList', JSON.stringify(this.flowList));
                    }

                })
            },
            deep: true
        },
        'flowList.comFlowList': {
            handler(nv, ov) {
                this.$nextTick(() => {
                    if (!this.flowList || !this.flowList.comFlowList) return;

                    let [parentIndex, index] = this.activeIds.split('-');

                    if (this.flowList.comFlowList.length > 0) {
                        if (parentIndex >= this.flowList.comFlowList.length) {
                            parentIndex = this.flowList.comFlowList.length - 1;
                        }

                        let info = this.flowList.comFlowList[parentIndex];
                        if (!info) return;

                        info = JSON.parse(JSON.stringify(info));
                        // if (parentIndex !== 'undefined') {
                        //     if (info && info.step && info.step <= info.list.length) {
                        //         this.activeIds = `${parentIndex}-${info.step - 1}`;
                        //         if (info.list && info.list[info.step - 1]) {
                        //             console.log('1-getFlowItem');
                        //             this.getFlowItem(info.list[info.step - 1], info.step - 1, parentIndex);
                        //         }
                        //     }
                        // }
                    }
                })
            },
            immediate: true,
            deep: true
        },
        '$route.query': {
            async handler(newQuery, oldQuery) {
                this.updateNameBol = false;
            },
            immediate: true,
            deep: true
        }
    },
    created() {
    },
    mounted() {
    },
    computed: {
        btnExecuteDisabled() {
            let bol = false;
            this.flowList.comFlowList.forEach(v => {
                if (v.state == 0) {
                    bol = true
                }
            })
            return bol;
        }
    },
    methods: {
        //获取指定流数据
        async init(id) {
            console.log("🚀 ~ workflow------init ~ id:", id)
            try {
                this.workflowType = '';
                if (id > 0) {
                    console.log('工作流id大于0');
                    this.loading = true;
                    getWorkflows(id).then(workflow => {
                        console.log("🚀 ~ getWorkflows ~ workflow:", workflow)
                        // console.log('🚀 ~ getWorkflows ~ workflow.executing:', workflow.executing);
                        if (workflow.executing) {
                            workflow.executing.inner.forEach(v => {
                                console.log('🚀 ~ getWorkflows ~ v:', v.code);
                            })
                        }
                        this.integrationExecuting(workflow.executing);
                        if (typeof workflow == 'object') {
                            let comFlowList = [];
                            workflow.workflow.forEach((v, k) => {
                                comFlowList.push({ state: 1, step: 1, list: JSON.parse(JSON.stringify(this.flowObj)) });
                                workflow.workflow[k] = this.integrationWorkflow(workflow.workflow[k]);
                                if (v.classes.type == "Stage" || v.classes.type == "Speed" || v.classes.type == "Surface" || v.classes.type == "Relative" || v.classes.type == "OperationStage" || v.classes.type == "ScanRecognition") {
                                    workflow.workflow[k].algorithm_type = 'Ai';
                                }
                                if (v.classes.type == "Size" || v.classes.type == "Thick") {
                                    workflow.workflow[k].algorithm_type = 'Size';
                                }
                            });
                            this.workflowType = workflow.type;
                            this.flowList = {
                                id: workflow['id'],
                                name: workflow['name'],
                                batch: workflow['batch'],
                                type: workflow['type'],
                                workflow: workflow['workflow'],
                                executing: workflow['executing'],
                                alarm: workflow['alarm'] ? workflow['alarm'] : this.alarm,
                                motor: workflow['motor'] ? workflow['motor'] : this.motor,
                                comFlowList: comFlowList,
                            }
                            console.log("🚀 ~ 2222222getWorkflows ~ this.flowList:", this.flowList)
                            // 等待 getModels 执行完成
                            this.$nextTick(async () => {
                                await this.getCtlrs();
                                await this.getModels();
                                this.workflowTypeChange();
                                console.log('2-getFlowItem');
                                this.getFlowItem(this.flowList['comFlowList'][0]['list'][0], 0, 0, true);
                                this.$emit('flow', this.flowList);
                                this.btnExecute = false;
                            })
                        }
                    }).finally(e => {
                        this.loading = false;
                    })
                } else {
                    console.log('工作流id小于0', this.motor);
                    this.flowList = {
                        id: 0,
                        name: '',
                        batch: '',
                        type: '', //Monitor,Quality
                        workflow: [JSON.parse(JSON.stringify(this.workflow))],
                        executing: {
                        },
                        alarm: this.alarm,
                        motor: this.motor,
                        comFlowList: [{ state: 0, step: 1, list: JSON.parse(JSON.stringify(this.flowObj)) }],
                    }
                    this.getCtlrs();
                    let StorageFlowList = null;//localStorage.getItem('flowList');
                    if (StorageFlowList) {
                        this.flowList = JSON.parse(StorageFlowList);
                        StorageFlowList = null;
                        this.workflowType = this.flowList['type'];
                        this.workflowTypeChange();
                        let comFlow = this.flowList['comFlowList'][this.flowList['comFlowList'].length - 1];
                        this.getFlowItem(comFlow['list'][comFlow.step - 1], comFlow.step - 1, this.flowList['comFlowList'].length - 1);
                    } else {
                        this.$nextTick(async () => {
                            await this.getModels();
                            this.workflowTypeChange();
                            this.getFlowItem(this.flowList['comFlowList'][0]['list'][0], 0, 0);
                            this.$emit('flow', this.flowList)
                        })
                    }
                    this.btnExecute = false;
                }
            } catch (error) {
                console.error('初始化失败:', error);
            }
        },
        // 获取飞拍控制器列表
        async getCtlrs() {
            try {
                const response = await query_ctlrs();
                if (response) {
                    this.ctlrs = response;
                    // 如果有控制器，默认选择第一个
                    if (this.ctlrs.length > 0) {
                        this.selectedCtlrId = this.ctlrs[0].id;
                        this.getRegisteredMotors();
                    }
                }
            } catch (error) {
                console.error('获取飞拍控制器失败:', error);
                this.ctlrs = [];
            }
        },
        //获取已注册电机列表
        async getRegisteredMotors() {
            if (!this.selectedCtlrId) {
                this.registeredMotors = [];
                return;
            }

            try {
                // 请求参数中添加ctlr_id
                const params = { ctlr_id: this.selectedCtlrId };
                const motorsList = await query_motors(params);
                if (motorsList) {
                    this.registeredMotors = motorsList.filter(motor => motor.slot !== 'M1').sort((a, b) => {
                        const slotA = parseInt(a.slot.replace('M', ''));
                        const slotB = parseInt(b.slot.replace('M', ''));
                        return slotB - slotA;
                    });;
                    // 如果尚未注册电机，则将motor对象置为null
                    if (this.registeredMotors.length > 0 && this.flowList.motor) {
                        // 相机位置电机
                        if (this.flowList.motor.camera_move_motor == null) {
                            this.flowList.motor.camera_move_motor = {
                                enabled: false,
                                condition: "FirstTime",
                                motor_id: "",
                                light_id: "",
                                pulse_wave_per_millimeter: 800,
                                backward_distance: 50,
                                forward_distance: 30
                            };
                        }
                        // 上料皮带电机
                        if (this.flowList.motor.loading_motor == null) {
                            this.flowList.motor.loading_motor = {
                                enabled: false,
                                motor_id: "",
                            };
                        }
                        //  下料皮带电机
                        if (this.flowList.motor.unloading_motor == null) {
                            this.flowList.motor.unloading_motor = {
                                enabled: false,
                                motor_id: "",
                            };
                        }
                        console.log('11111111111this.flowList.motor', this.flowList.motor);
                    }
                }
            } catch (error) {
                console.error('获取注册电机失败:', error);
                this.registeredMotors = [];
            }
        },
        //获取模型路径
        async getModels() {
            console.log('获取模型路径');
            const res = await getModels();
            this.modelList = res;
            // 如果模型列表不为空且当前没有选中的模型，则默认选中第一个
            if (res && res.length > 0) {
                this.$set(this.workflow, 'model_path', res[0]);
                this.$emit('isCurrentConfigLock', false);
            } else {
                console.log('没有模型列表，选中尺寸算法', this.flowList);
                //如果工作流id大于0，并且只要this.flowList中的workflow只要有一个model_path不为空
                if (this.flowList.id > 0 && this.flowList.workflow.some(v => v.model_path)) {
                    this.$message.warning("获取模型文件失败，模型文件列表为空，当前工作配置不可操作!");
                    this.$emit('isCurrentConfigLock', true);
                    return;
                } else {
                    this.$emit('isCurrentConfigLock', false);
                }
                // 如果模型列表为空,则选中尺寸算法
                this.workflow.algorithm_type = 'Size';
                this.querySizeAlgorithmsList();
            }
        },
        //获取尺寸算法列表
        querySizeAlgorithmsList() {
            console.log('获取尺寸算法列表');
            querySizeAlgorithmsList()
                .then((res) => {
                    this.algorithmList = res;
                    // 如果算法列表不为空且当前没有选中的算法，则默认选中第一个
                    if (res && res.length > 0) {
                        console.log('默认选中第一个算法');
                        const firstAlgo = res[0];
                        this.workflow.model_path = "";
                        this.$set(this.workflow, 'algorithm_id', firstAlgo.id);  // 使用$set确保响应式更新
                    } else {
                        console.log('没有尺寸算法');
                        if (this.flowList.id > 0) {
                            this.$message.warning("获取尺寸算法失败，尺寸算法列表为空，当前工作配置不可操作!");
                            this.$emit('isCurrentConfigLock', true);
                            return;
                        } else {
                            this.$emit('isCurrentConfigLock', false);
                        }
                    }
                })
        },
        //设置选择流程类型
        workflowTypeChange() {
            this.flowList['type'] = this.workflowType;
            console.log('3-getFlowItem');
            this.getFlowItem(this.flowList['comFlowList'][0]['list'][0], 0, 0);
        },
        //新增流
        createFlow() {
            cameras().then(res => {
                //质检下如果res中所有相机的exist_offset为false，则无法新增工作流
                if (this.workflowType == 'Quality' && res.every(item => !item.exist_offset)) {
                    this.$message.warning('没有可用相机（需设置触发位置），无法新增工作流！');
                    return;
                }
                //质检下过滤掉exist_offset为false的相机
                let availableCamera = this.workflowType == 'Quality' ? res.filter(item => item.exist_offset) : res;
                if (availableCamera.length == this.flowList.workflow.length) {
                    this.$message.warning('没有可用相机，无法新增工作流！');
                    return;
                } else {
                    //state:当前流完成状态，1：已完成，0：未完成
                    this.flowList['comFlowList'].push({ state: 0, step: 1, list: JSON.parse(JSON.stringify(this.flowObj)) });
                    this.flowList['workflow'].push(JSON.parse(JSON.stringify(this.workflow)));
                    this.$nextTick(() => {
                        let index = this.flowList['comFlowList'].length - 1;
                        console.log('4-getFlowItem');
                        this.getFlowItem(this.flowList['comFlowList'][index]['list'][0], 0, index);
                    })
                }
            })
        },
        //获取当前流的数据
        getFlowItem(flowInfo, index, flowIndex, initBol) {
            console.log("🚀 ~ getFlowItem ~ flowIndex:", flowIndex)
            console.log('获取当前流的数据');
            if (!flowInfo || !this.flowList) return;
            this.initBol = initBol;
            this.btnExecute = false; // 清除执行机构的选中状态
            this.hardwareLinkType = '';//清除硬件联动的选中状态
            this.activeIds = `${flowIndex}-${index}`;
            let { workflow, type, comFlowList } = this.flowList;
            console.log("🚀 ~ getFlowItem ~ workflow:", workflow)

            if (!workflow || !comFlowList || !comFlowList[flowIndex]) return;

            this.btnExecute = false;
            this.$emit('flowInfo', {
                flowInfo,
                comFlow: comFlowList[flowIndex],
                workflow: workflow[flowIndex],
                workflowAll: workflow,
                type
            });
        },
        //验证当前流程步是否可操作
        flowBtnDisabled(obj, index, parentIndex) {
            if (obj.state) return false;
            if (obj.step > index) {
                return false;
            }
            return true;
        },
        //打开高级设置
        moreCamera(index) {
            this.workflowIndex = index;
            this.dialogVisible = true;
        },
        //关闭高级设置
        handleClose() {
            this.dialogVisible = false;
        },
        handleSaveImageChange() {
            console.log('切换图片保存格式');
        },
        //删除工作流
        delHeader(v, index) {
            if (!this.flowList || !this.flowList.comFlowList || this.flowList.comFlowList.length <= 1) {
                this.$message({
                    type: 'warning',
                    message: '必须保留一条工作流'
                });
                return false;
            }
            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                if (this.flowList && this.flowList.workflow && this.flowList.comFlowList) {
                    // // 获取要删除的工作流的camera_id
                    const deletedWorkflow = this.flowList.workflow[index];
                    if (deletedWorkflow && deletedWorkflow.camera_id) {
                        // 从执行机构配置中删除相关的条件
                        if (this.flowList.executing && this.flowList.executing.inner) {
                            this.flowList.executing.inner.forEach(executor => {
                                if (executor.conditions) {
                                    executor.conditions = executor.conditions.filter(condition =>
                                        condition.camera === null || condition.camera.camera_id !== deletedWorkflow.camera_id
                                    );
                                }
                            });
                        }
                    }

                    this.flowList.workflow.splice(index, 1);
                    this.flowList.comFlowList.splice(index, 1);
                    this.$nextTick(() => {
                        if (this.flowList.comFlowList[0] && this.flowList.comFlowList[0].list) {
                            this.getFlowItem(this.flowList.comFlowList[0].list[0], 0, 0);
                        }
                    });
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                }
            }).catch(() => {
                // 用户取消删除操作
            });
        },
        //保存工作流
        async saveWorkFlowData() {
            if (this.modelList.length == 0 && this.algorithmList.length == 0) {
                this.$message.warning('没有可用模型或算法，无法保存工作配置！');
                return;
            }
            try {
                console.log(5555);
                // 创建一个 Promise 来处理校验结果
                const validationResult = await new Promise(resolve => {
                    this.$emit('validateConfigs', resolve);
                });

                // 如果校验不通过，不继续保存
                if (!validationResult) {
                    return;
                }
                console.log('this.flowList', this.flowList);
                // 如果校验通过，继续保存流程
                this.$emit('saveWorkFlowData', this.flowList);
            } catch (error) {
                console.error('保存工作流时发生错误:', error);
                this.$message.warning('保存失败，请检查配置是否正确');
            }
        },
        //删除工作配置
        delWorkFlowData() {
            this.$confirm('要删除该条配置流程?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                getDelete(this.flowList.id).then(res => {
                    this.$message({
                        type: 'success',
                        message: `删除成功`
                    });
                    this.$emit('delWorkFlow', true)
                })
            }).catch(() => {
                this.delActionIndex = '';
            });
        },
        //点击执行数据
        clickExecuteHeader() {
            this.btnExecute = true;
            this.hardwareLinkType = ''; // 清除硬件联动的选中状态
            this.activeIds = '';// 清除工作流节点的选中状态
            // 过滤workflow数组，只保留enable_workflow为true的对象
            let newFlowList = {
                ...this.flowList,
                workflow: this.flowList.workflow.filter(workflowItem => workflowItem.enable_workflow)
            };
            // console.log("🚀 ~ clickExecuteHeader ~ newFlowList:", newFlowList)
            this.$emit('clickExecuteHeader', newFlowList); // 发送过滤后的 flowList
        },
        // 点击硬件联动
        clickHardwareLink(type) {
            this.hardwareLinkType = type;
            this.btnExecute = false; // 清除执行机构的选中状态
            this.activeIds = ''; // 清除工作流节点的选中状态
            // 过滤workflow数组，只保留enable_workflow为true的对象
            let newFlowList = {
                ...this.flowList,
                workflow: this.flowList.workflow.filter(workflowItem => workflowItem.enable_workflow)
            };
            if (type == 'noMaterial') {
                this.$emit('clickHardwareLink', { type, flowList: newFlowList });
            } else {
                this.$emit('clickHardwareLink', { type, flowList: newFlowList });
                this.$emit('flowInfo', { flowInfo: { type: 'motorLink' }, type: 'Quality', workflow: newFlowList });
            }
        },
        // 监听工作流启用状态变化
        handleWorkflowEnableChange(workflow, index) {
            if (!workflow.enable_workflow) {
                // 当工作流被禁用时，从执行机构配置中删除相关的条件
                if (this.flowList.executing && this.flowList.executing.inner) {
                    this.flowList.executing.inner.forEach(executor => {
                        if (executor.conditions) {
                            executor.conditions = executor.conditions.filter(condition =>
                                condition.camera === null || condition.camera.camera_id !== workflow.camera_id
                            );
                        }
                    });
                }
            }
            if (this.hardwareLinkType === 'motorLink') {
                let newFlowList = {
                    ...this.flowList,
                    workflow: this.flowList.workflow.filter(workflowItem => workflowItem.enable_workflow),
                    flowInfo: { type: 'motorLink' },
                };
                console.log("🚀 ~ handleWorkflowEnableChange ~ newFlowList:", newFlowList)
                this.$emit('isEnableExecute', newFlowList); // 发送过滤后的 flowList
            }
        },
        //整合回显执行数据
        integrationExecuting(workflowExecuting) {
            //Monitor,Quality
            let executing = workflowExecuting || {};
            // 保留原有的 inner 数据
            let innerData = executing.inner || [];
            if (executing && executing['type'] == 'Monitor') {
                ['red', 'yellow', 'green', 'buzzer'].forEach(v => {
                    if (executing[v]) {
                        if (!executing[v]['executing_state']['limit']) {
                            executing[v]['executing_state']['limit'] = '';
                        }
                        if (executing[v]['default_state']['frequency'] > 0) {
                            executing[v]['default_state']['state'] = 'Strobing';
                        }
                        //定时频闪
                        if (executing[v]['executing_state']['frequency'] && executing[v]['executing_state']['limit']) {
                            executing[v]['executing_state']['state'] = 'timerStrobing'
                            executing[v]['executing_state']['limit'] = executing[v]['executing_state']['limit'].replace('ms', '')
                        }
                        //定时点亮
                        if (!executing[v]['executing_state']['frequency'] && executing[v]['executing_state']['limit']) {
                            executing[v]['executing_state']['state'] = 'timerOpen'
                            executing[v]['executing_state']['limit'] = executing[v]['executing_state']['limit'].replace('ms', '')
                        }
                        //频闪
                        if (executing[v]['executing_state']['frequency'] && !executing[v]['executing_state']['limit']) {
                            executing[v]['executing_state']['state'] = 'Strobing'
                        }
                    }
                })
            }
            // 确保 inner 数据被保留
            executing.inner = innerData;
            return executing;
        },
        //整合回显流程数据
        integrationWorkflow(workflow) {
            if (workflow['classes'] && workflow['classes']['classes'] && workflow['classes']['classes'].length > 0) {
                if (workflow['classes']['type'] == 'Stage') {
                    workflow['classes']['classes'].forEach((cv, ck) => {
                        workflow['classes']['classes'][ck]['parameter']['continuous'] = cv.parameter['continuous'].replace('ms', '')
                    })
                }
                if (workflow['classes']['type'] == 'Surface') {
                    workflow['classes']['classes'].forEach((cv, ck) => {
                        workflow['classes']['classes'][ck]['parameter']['ratio'] = parseFloat(cv.parameter.ratio);
                    })
                }
            }
            if (workflow['classes'] && this.workflowType == 'Quality') {
                workflow['classes'] = this.parsingObjectStringToFloat(workflow['classes'])
            }
            if (workflow['camera']) {
                workflow['_camera'] = JSON.parse(JSON.stringify(workflow['camera']));
            }

            // 根据save_image_behaviour判断是否启用图片保存
            workflow.enable_save_image = workflow.save_image_behaviour == 'NotSave' ? false : true;
            //根据save_image_type判断是否启用图片保存
            workflow.drawing_number_when_save || workflow.drawing_cycle_when_save ? workflow.save_image_type = 'Marked' : workflow.save_image_type = 'Original';
            return workflow;
        },
        //解析尺寸算法输入输出
        parsingObjectStringToFloat(obj) {
            Object.keys(obj).map(index => {
                if (obj[index] instanceof Object) {
                    obj[index] = this.parsingObjectStringToFloat(obj[index])
                } else {
                    if (index == 'value') {
                        if (typeof obj[index] == 'boolean') {

                        } else {
                            obj[index] = parseFloat(obj[index] || 0);
                        }

                    }
                }
            })
            return obj;
        },
        //重命名
        updateNameHead() {
            if (this.updateNameBol) {
                console.log('重命名', this.flowList.name);
                if (!this.updateName) {
                    this.$message.warning('请输入工作配置名称');
                    return false;
                }
                this.flowList.name = this.updateName;
                // 向父组件发送名称更新事件，确保父组件中的 flow.name 也被更新
                this.$emit('updateWorkFlowName', this.updateName);
            } else {
                this.updateName = this.flowList.name;
            }
            this.updateNameBol = !this.updateNameBol;
        },
        //重新输入批次
        updateBatchHead() {
            console.log('输入批次', this.flowList.batch);
            if (!this.flowList.batch) {
                this.$message.warning('请输入工作配置批次');
                return false;
            }
        },
        //切换图片类型开关变化
        handleSaveImageTypeChange(val) {
            if (val === 'Original') {
                this.flowList.workflow[this.workflowIndex].drawing_number_when_save = false;
                this.flowList.workflow[this.workflowIndex].drawing_cycle_when_save = false;
            }
        },
        // 监听图片保存开关变化
        handleSaveImageEnableChange(val) {
            // 如果关闭图片保存，则清空相关字段
            if (!val) {
                this.flowList.workflow[this.workflowIndex].save_image_behaviour = 'NotSave';
                this.flowList.workflow[this.workflowIndex].drawing_number_when_save = false;
                this.flowList.workflow[this.workflowIndex].drawing_cycle_when_save = false;
                delete this.flowList.workflow[this.workflowIndex].save_image_type;
                delete this.flowList.workflow[this.workflowIndex].enable_save_image;
            } else {
                // 如果开启图片保存，则默认设置为SaveAll
                this.flowList.workflow[this.workflowIndex].save_image_behaviour = 'SaveAll';
            }
        },
    }
}
</script>

<style lang="scss">
.workflow-layout {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    padding: 25px 49px 25px 10px;

    *::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: transparent !important;
    }

    .toolbar {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        margin-bottom: 30px;



        .lock-buttons {
            display: flex;

            .comBtn {
                margin-right: 12px;
                background-color: rgba(0, 0, 0, 1);
                color: rgba(255, 255, 255, 1);
                font-size: 16px;
                text-align: center;
                padding: 8px 15px;
                border-radius: 10px;
                cursor: pointer;

                &:last-child {
                    margin-right: 0px;
                }
            }

            .is-disabled {
                background-color: #4c4c4c !important;
                color: #eeeeee !important;
                border-color: #4c4c4c !important;
            }
        }
    }

    .workflow-box {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;

        .activeExecute {
            background-color: #FFB145 !important;
        }

        .activeHardware {
            background-color: #FFB145 !important;
        }

        .header {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;

            .name-box {
                color: #6C6C6C;
                font-size: 20px;
                text-align: left;
                padding: 0 20px 0 7px;
                border-bottom: 2px solid #BBBBBB;
                min-width: 140px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .name {
                flex: 1;
                max-width: 107px;
                min-width: 107px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .btnUpdateName {
                margin-left: 10px;
                font-size: 16px;
                color: #f99500;
            }

            .type {
                margin-left: 13px;
                width: 88px;
            }

            .batch-box {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin-left: 10px;

                a {
                    width: 70px;
                    display: inline-block;
                    align-items: center;
                    font-size: 16px;
                }
            }
        }

        .body {
            width: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding-left: 64px;
            margin-top: -2px;

            .workflow-class {
                display: flex;
                border-left: 2px solid #BBBBBB;

                .container-left {
                    width: 134px;

                    .start-btn {
                        padding: 30px 0px;
                        border-radius: 0 0 0 10px;
                        border-left: 2px solid #BBBBBB;
                        border-bottom: 2px solid #BBBBBB;
                        position: relative;

                        &::after {
                            content: '';
                            width: 6px;
                            height: 39px;
                            border-radius: 0 10px 0 0;
                            border-top: 2px solid #BBBBBB;
                            border-right: 2px solid #BBBBBB;
                            position: absolute;
                            right: -9px;
                            bottom: -39px;
                        }

                        .el-button {
                            position: absolute;
                            bottom: -20px;
                            right: 0px;
                            color: #101010;
                            font-size: 14px;
                            background: #d9d9d9;
                        }

                    }
                }

                .container-center {
                    height: 100%;
                    flex: 1;
                    box-sizing: border-box;
                    padding-top: 85px;
                    margin-left: -26px;
                    display: flex;
                    flex-direction: column;

                    .flow-box {
                        position: relative;
                        overflow-x: hidden;
                        max-height: 580px;
                        display: flex;
                        flex-direction: row;
                        padding-right: 5px;
                    }

                    .flow-item {
                        position: relative;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        padding-bottom: 15px;

                        &::before {
                            content: '';
                            width: 2px;
                            height: 100%;
                            position: absolute;
                            top: 14px;
                            left: 33px;
                            background-color: #BBBBBB;
                        }

                        &:last-child {
                            padding-bottom: 0px;

                            &::before {
                                content: unset;
                            }
                        }

                        .item-btns {
                            font-size: 32px;
                            color: #BEBEBE;
                            cursor: pointer;

                            &.del-btn {
                                &:hover {
                                    color: red;
                                }
                            }

                            &.selp-btn {
                                border: 2px solid #FFB754;
                                width: 24px;
                                height: 24px;
                                border-radius: 50%;
                                line-height: 24px;
                                text-align: center;
                                font-size: 14px;
                                margin-right: 5px;
                            }

                            &.state-btn {
                                width: 22px;
                                height: 22px;
                                font-size: 22px;
                                color: red;
                                margin-right: 5px;

                                .normal {
                                    color: #FFF;
                                    margin: 2px;
                                    width: 20px;
                                    height: 20px;
                                    line-height: 20px;
                                    border-radius: 50%;
                                    background-color: #81B337;
                                    text-align: center;
                                    font-size: 18px;
                                }
                            }
                        }

                        .line {
                            color: #BBBBBB;
                            position: relative;
                            width: 20px;
                            display: flex;
                            flex-direction: row;
                            justify-content: flex-end;
                            margin-left: 18.5px;
                            font-size: 16px;

                            &::before {
                                content: '';
                                width: 99%;
                                height: 100%;
                                border-radius: 0 0 0 5px;
                                border-bottom: 2px solid #BBBBBB;
                                position: absolute;
                                top: 50%;
                                left: -3px;
                                transform: translateY(-100%);
                            }

                            .el-icon-caret-right {
                                margin-right: -2px;
                            }
                        }


                        .selp-box {
                            display: flex;
                            align-items: center;

                            .selp-btn {
                                padding: 10px 30px;
                                border-radius: 8px;
                                color: #000;
                                font-size: 14px;
                                border: 1px solid #F99500;
                                background: none;

                                &.active,
                                &:hover {
                                    background-color: #FFB145;
                                }

                            }

                            .el-icon-d-arrow-right {
                                color: #BEBEBE;
                                font-size: 22px;
                                font-weight: 600;
                                margin: 0 5px;
                            }
                        }

                        a {
                            display: inline-block;
                            margin-left: 10px;
                            margin-right: 10px;
                            min-width: 120px;
                            max-width: 120px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            font-size: 16px;
                        }

                        .el-switch {
                            width: 40px;
                            margin-right: 20px;
                        }

                        i {
                            font-size: 18px;
                        }

                        .el-dialog {
                            border-radius: 10px;
                            box-shadow: none;

                            .el-dialog__body {
                                padding: 0;

                                .dialog-content {
                                    padding: 20px;

                                    .item {
                                        display: flex;
                                        align-items: center;
                                        margin-bottom: 20px;

                                        &:last-child {
                                            margin-bottom: 0;
                                        }

                                        &.indented-item {
                                            padding-left: 20px;
                                        }

                                        &.mark-options {
                                            margin-left: 105px;
                                            margin-top: -10px;
                                        }

                                        .checkbox-container {
                                            display: flex;
                                            flex-direction: column;

                                            .el-checkbox {
                                                margin-bottom: 10px;

                                                &:last-child {
                                                    margin-bottom: 0;
                                                }

                                                .el-checkbox__input.is-checked .el-checkbox__inner {
                                                    background-color: #000000;
                                                    border-color: #000000;
                                                }

                                                .el-checkbox__input.is-checked+.el-checkbox__label {
                                                    color: #000000;
                                                }

                                                .el-checkbox__inner:hover {
                                                    border-color: #000000;
                                                }
                                            }
                                        }

                                        .el-radio {
                                            margin-right: 20px;

                                            &:last-child {
                                                margin-right: 0;
                                            }

                                            .el-radio__input.is-checked .el-radio__inner {
                                                background: #000000 !important;
                                                border-color: #000000 !important;
                                            }

                                            .el-radio__input.is-checked+.el-radio__label {
                                                color: #000000 !important;
                                            }

                                            .el-radio__inner:hover {
                                                border-color: #000000 !important;
                                            }
                                        }

                                        .el-switch.is-checked .el-switch__core {
                                            background-color: #000000 !important;
                                        }

                                        .el-switch.is-checked .el-switch__core {
                                            border-color: #000000 !important;
                                        }
                                    }
                                }
                            }
                        }

                    }


                    .create-btn-flow {
                        // flex: 1;
                        display: flex;
                        align-items: flex-start;
                        color: rgba(154, 154, 154, 1);
                        font-size: 16px;
                        padding-left: 67px;
                        margin-top: 20px;

                        .el-icon-circle-plus-outline {
                            font-size: 32px;
                            color: #BEBEBE;
                            cursor: pointer;
                            margin-right: 7px;
                        }
                    }
                }
            }

            .workflow-monitor-class {
                border-left: none !important;
            }

            .execute-btn,
            .hardware-link-btn {
                box-sizing: border-box;
                width: 134px;
                position: relative;

                .start-btn {
                    padding: 30px 0px;
                    border-radius: 0 0 0 10px;
                    border-left: 2px solid #BBBBBB;
                    border-bottom: 2px solid #BBBBBB;
                    position: relative;

                    &::after {
                        content: '';
                        width: 22px;
                        height: 39px;
                        border-top: 2px solid #BBBBBB;
                        position: absolute;
                        right: -36px;
                        bottom: -39px;
                    }

                    .el-button {
                        position: absolute;
                        bottom: -20px;
                        right: -14px;
                        color: #101010;
                        font-size: 14px;
                        background: #d9d9d9;
                    }
                }

                .solenoid-class {
                    padding: 10px;
                    margin-left: 160px;
                    display: ruby-text;
                    border-radius: 8px 8px 8px 8px;
                    background-color: #f0f0f0;
                    border: 1px solid #F99500;
                    color: rgba(18, 18, 19, 1);
                    font-size: 14px;
                    text-align: center;
                    position: absolute;
                    top: 41px;
                    width: 60px;
                    cursor: pointer;

                    &.active,
                    &:hover {
                        background-color: #FFB145;
                    }
                }

                .hardware-link-options {
                    display: flex;
                    flex-direction: row;
                    margin-left: 160px;
                    position: absolute;
                    top: 41px;

                    .hardware-option {
                        padding: 10px;
                        border-radius: 8px;
                        background-color: #f0f0f0;
                        border: 1px solid #F99500;
                        color: rgba(18, 18, 19, 1);
                        font-size: 14px;
                        text-align: center;
                        margin-right: 15px;
                        cursor: pointer;
                        white-space: nowrap;

                        &:hover {
                            background-color: #FFB145;
                        }


                    }

                    .no-material-option {
                        position: relative;

                        &::after {
                            content: "";
                            width: 16px;
                            height: 39px;
                            border-top: 1px solid #bbb;
                            position: absolute;
                            top: 18px;
                            right: -17px;
                        }
                    }
                }
            }
        }
    }
}
</style>
