<template>
    <div class="config-container-register">
        <div class="leftBox">
            <div class="leftBox-container">
                <el-row>
                    <el-col :span="24">
                        <div class="btn">
                            <el-button plain @click='handleDelete'>删除</el-button>
                        </div>
                        <a class="title">飞拍控制器</a>
                        <div class="info">
                            <ul>
                                <li>
                                    编号：{{ formInline.number }}
                                </li>
                                <li>
                                    串口号：{{ formInline.port }}
                                </li>
                                <li>
                                    固件版本：{{ formInline.version }}
                                </li>
                            </ul>
                        </div>
                    </el-col>
                    <el-col :span="24">
                        <a class="title">相机</a>
                        <div class="tableInfo">
                            <el-table :data="cameras">
                                <el-table-column prop="slot" label="飞拍接口">
                                </el-table-column>
                                <el-table-column prop="ip" label="IP地址">
                                </el-table-column>
                                <el-table-column prop="brand" label="品牌">
                                </el-table-column>
                                <el-table-column prop="brand" label="型号">
                                </el-table-column>
                                <el-table-column prop="name" label="别名">
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-col>
                    <el-col :span="24">
                        <a class="title">光源</a>
                        <div class="tableInfo">
                            <el-table :data="lights">
                                <el-table-column prop="slot" label="飞拍接口">
                                </el-table-column>
                                <el-table-column prop="name" label="别名">
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-col>
                    <el-col :span="24">
                        <a class="title">相机光源组合</a>
                        <div class="tableInfo">
                            <el-table :data="stations">
                                <el-table-column label="工位编号" type="index" width="100px">
                                </el-table-column>
                                <el-table-column prop="camera_name" label="相机">
                                </el-table-column>
                                <el-table-column prop="lights" label="光源">
                                    <template slot-scope="scope">
                                        <span>{{ lightData(scope.row.lights) }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="name" label="别名">
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-col>
                    <el-col :span="24">
                        <a class="title">运动机构</a>
                        <div class="tableInfo">
                            <el-table :data="motors">
                                <el-table-column prop="slot" label="飞拍接口">
                                </el-table-column>
                                <el-table-column prop="name" label="别名">
                                </el-table-column>
                                <el-table-column prop="speed" label="速度(Hz)">
                                </el-table-column>
                                <el-table-column prop="acceleration" label="加速度(ms)">
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-col>
                    <el-col :span="24">
                        <a class="title">执行机构(吹气电磁阀)</a>
                        <div class="tableInfo">
                            <el-table :data="executors">
                                <el-table-column prop="slot" label="飞拍接口">
                                </el-table-column>
                                <el-table-column prop="name" label="别名">
                                </el-table-column>
                                <el-table-column prop="executing_time" label="动作时间(ms)">
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-col>
                    <el-col :span="24">
                        <a class="title">三色灯</a>
                        <div>已开启</div>
                    </el-col>
                    <el-col :span="24">
                        <a class="title">振动上料器</a>
                        <!-- 直振、圆振 -->
                        <div class="feeder-info"><a>直振:</a><span>{{ formInline.enable_straight_feeder }}</span></div>
                        <div class="feeder-info"><a>圆振:</a><span>{{ formInline.enable_circle_feeder }}</span></div>
                    </el-col>
                    <el-col :span="24">
                        <a class="title">急停开关</a>
                        <div>{{ formInline.enable_stop_switch }}</div>
                    </el-col>
                    <el-col :span="24">
                        <a class="title">气压报警</a>
                        <div>{{ formInline.enable_pressure_alarm }}</div>
                    </el-col>
                </el-row>
            </div>
        </div>
        <div class="rightBox">
            <div class="rightTop">
                <a class="title">硬件连接状态</a>
                <div class="move">
                    <span :class="state == true ? 'ok' : 'no'">{{ stateTitle }}</span>
                    <a @click="submit">连接飞拍</a>
                </div>
            </div>
            <div class="rightBottom">
                <el-card class="box-card">
                    <a class="title">飞拍控制器信息设置</a>
                    <div class="formClass">
                        <el-form :model="formInline" :rules="rules" ref="formInline" label-width="60px">
                            <el-row type="flex" align="middle" :gutter="10">
                                <el-col :span="12">
                                    <el-form-item label="编号:" prop="number">
                                        <el-input type="number" min="1" max="10" v-model="formInline.number"
                                            @input="handleInput" clearable></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="串口号:" prop="port">
                                        <el-select v-model="formInline.port" style="float: left;" clearable
                                            @visible-change="handleVisibleChange">
                                            <el-option v-for="(item, index) in list_ports" :key="index" :label="item"
                                                :value="item">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script>
import { list_ports, version, save_ctlr, delete_ctlr, query_ctlr_bindings, query_feeder, query_alarm } from "@/api/register.js";
export default {
    name: 'config',
    data() {
        return {
            ctlr_id: this.$route.query.id,
            state: false,
            stateTitle: '',
            active: true,
            formInline: {
                number: this.$route.query.number,
                port: this.$route.query.port,
                enable_straight_feeder: null,
                enable_circle_feeder: null,
                enable_stop_switch: null,
                enable_pressure_alarm: null
            },
            rules: {
                number: [
                    { required: true, message: '请输入正确编号', trigger: 'blur', pattern: /^[1-9]|10$/ }
                ]
            },
            cameraList: [{
                value: '选项1',
                label: '上外观相机'
            }, {
                value: '选项2',
                label: '下外观相机'
            }, {
                value: '选项3',
                label: '所有相机'
            }],
            list_ports: [],
            cameras: [],
            lights: [],
            stations: [],
            motors: [],
            executors: []
        }
    },
    watch: {
        $route(to, from) {
            this.ctlr_id = this.$route.query.id
            this.formInline = {
                number: this.$route.query.number,
                port: this.$route.query.port
            }
            this.initData()
        },
    },
    mounted() {
        this.initData()
        this.queryFeeder()
        this.queryAlarm()
    },
    methods: {
        //初始化
        initData() {
            this.list_ports = []
            this.cameras = []
            this.lights = []
            this.stations = []
            this.motors = []
            this.executors = []
            let parma = { id: Number(this.ctlr_id) }//Number(this.ctlr_id)
            console.log('this.ctlr_id', this.ctlr_id);
            if (this.formInline.number && parma.id !== 0) {
                query_ctlr_bindings(parma).then((res) => {
                    if (res) {
                        this.cameras = res.cameras
                        this.lights = res.lights
                        this.stations = res.stations
                        this.motors = res.motors
                        this.executors = res.executors
                    }
                })
            }
        },
        //查询上料器
        queryFeeder() {
            let parma = { ctlr_id: Number(this.ctlr_id) }
            query_feeder(parma).then((res) => {
                this.formInline.enable_straight_feeder = res.enable_straight_feeder ? '开启' : '关闭'
                this.formInline.enable_circle_feeder = res.enable_circle_feeder ? '开启' : '关闭'
            })
        },
        //查询报警
        queryAlarm() {
            query_alarm({ ctlr_id: this.ctlr_id }).then(res => {
                this.formInline.enable_stop_switch = res.enable_emergency_stop ? '开启' : '关闭'
                this.formInline.enable_pressure_alarm = res.enable_low_pressure ? '开启' : '关闭'
            })
        },
        //删除
        handleDelete() {
            let parma = { id: this.ctlr_id }
            this.$confirm('确定永久删除此硬件?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                delete_ctlr(parma).then(() => {
                    this.$message.success('删除成功！')
                    this.$baseEventBus.$emit("$Bus_delete", this.ctlr_id);
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消'
                });
            });
        },
        async handleVisibleChange(visible) {
            if (visible) {
                const data = await list_ports();
                this.list_ports = data;
            }
        },
        //保存
        submit() {
            let that = this
            this.$refs["formInline"].validate(valid => {
                if (valid) {
                    that.save()
                } else {
                    return false;
                }
            });
        },
        async save() {
            let parma = { name: this.formInline.port };
            let parme = { id: Number(this.ctlr_id), number: Number(this.formInline.number), port: this.formInline.port }
            const data = await version(parma);
            if (this.$route.query.id == 0) {
                parme.id = null;
            } else {
                parme.id = Number(this.ctlr_id);
            }
            if (data) {
                this.formInline.version = data
                save_ctlr(parme).then(() => {
                    this.$message.success('连接成功！');
                    this.state = true
                    this.stateTitle = this.state ? '连接成功' : '连接失败'
                    this.$baseEventBus.$emit("$Bus_ctlr", 'true');
                })
            }
        },
        //工位光源
        lightData(ids) {
            let ligthsName = ids.map(item => item.name).join('、');
            return ligthsName;
        },
        //校验
        handleInput(value) {
            if (isNaN(value) || value < 1 || value > 10 || value == 'e') {
                this.formInline.number = null;
            }
        },
    },
}
</script>

