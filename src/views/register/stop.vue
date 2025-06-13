<template>
    <div class="config-container-stop">
        <div class="stop">
            <div class="stop-img">
                <a class="title">飞拍控制器-急停、气压</a>
                <div class="stop-img-content">
                    <div class="number">
                        <span>停</span>
                        <span>气</span>
                    </div>
                </div>
            </div>
            <div class="stop-list">
                <a class="title">控制总览表</a>
                <div class="stop-table">
                    <el-table :data="tableData" height="500">
                        <el-table-column label="序号" width="100" type="index">
                        </el-table-column>
                        <el-table-column prop="name" label="名称">
                        </el-table-column>
                        <el-table-column prop="state" label="状态">
                            <template slot-scope="scope">
                                {{ scope.row.state ? '开启' : '关闭' }}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <div class="stop-config">
            <div class="stop-config-video">
                <a class="title">硬件连接状态</a>
                <div class="stop-config-img">
                    <span class="no">暂时不实现试运行功能</span>
                </div>
            </div>
            <div class="stop-config-content">
                <div class="stop-config-header">
                    <div class="title">注册急停、气压 </div>
                    <div class="stop-config-submit">
                        <el-button plain @click="save">保存</el-button>
                    </div>
                </div>
                <el-form :model="formInline" ref="formInline">
                    <el-form-item label="急停：" prop="stop">
                        <el-switch v-model="formInline.enable_emergency_stop"></el-switch>
                    </el-form-item>
                    <el-form-item label="气压：" prop="pressure">
                        <el-switch v-model="formInline.enable_low_pressure"></el-switch>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import { query_alarm, save_alarm } from "@/api/register.js";
export default {
    name: 'config',
    components: {},
    data() {
        return {
            showNum: false,
            ctlr_id: Number(this.$route.query.id),
            formInline: {
                ctlr_id: this.ctlr_id,
                enable_emergency_stop: true,
                enable_low_pressure: true
            },
            tableData: [
                {
                    name: '急停',
                    state: true
                },
                {
                    name: '气压',
                    state: true
                }
            ],
        }
    },
    mounted() {
        this.query();
    },
    methods: {
        //保存
        save() {
            let params = {
                ctlr_id: this.ctlr_id,
                enable_emergency_stop: this.formInline.enable_emergency_stop,
                enable_low_pressure: this.formInline.enable_low_pressure
            }
            save_alarm(params).then(res => {
                this.$message.success('保存成功!')
                this.query();
            })
        },
        //查询
        query() {
            query_alarm({ ctlr_id: this.ctlr_id }).then(res => {
                this.formInline = res;
                //更新tableData数据
                this.tableData.forEach(item => {
                    item.name == '急停' ? item.state = res.enable_emergency_stop : item.state = res.enable_low_pressure;
                })
            })
        }
    }
}
</script>

<style lang="scss">
.config-container-stop {
    height: calc(100vh - 90px);
    padding: 0px 0px 0px 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .stop {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .stop-img {
            flex: 1;

            .stop-img-content {
                width: 560px;
                height: 420px;
                background: url(../../assets/imgs/bitmap.png) no-repeat center;
                background-size: 100%;
                margin: 10px auto;
                position: relative;

                .number {
                    position: absolute;
                    top: 160px;
                    right: 30px;
                    width: 100px;
                    height: 100px;
                    display: flex;
                    flex-wrap: wrap;
                    column-gap: 10px;
                    cursor: pointer;
                }

                span {
                    display: inline-block;
                    width: 28px;
                    height: 38px;
                    line-height: 40px;
                    text-align: center;
                    font-weight: bold;
                    color: #fff;
                    background: #81B337;

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

        .stop-list {
            flex: 1;
            display: flex;
            flex-direction: column;

            .stop-table {
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

                    .el-switch.is-checked .el-switch__core {
                        background-color: #000000;
                        border-color: #000000;
                    }
                }
            }
        }

    }

    .stop-config {
        height: 100vh;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 10px 20px;
        background: #ffffff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #87a848;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .stop-config-video {
            display: flex;
            flex-direction: column;
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
            margin-bottom: 20px;

            .stop-config-img {
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

        .stop-config-content {
            min-height: calc(100vh - 660px);
            max-height: calc(100vh - 660px);
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .stop-config-header {
                display: flex;
                flex-direction: row;

                .stop-config-submit {
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
                flex-wrap: wrap;
                margin-top: 10px;
                margin-left: 20px;

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

                        .el-switch.is-checked .el-switch__core {
                            background-color: #000000;
                            border-color: #000000;
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
