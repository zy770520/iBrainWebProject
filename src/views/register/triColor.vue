<template>
    <div class="config-container-tricolor">
        <div class="tricolor">
            <div class="tricolor-img">
                <h3 class="title">飞拍控制器-三色灯</h3>
                <div class="tricolor-img-content">

                </div>
            </div>
            <div class="tricolor-list">
                <a class="title">三色灯总览表</a>
                <div class="tricolor-table">
                    <el-table :data="tableData" height="500">
                        <el-table-column label="序号" width="100" type="index">
                        </el-table-column>
                        <el-table-column prop="name" label="名称">
                        </el-table-column>
                        <el-table-column prop="state" label="状态">
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <div class="tricolor-config">
            <div class="tricolor-config-video">
                <a class="title">硬件连接状态</a>
                <div class="tricolor-config-img">
                    <span class="no">请观察三色灯是否被点亮</span>
                </div>
                <i v-if='active' @click="run" class='el-icon-video-play'></i>
                <i v-else @click="closeWebSocket" class='iconfont icon-lbzntingzhi1'></i>
            </div>
        </div>
    </div>
</template>
<script>
import { WebSocketBaseUrl } from "../../utils/index";
export default {
    name: 'config',
    data() {
        return {
            ctlr_id: this.$route.query.id,
            WebSocket: null,
            lightVal: 0,
            showNum: false,
            number: '',
            state: '',
            active: true,
            infolist: {
                number: 1,
                port: 2,
                version: '1.0'
            },
            formInline: {
                name: '',
                round: true,
            },
            options: [{
                value: '选项1',
                label: '工位'
            }, {
                value: '选项2',
                label: '其他'
            }],
            tableData: [{
                name: '红灯',
                state: '开启'
            }, {
                name: '黄灯',
                state: '开启'
            }, {
                name: '绿灯',
                state: '开启'
            }, {
                name: '蜂鸣',
                state: '开启'
            }],
        }
    },
    methods: {
        //运行
        run() {
            //试运行三色灯
            let that = this
            let addr = `${WebSocketBaseUrl}/hardware/trial_running_monitor?ctlr_id=` + this.ctlr_id;
            this.WebSocket = new WebSocket(addr);
            // 连接成功打开时的处理
            this.WebSocket.onopen = function (event) {
                that.active = false
                that.$message.success('三色灯运行成功！')
            };
        },
        closeWebSocket() {
            if (this.WebSocket) {
                this.active = true
                this.$message.warning('三色灯试运行已关闭!');
                this.WebSocket.close();
            }
        }
    },
    beforeDestroy() {
        this.closeWebSocket();
    }
}
</script>

<style lang="scss">
.config-container-tricolor {
    height: calc(100vh - 90px);
    padding: 0px 0px 0px 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .tricolor {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .tricolor-img {
            flex: 1;

            .tricolor-img-content {
                width: 620px;
                height: 420px;
                background: url(../../assets/imgs/colmap.png) no-repeat center;
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
                    width: 35px;
                    height: 35px;
                    line-height: 35px;
                    border-radius: 50%;
                    text-align: center;
                    font-weight: bold;
                    color: #fff;
                    background: #81B337;

                    &:nth-child(15),
                    &:nth-child(20) {
                        margin-left: 35px;
                    }
                }
            }
        }

        .tricolor-list {
            flex: 1;
            display: flex;
            flex-direction: column;

            .tricolor-table {
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

    .tricolor-config {
        height: 100vh;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 10px 20px;
        background: #ffffff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #87a848;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .tricolor-config-video {
            display: flex;
            flex-direction: column;
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
            margin-bottom: 20px;

            .tricolor-config-img {
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

        .tricolor-config-content {
            min-height: calc(100vh - 660px);
            max-height: calc(100vh - 660px);
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .tricolor-config-header {
                display: flex;
                flex-direction: row;

                .tricolor-config-submit {
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
