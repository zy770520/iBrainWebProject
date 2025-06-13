<template>
    <div class="electric-layout">
        <div class="config-box">
            <div class="box-header">
                <el-row type="flex" align="middle">
                    <el-col :span="12">
                        <div class="label">电机配置</div>
                    </el-col>
                </el-row>
            </div>
            <div v-if="registeredMotors.length > 0" class="box-body">
                <!-- 相机位置电机 -->
                <div class="motor-config">
                    <div class="motor-config-title">
                        <span>相机位置电机：</span>
                    </div>
                    <div v-if="motor.camera_move_motor != null" class="config-item">
                        <span class="item-label">使能：</span>
                        <el-switch v-model="motor.camera_move_motor.enabled"></el-switch>
                    </div>

                    <div v-if="motor.camera_move_motor != null" class="config-item">
                        <span class="item-label">触发条件：</span>
                        <el-select v-model="motor.camera_move_motor.condition" placeholder="请选择">
                            <el-option label="工作配置每次启动时" value="EveryTime"></el-option>
                            <el-option label="工作配置首次启动时" value="FirstTime"></el-option>
                        </el-select>
                    </div>

                    <div class="config-item motor-action">
                        <span class="item-label">电机动作：</span>
                        <div class="motor-action-row">
                            <div class="motor-action-left">
                                <span class="sub-label">电机：</span>
                                <template v-if="registeredMotors.length > 0">
                                    <el-select v-model="motor.camera_move_motor.motor_id" placeholder="请选择"
                                        @change="handleMotorChange" clearable>
                                        <el-option v-for="motor in availableCameraMotors" :key="motor.id"
                                            :label="motor.name" :value="motor.id">
                                        </el-option>
                                    </el-select>
                                </template>
                                <template v-else>
                                    <span class="no-motor-tip">暂无可选电机</span>
                                </template>
                            </div>
                            <div v-if="motor.camera_move_motor != null" class="motor-action-right">
                                <span class="sub-label">光源：</span>
                                <template v-if="registeredLights.length > 0">
                                    <el-select v-model="motor.camera_move_motor.light_id" placeholder="请选择"
                                        @change="handleLightChange">
                                        <el-option v-for="light in registeredLights" :key="light.id" :label="light.name"
                                            :value="light.id">
                                        </el-option>
                                    </el-select>
                                </template>
                                <template v-else>
                                    <span class="no-motor-tip">暂无可选光源</span>
                                </template>
                            </div>
                        </div>
                    </div>

                    <div v-if="motor.camera_move_motor != null" class="config-item motor-pulse">
                        <span class="item-label motor-pulse-label">每毫米脉冲：</span>
                        <el-input v-model.number="motor.camera_move_motor.pulse_wave_per_millimeter" placeholder="请输入"
                            type="number" @input="validatePulseInput"></el-input>
                    </div>

                    <div v-if="motor.camera_move_motor != null" class="config-item">
                        <span class="item-label">电机运动：</span>
                        <div class="motor-movement-container">
                            <div class="movement-item">
                                <span class="movement-num">1.</span>
                                <span class="movement-type">反向运动：</span>
                                <span class="movement-label">反向运动距离：</span>
                                <el-input v-model.number="motor.camera_move_motor.backward_distance" placeholder="请输入"
                                    class="distance-input" type="number"
                                    @input="validatePulseBackwardDistanceInput"></el-input>
                                <span class="unit">mm</span>
                                <el-button class="comBtn"
                                    :disabled="!$store.state.applicationInfo.isUpdateMotor || !motor.camera_move_motor.motor_id || isBackwardRunning || isForwardRunning"
                                    type="primary" size="small" @click="executeMovement('Backward')">试运行</el-button>
                                <el-button class="comBtn"
                                    :disabled="!$store.state.applicationInfo.isUpdateMotor || !motor.camera_move_motor.motor_id || !isBackwardRunning"
                                    type="primary" size="small" @click="executeMovement('BackwardStop')">停止</el-button>
                            </div>

                            <div class="movement-item">
                                <span class="movement-num">2.</span>
                                <span class="movement-type">正向运动：</span>
                                <span class="movement-label">正向运动距离：</span>
                                <el-input v-model.number="motor.camera_move_motor.forward_distance" placeholder="请输入"
                                    class="distance-input" type="number"
                                    @input="validatePulseForwardDistanceInput"></el-input>
                                <span class="unit">mm</span>
                                <el-button class="comBtn"
                                    :disabled="!$store.state.applicationInfo.isUpdateMotor || !motor.camera_move_motor.motor_id || isForwardRunning || isBackwardRunning"
                                    type="primary" size="small" @click="executeMovement('Forward')">试运行</el-button>
                                <el-button class="comBtn"
                                    :disabled="!$store.state.applicationInfo.isUpdateMotor || !motor.camera_move_motor.motor_id || !isForwardRunning"
                                    type="primary" size="small" @click="executeMovement('ForwardStop')">停止</el-button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 上料皮带电机 -->
                <div class="motor-config">
                    <div class="motor-config-title">
                        <span>上料皮带电机：</span>
                    </div>
                    <div class="config-item">
                        <span class="item-label">使能：</span>
                        <el-switch v-model="motor.loading_motor.enabled"></el-switch>
                    </div>

                    <div class="config-item motor-action">
                        <span class="item-label">电机动作：</span>
                        <div class="motor-action-row">
                            <div class="motor-action-left">
                                <span class="sub-label">电机：</span>
                                <template v-if="registeredMotors.length > 0">
                                    <el-select v-model="motor.loading_motor.motor_id" placeholder="请选择"
                                        @change="handleLoadingMotorChange" clearable>
                                        <el-option v-for="motor in availableLoadingMotors" :key="motor.id"
                                            :label="motor.name" :value="motor.id">
                                        </el-option>
                                    </el-select>
                                </template>
                                <template v-else>
                                    <span class="no-motor-tip">暂无可选电机</span>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 下料皮带电机 -->
                <div class="motor-config">
                    <div class="motor-config-title">
                        <span>下料皮带电机：</span>
                    </div>
                    <div class="config-item">
                        <span class="item-label">使能：</span>
                        <el-switch v-model="motor.unloading_motor.enabled"></el-switch>
                    </div>

                    <div class="config-item motor-action">
                        <span class="item-label">电机动作：</span>
                        <div class="motor-action-row">
                            <div class="motor-action-left">
                                <span class="sub-label">电机：</span>
                                <template v-if="registeredMotors.length > 0">
                                    <el-select v-model="motor.unloading_motor.motor_id" placeholder="请选择"
                                        @change="handleUnloadingMotorChange" clearable>
                                        <el-option v-for="motor in availableUnloadingMotors" :key="motor.id"
                                            :label="motor.name" :value="motor.id">
                                        </el-option>
                                    </el-select>
                                </template>
                                <template v-else>
                                    <span class="no-motor-tip">暂无可选电机</span>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="box-body">
                <div class="no-motor-total-tip">暂无可配置电机</div>
            </div>
        </div>
    </div>
