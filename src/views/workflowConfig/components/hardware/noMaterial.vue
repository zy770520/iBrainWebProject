<template>
    <div class="execution-layout">
        <div class="execution-overview-table">
            <div class="box-header">
                <el-row type="flex" align="middle">
                    <el-col :span="4">
                        <div class="label">配置概览</div>
                    </el-col>
                </el-row>
            </div>
            <div class="box-body">
                <img src="../../../../assets/imgs/effect.png" alt="">
            </div>
        </div>
        <div class="config-box">
            <div class="box-header">
                <el-row type="flex" align="middle">
                    <el-col :span="12">
                        <div class="label">无料/低速配置</div>
                    </el-col>
                </el-row>
            </div>
            <div class="box-body">
                <div class="no-material-box">
                    <div class="no-material-box-body">
                        <el-form :model="materialAlarmForm" label-width="100px">
                            <div class="no-material-box-body-item">
                                <a class="no-material-box-body-item-label">无料报警：</a>
                                <el-form-item label="使能：" class="material-label">
                                    <el-switch v-model="materialAlarmForm.enabled" />
                                </el-form-item>
                                <div class="no-material-box-body-item-content">
                                    <a>触发条件：</a>
                                    <el-form-item label="持续无料时长(T1)：">
                                        <el-input v-model.number="materialAlarmForm.duration" />s
                                    </el-form-item>
                                </div>
                                <div class="no-material-box-body-item-content">
                                    <a class="material-label">报警：</a>
                                    <el-form-item label="黄灯：">
                                        <el-switch v-model="materialAlarmForm.enable_yellow" />
                                    </el-form-item>
                                    <el-form-item label="红灯：">
                                        <el-switch v-model="materialAlarmForm.enable_red" />
                                    </el-form-item>
                                    <el-form-item label="蜂鸣：">
                                        <el-switch v-model="materialAlarmForm.enable_buzzer" />
                                    </el-form-item>
                                </div>
                                <div class="no-material-box-body-item-content">
                                    <a class="material-label">警报：</a>
                                    <el-form-item label="警报时长(T2)：">
                                        <el-input v-model.number="materialAlarmForm.alarm_duration" />s
                                    </el-form-item>
                                    <el-form-item label="警报频率：">
                                        <el-input v-model.number="materialAlarmForm.alarm_frequency" />Hz
                                    </el-form-item>
                                </div>
                            </div>
                        </el-form>
                        <el-form :model="lowSpeedAlarmForm" label-width="100px">
                            <div class="no-material-box-body-item">
                                <a class="no-material-box-body-item-label">低速报警：</a>
                                <el-form-item label="使能：" class="material-label">
                                    <el-switch v-model="lowSpeedAlarmForm.enabled" />
                                </el-form-item>
                                <div class="no-material-box-body-item-content">
                                    <a>触发条件：</a>
                                    <el-form-item label="持续低速时长(T3)：">
                                        <el-input v-model.number="lowSpeedAlarmForm.duration" />s
                                    </el-form-item>
                                    <el-form-item label="低速阈值：">
                                        <el-input v-model.number="lowSpeedAlarmForm.threshold" />片/分钟
                                    </el-form-item>
                                </div>
                                <div class="no-material-box-body-item-content">
                                    <a class="material-label">报警：</a>
                                    <el-form-item label="黄灯：">
                                        <el-switch v-model="lowSpeedAlarmForm.enable_yellow" />
                                    </el-form-item>
                                    <el-form-item label="红灯：">
                                        <el-switch v-model="lowSpeedAlarmForm.enable_red" />
                                    </el-form-item>
                                    <el-form-item label="蜂鸣：">
                                        <el-switch v-model="lowSpeedAlarmForm.enable_buzzer" />
                                    </el-form-item>
                                </div>
                                <div class="no-material-box-body-item-content">
                                    <a class="material-label">警报：</a>
                                    <el-form-item label="警报时长(T4)：">
                                        <el-input v-model.number="lowSpeedAlarmForm.alarm_duration" />s
                                    </el-form-item>
                                    <el-form-item label="警报间隔(T5)：">
                                        <el-input v-model.number="lowSpeedAlarmForm.alarm_interval" />s
                                    </el-form-item>
                                    <el-form-item label="警报频率：">
                                        <el-input v-model.number="lowSpeedAlarmForm.alarm_frequency" />Hz
                                    </el-form-item>
                                </div>
                            </div>
                        </el-form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: "execute-executor",
    components: {},
    data() {
        return {
            materialAlarmForm: {
                enabled: false,
                duration: 60,
                enable_yellow: true,
                enable_red: false,
                enable_buzzer: true,
                alarm_duration: 300,
                alarm_frequency: 2,
            },
            lowSpeedAlarmForm: {
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
        };
    },
    watch: {
    },
    created() { },
    computed: {},
    methods: {
        init(flowInfo) {
            console.log('flowInfo', flowInfo);
            this.materialAlarmForm = flowInfo.alarm.no_material_alarm;
            this.lowSpeedAlarmForm = flowInfo.alarm.low_speed_alarm;
        },
    },
};
</script>
<style lang="scss">
.execution-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #fff;
    border-radius: 10px 0px 0px 10px;
    border-left: 3px solid rgba(255, 177, 69, 1);
    box-shadow: -13px 14px 15px -4px rgba(0, 0, 0, 0.16);
    box-sizing: border-box;
    padding: 9px 24px;

    .box-header {
        .label {
            font-size: 20px;
            font-weight: 600;
        }

        margin-bottom: 36px;
    }

    .box-body {
        flex: 1;

    }


    .execution-overview-table {
        height: 40.05%;
        box-sizing: border-box;
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        .box-header {
            margin-bottom: 33px;
        }

        .box-body {
            height: calc(100% - 83px);

            img {
                width: 100%;
                height: 100%;
                object-fit: scale-down;
            }
        }
    }

    .config-box {
        flex: 1;
        overflow: hidden;
        overflow-y: auto;
        padding: 9px 16px;
        box-sizing: border-box;
        border-radius: 10px;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
        display: flex;
        flex-direction: column;

        .box-header {
            margin-bottom: 10px;
        }

        .box-body {
            display: flex;
            flex-direction: column;

            .no-material-box {
                display: flex;
                flex-direction: column;

                .no-material-box-header {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;

                    .no-material-box-header-title {
                        font-size: 16px;
                        font-weight: 600;
                    }
                }

                .no-material-box-body {
                    display: flex;
                    flex-direction: column;

                    .no-material-box-body-item {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 20px;
                        padding: 10px;
                        border-radius: 6px;
                        border: 2px solid #f4b45a;

                        .material-label {
                            .el-form-item__label {
                                width: 70px !important;
                            }
                        }

                        .no-material-box-body-item-label {
                            font-size: 16px;
                            font-weight: 600;
                        }

                        .el-form-item {
                            margin-bottom: 0px;
                            display: flex;
                            flex-direction: row;
                            margin-right: 5px;

                            .el-form-item__label {
                                width: auto !important;
                                text-align: left;
                                font-size: 14px;
                                font-weight: 400;
                                color: #000000;
                                padding: 0px;
                            }

                            .el-form-item__content {
                                margin-left: 0px !important;
                                display: flex;
                                flex-direction: row;
                                align-items: center;

                                .el-input {
                                    width: 100px;
                                }
                            }
                        }

                        .no-material-box-body-item-content {
                            display: flex;
                            flex-direction: row;
                            margin-bottom: 10px;

                            a {
                                display: flex;
                                flex-direction: row;
                                align-items: center;
                                font-size: 14px;
                                font-weight: 400;
                            }

                            .material-label {
                                width: 70px;
                            }
                        }
                    }
                }
            }
        }


    }

}
</style>