<style lang="scss">
.config-container-register {
    display: flex;
    width: calc(100% - 1.2rem);
    height: calc(100vh - 0.26rem);

    .leftBox {
        flex: 1;
        padding: 28px;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;

        .leftBox-container {
            flex: 1;
            max-height: calc(100vh - 110px);
            overflow-y: auto;
            background: #FFF;
            border-radius: 10px;
            padding: 28px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;

            .el-col-24 {
                margin-bottom: 30px;
                position: relative;
            }

            .btn {
                position: absolute;
                top: 10px;
                right: 5px;

                .el-button {
                    font-size: 14px;
                    font-weight: bold;
                    background: #000000;
                    color: #fff;
                    padding: 8px 30px;
                    text-align: center;
                    border-radius: 12px;
                    cursor: pointer;
                }

                .run {
                    background: #000000;
                }

                .stop {
                    background: #f0f0f0;
                }
            }

            .info {
                padding-left: 10px;

                li {
                    height: 30px;
                    line-height: 30px;
                }
            }
        }
    }

    .rightBox {
        width: 781px;
        height: 100%;
        padding: 28px;
        display: flex;
        flex-direction: column;
        background: #fff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #87a848;
        box-shadow: 0 10px 10px rgba($color: #000000, $alpha: 0.3);

        .rightTop {
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .move {
                height: 400px;
                line-height: 400px;
                text-align: center;
                border: 1px solid #b3b2b2;
                border-radius: 5px;
                position: relative;
                padding: 10px;

                span {
                    font-size: 18px;
                    font-weight: bold;
                }

                .ok {
                    color: #87a848;
                }

                .no {
                    color: #FF0000;
                }

                a {
                    height: 30px;
                    line-height: 30px;
                    display: inline-block;
                    font-size: 22px;
                    font-weight: bolder;
                    cursor: pointer;
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    color: #87a848;
                }
            }
        }

        .rightBottom {
            min-height: calc(100vh - 635px);
            // max-height: calc(100vh - 200px);
            margin-top: 20px;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .el-card {
                border-radius: 10px !important;
                border: none !important;
                box-shadow: none !important;

                .formClass {
                    margin-top: 10px;

                    .el-form {
                        .el-form-item {
                            display: flex;
                            justify-content: flex-start;
                            align-items: flex-start;

                            .el-form-item__label {
                                width: auto !important;
                            }

                            .el-form-item__content {
                                margin-left: 0px !important;
                            }

                        }
                    }
                }
            }
        }
    }

    .tableInfo {
        ::v-deep .el-table tr {
            background-color: transparent !important;
            border: 0;
        }

        ::v-deep .el-table th {
            background-color: transparent !important;
            border: 0;
        }


    }

    .title {
        color: #000000;
        padding: 5px;
        line-height: 30px;
        font-size: 18px;
        font-weight: 900;
    }

    .feeder-info {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 10px;

        a {
            display: inline-block;
        }

        span {
            display: inline-block;
            margin-left: 10px;
        }
    }
}
</style>