</template>

<script>
import { query_motors, query_ctlrs, query_lights } from "@/api/register.js";
import { updateMotorParams } from "@/api/workflowConfig.js";
export default {
    name: "execute-executor",
    components: {
    },
    data() {
        return {
            executing: null,
            registeredMotors: [],
            registeredLights: [],
            ctlrs: [],
            selectedCtlrId: null,
            selectedMotor: null,
            selectedLight: null,
            imgUrl: null,
            isPlay: true,
            isBackwardRunning: false,
            isForwardRunning: false,
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
        };
    },
    watch: {
        'motor.camera_move_motor.motor_id': {
            handler(value) {
                if (value) {
                    this.handleDefaultLightChange();
                }
            },
            deep: true,
            immediate: true
        }
    },
    created() {
    },
    computed: {
        // 相机位置电机可选列表
        availableCameraMotors() {
            return this.registeredMotors.filter(motor =>
                motor.id !== this.motor.loading_motor.motor_id &&
                motor.id !== this.motor.unloading_motor.motor_id
            );
        },

        // 上料皮带电机可选列表
        availableLoadingMotors() {
            console.log('this.motor', this.motor);
            console.log('this.motor.unloading_motor.motor_id', this.motor.unloading_motor.motor_id);
            return this.registeredMotors.filter(motor =>
                motor.id !== this.motor.camera_move_motor.motor_id &&
                motor.id !== this.motor.unloading_motor.motor_id
            );
        },

        // 下料皮带电机可选列表
        availableUnloadingMotors() {
            return this.registeredMotors.filter(motor =>
                motor.id !== this.motor.camera_move_motor.motor_id &&
                motor.id !== this.motor.loading_motor.motor_id
            );
        }
    },
    methods: {
        async init(flowInfo) {
            console.log('flowInfo', flowInfo);
            let { motor } = flowInfo;
            console.log("🚀 ~ init ~ motor:", motor)
            if (motor) {
                this.motor.camera_move_motor = motor.camera_move_motor ? motor.camera_move_motor : { ...this.motor.camera_move_motor };
                this.motor.loading_motor = motor.loading_motor ? motor.loading_motor : { ...this.motor.loading_motor };
                this.motor.unloading_motor = motor.unloading_motor ? motor.unloading_motor : { ...this.motor.unloading_motor };
                await this.getCtlrs();
                this.selectedMotor = this.registeredMotors.find(motor => motor.id === this.motor.camera_move_motor.motor_id);
                this.selectedLight = this.registeredLights.find(light => light.id === this.motor.camera_move_motor.light_id);
            }
        },
        //试运行电机参数（更新电机参数）
        executeMovement(direction) {
            const distance = direction === 'Forward'
                ? this.motor.camera_move_motor.forward_distance.toString()
                : this.motor.camera_move_motor.backward_distance.toString();
            console.log(`执行${direction === 'Forward' ? '正向' : '反向'}运动，距离: ${distance}mm`);

            let motorRuningParams = {
                motor_slot: this.selectedMotor.slot || '',//电机接口
                motor_speed: this.selectedMotor.speed || '',//电机速度
                motor_acceleration: this.selectedMotor.acceleration || '',//电机加速度
                light_slot: this.selectedLight.slot || '',//光源接口
                pulse_wave_per_millimeter: this.motor.camera_move_motor.pulse_wave_per_millimeter,//每毫米脉冲
                distance: distance,//正/反向运动距离
                direction: direction,//电机运动方向
            }
            console.log("🚀 ~ executeMovement ~ motorRuningParams:", motorRuningParams)
            if (direction == 'BackwardStop' || direction == 'ForwardStop') {
                motorRuningParams = null;
                // 这里添加实际的电机控制逻辑
                updateMotorParams(motorRuningParams).then(res => {
                    this.$message.success("电机停止成功！");
                    if (direction == 'BackwardStop') {
                        this.isBackwardRunning = false;
                    } else if (direction == 'ForwardStop') {
                        this.isForwardRunning = false;
                    }
                }).catch(() => {
                    // 即使停止失败也要更新状态
                    if (direction == 'BackwardStop') {
                        this.isBackwardRunning = false;
                    } else if (direction == 'ForwardStop') {
                        this.isForwardRunning = false;
                    }
                });
            } else {
                if (direction == 'Backward') {
                    this.isBackwardRunning = true;
                } else if (direction == 'Forward') {
                    this.isForwardRunning = true;
                }
                // 这里添加实际的电机控制逻辑
                updateMotorParams(motorRuningParams).then(res => {
                    this.$message.success("电机启动成功！");

                }).catch(() => {
                    // 启动失败时确保状态为 false
                    if (direction == 'Backward') {
                        this.isBackwardRunning = false;
                    } else if (direction == 'Forward') {
                        this.isForwardRunning = false;
                    }
                });
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
                        await this.getRegisteredMotors();
                        await this.getRegisteredLights();
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
                const params = { ctlr_id: this.selectedCtlrId };
                const motorsList = await query_motors(params);
                if (motorsList) {
                    // 过滤掉 M1 并按照 slot 编号降序排序
                    this.registeredMotors = motorsList
                        .filter(motor => motor.slot !== 'M1')
                        .sort((a, b) => {
                            const slotA = parseInt(a.slot.replace('M', ''));
                            const slotB = parseInt(b.slot.replace('M', ''));
                            return slotB - slotA;
                        });
                }
            } catch (error) {
                console.error('获取注册电机失败:', error);
            }
        },
        //获取已注册光源列表
        async getRegisteredLights() {
            if (!this.selectedCtlrId) {
                this.registeredLights = [];
                return;
            }

            try {
                // 请求参数中添加ctlr_id
                const params = { ctlr_id: this.selectedCtlrId };
                const lights = await query_lights(params);
                if (lights) {
                    this.registeredLights = lights;
                }
            } catch (error) {
                console.error('获取注册光源失败:', error);
            }
        },
        //默认光源选择
        handleDefaultLightChange() {
            // 如果有注册的光源，默认选择第一个
            if (this.registeredLights.length > 0 && this.motor.camera_move_motor.motor_id) {
                //光源默认值
                const lastLight = this.registeredLights[this.registeredLights.length - 1];
                this.motor.camera_move_motor.light_id = this.motor.camera_move_motor.light_id || lastLight.id;
                this.selectedLight = this.registeredLights.find(light => light.id === this.motor.camera_move_motor.light_id);
            }
        },
        //相机位置电机切换
        handleMotorChange(motorId) {
            if (motorId == '') {
                this.motor.camera_move_motor.motor_id = '';
                this.selectedMotor = null;
            } else {
                const selectedMotor = this.registeredMotors.find(motor => motor.id === motorId);
                if (selectedMotor) {
                    this.motor.camera_move_motor.motor_id = selectedMotor.id;
                    this.selectedMotor = selectedMotor;
                }
            }
        },
        //相机位置光源切换
        handleLightChange(lightId) {
            if (lightId == '') {
                this.motor.camera_move_motor.light_id = '';
                this.selectedLight = null;
            } else {
                const selectedLight = this.registeredLights.find(light => light.id === lightId);
                if (selectedLight) {
                    this.motor.camera_move_motor.light_id = selectedLight.id;
                    this.selectedLight = selectedLight;
                }
            }
        },
        //上料皮带电机切换
        handleLoadingMotorChange(motorId) {
            if (motorId !== '') {
                const selectedLoadingMotor = this.registeredMotors.find(motor => motor.id === motorId);
                this.motor.loading_motor.motor_id = selectedLoadingMotor.id;
            }
        },
        //下料皮带电机切换
        handleUnloadingMotorChange(motorId) {
            if (motorId !== '') {
                const selectedUnloadingMotor = this.registeredMotors.find(motor => motor.id === motorId);
                this.motor.unloading_motor.motor_id = selectedUnloadingMotor.id;
            }
        },
        validatePulseInput(value) {
            if (value < 0 || value == '') {
                this.motor.camera_move_motor.pulse_wave_per_millimeter = 0;
                this.$message.warning('每毫米脉冲不能小于0');
            }
        },
        validatePulseBackwardDistanceInput(value) {
            if (value < 0 || value == '') {
                this.motor.camera_move_motor.backward_distance = 0;
                this.$message.warning('反向运动距离不能小于0');
            }
        },
        validatePulseForwardDistanceInput(value) {
            if (value < 0 || value == '') {
                this.motor.camera_move_motor.forward_distance = 0;
                this.$message.warning('正向运动距离不能小于0');
            }
        }
    },

};
</script>
<style lang="scss">
.electric-layout {
    // display: flex;
    // flex-direction: column;
    // width: 100%;
    // height: 100%;
    // overflow: hidden;
    // background-color: #fff;
    // border-radius: 10px 0px 0px 10px;
    // border-left: 3px solid rgba(255, 177, 69, 1);
    // box-shadow: -13px 14px 15px -4px rgba(0, 0, 0, 0.16);
    // box-sizing: border-box;
    // padding: 9px 24px;

    .electric-overview-table {
        height: 40.05%;
        box-sizing: border-box;
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        .box-header {
            .label {
                font-size: 20px;
                font-weight: 600;
            }

            margin-bottom: 20px;
        }

        .box-body {
            flex: 1;
            display: flex;
            flex-direction: column;

            .camera-view {
                width: 100%;
                height: 40.05%;
                background-color: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 5px;
            }

            .el-button {
                border: none;
                padding: 0 12px 0px 0px;

                &:active {
                    color: #000000;
                    background-color: #ffffff;
                }

                &:hover {
                    color: #000000;
                    background-color: #ffffff;
                }

                &:focus {
                    background-color: #ffffff;
                }
            }
        }
    }

    .config-box {
        flex: 1;
        overflow: hidden;
        overflow-y: auto;
        // padding: 9px 16px;
        box-sizing: border-box;
        // border-radius: 10px;
        // box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
        display: flex;
        flex-direction: column;

        .box-header {
            .label {
                font-size: 20px;
                font-weight: 600;
            }

            margin-bottom: 10px;
        }

        .box-body {
            display: flex;
            flex-direction: column;
            // max-height: calc(100% - 200px);
            overflow-y: auto;

            .motor-config {
                border: 2px solid #f4b45a;
                border-radius: 10px;
                padding: 10px;
                margin-bottom: 10px;

                .motor-config-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 10px;
                }

                .config-item {
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    .item-label {
                        width: 90px;
                        font-weight: 500;
                        font-size: 14px;
                    }

                    .el-select {
                        width: 200px;
                    }

                    .el-input {
                        width: 200px;
                    }

                    .no-motor-tip {
                        color: #999;
                        width: 200px;
                        line-height: 32px;
                    }


                    .motor-movement-container {

                        .movement-item {
                            display: flex;
                            align-items: center;
                            margin-bottom: 10px;
                            font-size: 14px;

                            &:last-child {
                                margin-bottom: 0;
                            }

                            .movement-num {
                                margin-right: 5px;
                            }

                            .movement-type {
                                width: 80px;
                                font-weight: 500;
                            }

                            .movement-label {
                                margin-right: 5px;
                            }

                            .distance-input {
                                width: 120px;
                                margin-right: 5px;
                            }

                            .unit {
                                margin-right: 10px;
                            }

                            .comBtn {
                                margin-right: 12px;
                                background-color: rgba(0, 0, 0, 1);
                                color: rgba(255, 255, 255, 1);
                                font-size: 14px;
                                text-align: center;
                                padding: 4px 10px;
                                border-radius: 8px;
                                cursor: pointer;
                                border-color: rgba(0, 0, 0, 1);
                                margin-left: 10px;
                            }

                            .el-button--primary.is-disabled {
                                color: #FFF !important;
                                background-color: #e5e5e5 !important;
                                border-color: #e5e5e5 !important;
                            }
                        }
                    }
                }

                .motor-pulse {
                    margin-left: 90px;

                    .motor-pulse-label {
                        font-weight: normal !important;
                    }
                }

                .motor-action {
                    align-items: center;

                    .motor-action-row {
                        display: flex;
                        align-items: center;

                        .motor-action-left,
                        .motor-action-right {
                            display: flex;
                            align-items: center;
                            margin-right: 20px;

                            .sub-label {
                                width: 50px;
                                font-size: 14px;
                            }
                        }
                    }
                }


            }

            .no-motor-total-tip {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #f20000;
                font-weight: 600;
                font-size: 16px;
            }
        }
    }

}
</style>