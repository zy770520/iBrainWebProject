<template>
    <div class="config-container-feeder">
        <div class="feeder">
            <div class="feeder-img">
                <a class="title">飞拍控制器-上料器</a>
                <div class="feeder-img-content">
                    <div class="number">
                        <span>圆</span>
                        <span>直</span>
                    </div>
                </div>
            </div>
            <div class="feeder-list">
                <a class="title">上料器总览表</a>
                <div class="feeder-table">
                    <el-table :data="tableData" height="500">
                        <el-table-column label="序号" width="100" type="index">
                        </el-table-column>
                        <el-table-column prop="title" label="上料器名称">
                        </el-table-column>
                        <el-table-column prop="state" label="状态">
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <div class="feeder-config">
            <div class="feeder-config-video">
                <a class="title">硬件连接状态</a>
                <div class="feeder-config-img">
                    <span class="no">请观察上料器是否振动</span>
                </div>
                <i v-if='active' @click="run" class='el-icon-video-play'></i>
                <i v-else @click="closeWebSocket" class='iconfont icon-lbzntingzhi1'></i>
            </div>
            <div class="feeder-config-content">
                <div class="feeder-config-header">
                    <div class="title">注册上料器</div>
                    <div class="feeder-config-submit">
                        <el-button plain @click="save">保存</el-button>
                    </div>
                </div>
                <el-form :model="formInline" ref="formInline">
                    <el-form-item label="直振：">
                        <el-switch v-model="formInline.enable_straight_feeder"></el-switch>
                    </el-form-item>
                    <el-form-item label="圆振：">
                        <el-switch v-model="formInline.enable_circle_feeder"></el-switch>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import { query_feeder, save_feeder } from "@/api/register.js";
import { WebSocketBaseUrl } from "../../utils/index";
export default {
    name: 'config',
    data() {
        return {
            ctlr_id: this.$route.query.id,
            lightVal: 0,
            showNum: false,
            number: '',
            state: '',
            active: true,
            title: '',
            formInline: {
                enable_straight_feeder: true,
                enable_circle_feeder: true
            },
            infolist: {
                number: 1,
                port: 2,
                version: '1.0'
            },
            tableData: [{
                title: '直振',
                state: '开启'
            }, {
                title: '圆振',
                state: '开启'
            }],
        }
    },
    mounted() {
        this.initData()
    },
    methods: {
        //初始化
        initData() {
            let parma = { ctlr_id: this.ctlr_id }
            query_feeder(parma).then((res) => {
                this.tableData[0].state = res.enable_straight_feeder ? '开启' : '关闭'
                this.tableData[1].state = res.enable_circle_feeder ? '开启' : '关闭'
                this.formInline.enable_straight_feeder = res.enable_straight_feeder
                this.formInline.enable_circle_feeder = res.enable_circle_feeder
            })
        },
        //保存
        save() {
            let parma = { ctlr_id: Number(this.ctlr_id), ...this.formInline }
            save_feeder(parma).then((res) => {
                this.initData()
                this.$message.success('保存成功！')
            })
        },
        //运行
        run() {
            //试运行上料器
            let that = this
            let addr = `${WebSocketBaseUrl}/hardware/trial_running_feeder?ctlr_id=` + this.ctlr_id + `&slot=` + 'F' + this.number;
            this.WebSocket = new WebSocket(addr);
            // 连接成功打开时的处理
            this.WebSocket.onopen = function (event) {
                that.active = false
                that.$message.success('上料器试运行成功！')
            };
        },
        closeWebSocket() {
            if (this.WebSocket && !this.active) {
                this.active = true
                this.$message.success('上料器试运行已关闭!');
                this.WebSocket.close();
            }
        }
    }
}
</script>

<style lang="scss">
.config-container-feeder {
    height: calc(100vh - 90px);
    padding: 0px 0px 0px 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .feeder {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .feeder-img {
            flex: 1;

            .feeder-img-content {
                width: 560px;
                height: 420px;
                background: url(../../assets/imgs/bitmap.png) no-repeat center;
                background-size: 100%;
                margin: 10px auto;
                position: relative;

                .number {
                    position: absolute;
                    top: 200px;
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

        .feeder-list {
            flex: 1;
            display: flex;
            flex-direction: column;

            .feeder-table {
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
                }
            }
        }

    }

    .feeder-config {
        height: 100vh;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 10px 20px;
        background: #ffffff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #87a848;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .feeder-config-video {
            display: flex;
            flex-direction: column;
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
            margin-bottom: 20px;

            .feeder-config-img {
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

        .feeder-config-content {
            min-height: calc(100vh - 660px);
            max-height: calc(100vh - 660px);
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .feeder-config-header {
                display: flex;
                flex-direction: row;

                .feeder-config-submit {
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
