<template>
    <div class="config-container-station">
        <div class="station">
            <div class="station-img">
                <a class="title">已注册硬件</a>
                <div class="station-img-content">
                    <el-table ref="cameraTable" :data="cameras" @current-change="handleCurrentChange"
                        highlight-current-row :row-class-name="cameraRowClassName" height="433">
                        <el-table-column label="绑定">
                            <template slot-scope="scope">
                                <i class="el-icon-circle-check" v-if="scope.row.state"></i>
                                <i v-else></i>
                            </template>
                        </el-table-column>
                        <el-table-column prop="slot" label="飞拍接口">
                        </el-table-column>
                        <el-table-column prop="name" label="相机名称">
                        </el-table-column>
                    </el-table>
                    <div class="line"></div>
                    <el-table :data="lights" height="433">
                        <el-table-column label="绑定">
                            <template slot-scope="scope">
                                <span class="bind" v-if="scope.row.state">{{ cameraData(scope.row.camera_id)
                                    }}</span>
                                <span v-else></span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="slot" label="飞拍接口">
                        </el-table-column>
                        <el-table-column prop="name" label="光源名称">
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <div class="station-list">
                <a class="title">工位总览表</a>
                <div class="station-table">
                    <el-table ref="stationTable" :data="tableData" height="500" @row-click="handleRowClick"
                        :highlight-current-row="true" :row-class-name="tableRowClassName">
                        <el-table-column width="50">
                            <template slot-scope="scope">
                                <i class="el-icon-remove-outline" @click="handleDelete(scope.$index, scope.row)"></i>
                            </template>
                        </el-table-column>
                        <el-table-column width="100" type="index" label="序号">
                        </el-table-column>
                        <el-table-column prop="name" label="工位名称">
                        </el-table-column>
                        <el-table-column prop="camera_id" label="相机名称">
                            <template slot-scope="scope">
                                <span>{{ cameraData(scope.row.camera_id) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="light_ids" label="光源名称">
                            <template slot-scope="scope">
                                <span>{{ lightData(scope.row.light_ids) }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <div class="station-config">
            <div class="station-config-video">
                <a class="title">实时调试视图</a>
                <div class="station-config-img">
                    <img :src="stationUrl" />
                    <span class="no"></span>
                </div>
                <div class="station-config-img-btn">
                    <el-button :disabled="isDisabled" v-if='active' @click="run">
                        <i class='el-icon-video-play'></i>
                    </el-button>
                    <el-button :disabled="isDisabled" v-else @click="closeWebSocket">
                        <i class='iconfont icon-lbzntingzhi1'></i>
                    </el-button>
                    <!-- <el-button :disabled="!isUpdateStation" @click="saveStationImg">
                        <i class="iconfont icon-lbznbaocuntupian" style="color: #000000"></i>
                    </el-button> -->
                </div>
            </div>
            <div class="station-config-content">
                <el-form :model="formInline" :rules="rules" ref="formInline">
                    <div class="station-config-header">
                        <div class="header-title">
                            <a>工位别名：</a>
                            <el-input v-model="formInline.name" size="small" :disabled="!isCurrent"></el-input>
                        </div>
                        <div class="station-config-submit">
                            <el-button plain @click="submit">保存</el-button>
                        </div>
                    </div>
                    <div class="formClass">
                        <el-tabs v-model="activeName" type="card">
                            <el-tab-pane label="相机" name="first">
                                <el-form-item label="飞拍接口：">{{ camera_slot
                                    }}</el-form-item>
                                <el-form-item label="相机  IP：">{{ cameraIP
                                    }}</el-form-item>
                                <el-form-item label="相机增益：" prop="camera_gain">
                                    <el-input-number size="medium" v-model="formInline.camera_gain"
                                        @input="changeSliderValue" @change="changeSliderValue"
                                        :disabled="!isCurrent"></el-input-number>dB
                                </el-form-item>
                                <el-form-item label="曝光时间：" prop="camera_exposure_time">
                                    <el-input-number size="medium" v-model="formInline.camera_exposure_time"
                                        @input="changeSliderValue" @change="changeSliderValue"
                                        :disabled="!isCurrent"></el-input-number>ms
                                </el-form-item>
                            </el-tab-pane>
                            <el-tab-pane label="光源" name="second">
                                <div>
                                    <div class="ligthform">
                                        <div v-for="(item, index) in formInline.lights" :key="index" class="formitem">
                                            <i class="el-icon-remove-outline" @click="deleteItem(item, index)"></i>
                                            <el-form-item label="" :prop="'lights.' + index + '.id'"
                                                :rules="[{ required: true, message: '请选择光源', trigger: 'blur' }]">
                                                <el-select v-model="item.id" placeholder="请选择" @change="paramItemChange"
                                                    :disabled="item.id != '' || !isCurrent">
                                                    <el-option v-for="(list, index) in showList(item.id)" :key="index"
                                                        :label="list.name" :value="list.id">
                                                    </el-option>
                                                </el-select>
                                                <el-slider v-model="item.brightness" :min="1" :max="250" :marks="marks"
                                                    show-input @change="changeSliderValue" @input="changeSliderValue"
                                                    :disabled="!isCurrent"></el-slider>
                                            </el-form-item>
                                        </div>
                                    </div>
                                    <div class="create-btn-flow">
                                        <div style="display: flex; align-items: center;">
                                            <i class="el-icon-circle-plus-outline" @click="addItem()"></i> 为工位绑定光源
                                        </div>
                                    </div>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </el-form>
            </div>
        </div>
        <RemoveDialog :removeDialogVisible="isShowDialog" :removeData="removeMessage"></RemoveDialog>
    </div>
</template>

<script>
import { query_stations, save_station, delete_station, updateStation, query_station_associations, query_could_save_station, save_station_img } from "@/api/register.js";
import {
    startTrialRuningStation,
    stopTrialRuningStation,
} from "@/api/workflowConfig";
import { removeEmptyFields, EventSourceUrl } from "../../utils/index";
import RemoveDialog from "./removeHardwareComponent/index.vue";
export default {
    name: 'config',
    components: {
        RemoveDialog
    },
    data() {
        return {
            marks: {
                1: '1',
                250: '250',
            },
            stationUrl: null,
            ctlr_id: this.$route.query.id,
            isCurrent: false,
            WebSocket: null,
            lightVal: 0,
            state: '',
            active: true,
            activeName: 'first',
            cameraIP: '',
            camera_id: '',
            camera_slot: '',
            currentRunStationIp: null,
            isDisabled: false,
            isUpdateStation: false,
            isShowDialog: false,
            removeMessage: {},
            selectedRow: null,
            selectedCamera: null,
            formInline: {
                id: null,
                name: null,
                camera_id: null,
                camera_gain: null,
                camera_exposure_time: null,
                lights: [
                    {
                        id: "",
                        brightness: 1,
                    }
                ],
            },
            rules: {
                name: [
                    { required: true, message: '请输入工位别名', trigger: 'blur' }
                ],
                camera_gain: [
                    { required: true, message: '请输入相机增益', trigger: 'blur', pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/ }
                ],
                camera_exposure_time: [
                    { required: true, message: '请输入正确曝光时间', trigger: 'blur', pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/ }
                ]
            },
            cameras: [],
            lights: [],
            filteLights: [],
            tableData: [],
        }
    },
    mounted() {
        this.initData();
    },
    computed: {
        showList() {
            return (value) => {
                let newList = JSON.parse(JSON.stringify(this.filteLights));
                const arr = this.formInline.lights.map(item => {
                    return (item = item.id);
                });
                let newListData = newList.filter(item => {
                    if (value == item.id) {
                        return item;
                    }
                    else {
                        if (arr.indexOf(item.id) == -1) {
                            return item;
                        }
                    }
                });
                return newListData;
            };
        }
    },
    methods: {
        //初始化
        initData() {
            this.activeName = 'first';
            // 重置选中状态
            this.selectedRow = null;
            this.selectedCamera = null;
            this.isCurrent = false;

            // 清除表格高亮
            if (this.$refs.stationTable) {
                this.$refs.stationTable.setCurrentRow(null);
            }

            if (this.$refs.cameraTable) {
                this.$refs.cameraTable.setCurrentRow(null);
            }

            let params = { ctlr_id: this.ctlr_id }
            query_stations(params).then((res) => {
                let cameras = res.cameras
                let lights = res.lights
                res.stations.map((station) => {
                    cameras.map((camera) => {
                        if (station.camera_id == camera.id) {
                            this.$set(camera, 'state', true)
                        }
                    })
                })
                res.stations.map((station) => {
                    lights.map((light) => {
                        if (station.light_ids.includes(light.id)) {
                            this.$set(light, 'state', true)
                            this.$set(light, 'camera_id', station.camera_id)
                        }
                    })
                })
                this.cameras = cameras;
                this.lights = lights;
                this.filteLights = lights
                this.tableData = res.stations;
                this.formInline = {
                    id: null,
                    name: null,
                    camera_id: null,
                    camera_gain: null,
                    camera_exposure_time: null,
                    lights: [
                        {
                            id: "",
                            brightness: 1,
                        }
                    ],
                }
            })
        },
        //选中当前行
        handleCurrentChange(value) {
            if (value) {
                // 更新选中的相机
                this.selectedCamera = value;
                this.isCurrent = true
                this.cameraIP = value.ip
                this.camera_id = value.id
                this.camera_slot = value.slot
                this.formInline.camera_id = value.id;
                this.formInline.camera_gain = value.gain
                this.formInline.camera_exposure_time = value.exposure_time
                let currentStation = this.tableData.find(item => item.camera_id === value.id);
                if (currentStation) {
                    this.formInline.id = currentStation.id;

                    // 更新表格选中状态
                    this.selectedRow = currentStation;
                    this.$nextTick(() => {
                        if (this.$refs.stationTable) {
                            this.$refs.stationTable.setCurrentRow(currentStation);
                        }
                    });
                } else {
                    this.formInline.id = undefined;
                    // 清除表格选中状态
                    this.selectedRow = null;
                    this.$nextTick(() => {
                        if (this.$refs.stationTable) {
                            this.$refs.stationTable.setCurrentRow(null);
                        }
                    });
                }
                if (value.state) {
                    let lightData = []
                    let light_ids = this.tableData.filter(item => item.camera_id == value.id)[0].light_ids
                    this.lights.forEach(item => {
                        light_ids.forEach(e => {
                            if (item.id == e) {
                                lightData.push(item)
                            }
                        })
                    })
                    this.filteLights = this.lights
                    this.formInline.lights = lightData
                    this.formInline.name = this.tableData.filter(item => item.camera_id == value.id)[0].name
                } else {
                    let arrData = []
                    let filteLights = []
                    this.tableData.forEach(item => {
                        item.light_ids.forEach(i => {
                            arrData.push(i)
                        })
                    })
                    this.filteLights.forEach(item => {
                        if ([...new Set(arrData)].indexOf(item.id) == -1) {
                            filteLights.push(item)
                        }
                    })
                    this.formInline.lights = [{
                        id: "",
                        brightness: 1,
                    }]
                    this.filteLights = filteLights
                    this.formInline.name = value.name + '工位'
                }
            }
        },
        // 表格行点击事件
        handleRowClick(row) {
            // 更新选中行
            this.selectedRow = row;

            // 找到对应的相机
            const camera = this.cameras.find(cam => cam.id === row.camera_id);

            if (camera) {
                // 更新选中的相机
                this.selectedCamera = camera;

                // 手动设置表格当前行
                this.$nextTick(() => {
                    // 更新工位表格选中行
                    if (this.$refs.stationTable) {
                        this.$refs.stationTable.setCurrentRow(row);
                    }

                    // 更新相机表格选中行
                    if (this.$refs.cameraTable) {
                        this.$refs.cameraTable.setCurrentRow(camera);
                    }
                });

                // 模拟点击对应的相机，同步左侧视图和表单数据
                this.handleCurrentChange(camera);
            }
        },
        // 表格行类名方法
        tableRowClassName({ row, rowIndex }) {
            if (this.selectedRow && row.id === this.selectedRow.id) {
                return 'selected-row';
            }
            return '';
        },
        // 相机表格行类名方法
        cameraRowClassName({ row, rowIndex }) {
            if (this.selectedCamera && row.id === this.selectedCamera.id) {
                return 'selected-row';
            }
            return '';
        },
        //光源亮度值变化
        changeSliderValue: _.debounce(function (value) {
            if (!this.active && this.isUpdateStation && this.formInline.lights && this.formInline.lights.every(light => light.slot !== '')) {
                let updateLightsPamars = this.formInline.lights.map(item => {
                    return {
                        "slot": item.slot,
                        "brightness": item.brightness
                    }
                })
                updateStation({
                    "camera": {
                        "exposure_time": this.formInline.camera_exposure_time,
                        "gain": this.formInline.camera_gain
                    },
                    "lights": updateLightsPamars
                }).then(res => {
                    this.$message.success('工位参数更新成功！')
                })
            }
        }, 300),
        //切换光源
        paramItemChange() {
            let arr1 = JSON.parse(JSON.stringify(this.filteLights));
            let arr2 = this.formInline.lights.map(item => {
                // 在 arr1 中查找具有相同 id 的对象
                let foundItem = arr1.find(item1 => item1.id === item.id);
                // 如果找到了，返回一个新的对象，只包含 id 和 brightness
                if (foundItem) {
                    return foundItem
                }
                return undefined;
            }).filter(item => item !== undefined);
            this.formInline.lights = [...arr2];
        },
        cameraData(id) {
            return id != '' ? this.cameras.filter(item => item.id == id)[0].name : ""
        },
        lightData(ids) {
            let arr = []
            if (ids.length > 0) {
                this.lights.forEach(item => {
                    ids.forEach(e => {
                        if (item.id == e) {
                            arr.push(item.name)
                        }
                    })
                });
                return arr.join("、")
            }
        },
        //光源添加
        addItem() {
            this.formInline.lights.push(
                {
                    "brightness": 1,
                    "id": '',
                    "lighting_time": '',
                    "name": '',
                    "slot": '',
                    "state": true,
                    "camera_id": ''
                }
            );
        },
        //光源删除
        deleteItem(item, index) {
            if (this.formInline['lights'].length <= 1) {
                this.$message({
                    type: 'warning',
                    message: '必须保留一条光源！'
                });
                return false;
            }
            this.formInline.lights.splice(index, 1);
        },
        //工位删除
        handleDelete(index, row) {
            let params = { id: row.id };
            //查询工位是否可删除
            query_station_associations(params).then(res => {
                if (res.workflows && res.workflows.length == 0) {
                    this.$confirm('确定要删除此工位?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        delete_station(params).then(() => {
                            this.initData()
                            this.$message.success('工位删除成功！')
                            this.tableData.splice(index, 1);
                        })
                    });
                } else {
                    this.isShowDialog = false;
                    this.removeMessage = {};
                    this.$nextTick(() => {
                        this.isShowDialog = true;
                        this.removeMessage = res;
                        this.removeMessage.ctlrId = this.ctlr_id;
                        this.removeMessage.removeId = row.id;
                        this.removeMessage.removeType = 'Station';
                    });
                    return;
                }
            });
        },
        //保存
        submit() {
            if (this.isCurrent) {
                let saveLightsParams = this.formInline.lights.map(item => {
                    return {
                        id: item.id,
                        brightness: item.brightness
                    }
                })
                let params = {
                    id: this.formInline.id,
                    ctlr_id: Number(this.ctlr_id),
                    name: this.formInline.name,
                    camera_id: this.formInline.camera_id,
                    camera_gain: Number(this.formInline.camera_gain),
                    camera_exposure_time: Number(this.formInline.camera_exposure_time),
                    lights: saveLightsParams
                };
                this.$refs["formInline"].validate(valid => {
                    if (valid) {
                        //查询是否可以保存工位
                        let couldSaveParams = {
                            id: this.formInline.id,
                            ctlr_id: Number(this.ctlr_id),
                            camera_id: this.formInline.camera_id,
                            light_ids: this.formInline.lights.map(item => item.id),
                        }
                        query_could_save_station(couldSaveParams).then(res => {
                            if ((res.camera && res.camera.station == null && res.camera.workflows.length == 0) &&
                                (res.lights && res.lights.length !== 0 && res.lights.every(light => light.offset === null && light.station === null))) {
                                save_station(removeEmptyFields(params)).then(() => {
                                    this.initData()
                                    this.$message.success('工位保存成功！')
                                    this.isUpdateStation = false;
                                    this.$refs["formInline"].resetFields()
                                })
                            } else {
                                if (res.camera && res.camera.station != null) {
                                    this.$message.warning(`相机已绑定工位：【${res.camera.station.name}】，请先解绑！`)
                                }
                                if (res.camera && res.camera.workflows && res.camera.workflows.length !== 0) {
                                    this.$message.warning(`相机已绑定工作流：【${res.camera.workflows.map(item => item.work_config_name).join('、')}】，请先解绑！`)
                                }
                                if (res.lights && res.lights.length !== 0 && res.lights.some(light => light.station !== null)) {
                                    this.$message.warning(`光源已绑定工位：${res.lights.filter(item => item.station !== null).map(item => `【${item.station.name}中的${item.name}】`).join('、')}，请先解绑！`)
                                }
                                if (res.lights && res.lights.length !== 0 && res.lights.some(light => light.offset !== null)) {
                                    this.$message.warning(`光源已绑定触发距离：${res.lights.filter(item => item.offset !== null).map(item => `【${item.name}：${item.offset}】`).join('、')}，请先解绑！`)
                                }
                            }
                        })
                    } else {
                        return false;
                    }
                });
            } else {
                this.$message.warning('请选择相机绑定！')
                return
            }
        },
        //试运行
        run() {
            if (this.isCurrent) {
                //试运行工位
                this.isDisabled = true;
                let runLightsParams = this.formInline.lights.map(item => {
                    return {
                        id: item.id,
                        slot: item.slot,
                        brightness: item.brightness
                    };
                });
                let startinfo = {
                    ctlr_id: Number(this.ctlr_id),
                    camera_ip: this.cameraIP,
                    camera_slot: this.camera_slot,
                    camera_exposure_time: this.formInline.camera_exposure_time,
                    camera_gain: this.formInline.camera_gain,
                    lights: runLightsParams,
                };
                startTrialRuningStation(JSON.stringify(startinfo)).then((res) => {
                    this.active = false;
                    this.$message.success('工位试运行成功！')
                    this.isUpdateStation = true;
                    this.currentRunStationIp = startinfo.camera_ip;
                }).finally((res) => {
                    this.isDisabled = false;
                });
            } else {
                this.$message.warning('请选择工位！')
                return
            }
            this.stationUrl = `${EventSourceUrl}/view?ip=` + this.cameraIP;
        },
        closeWebSocket() {
            if (!this.active) {
                stopTrialRuningStation().then((res) => {
                    this.$message.success('工位试运行已关闭！');
                    this.active = true;
                    this.isUpdateStation = false;
                    this.currentRunStationIp = null;
                }).finally((res) => {
                    this.isDisabled = false;
                });
            }
        },
        //保存工位图片
        saveStationImg() {
            if (this.cameraIP !== '') {
                save_station_img({
                    ip: this.cameraIP,
                }).then((res) => {
                    this.$message.success("保存图片成功");
                });
            } else {
                this.$message.warning('请选择相机绑定！')
                return
            }
        }
    },
    beforeDestroy() {
        if (this.active == false) {
            this.closeWebSocket();
        }
    }
}
</script>

<style lang="scss">
.config-container-station {
    height: calc(100vh - 90px);
    padding: 0px 0px 0px 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .station {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;

        .station-img {
            flex: 1;

            .station-img-content {
                width: 768px;
                max-width: 768px;
                overflow-x: auto;
                padding: 20px;
                display: flex;
                flex-direction: row;
                background-size: 100%;
                position: relative;

                .el-table {
                    min-height: 433px !important;
                    max-height: 430px !important;
                    background: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
                    color: #343434;

                    .el-table__body tr.current-row>td.el-table__cell {
                        background-color: #8cb24b !important;
                    }

                    .bind {
                        display: inline-block;
                        padding: 2px 5px;
                        height: 20px;
                        line-height: 20px;
                        border-radius: 4px;
                        text-align: center;
                        background: #A4ADB3;
                        font-size: 12px;
                        color: #fff;
                    }
                }

                .line {
                    height: 380px;
                    border-left: 1px dashed #BBBBBB;
                    margin: 20px;
                }
            }
        }

        .station-list {
            flex: 1;
            display: flex;
            flex-direction: column;

            .station-table {
                width: 768px;
                max-width: 768px;
                // min-height: calc(100vh - 690px);
                // max-height: calc(100vh - 690px);
                overflow-x: auto;
                padding: 20px;
                background: #ffffff;
                border-radius: 10px;
                box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

                .el-table {
                    max-height: calc(100vh - 695px) !important;

                    .cell {
                        font-size: 14px !important;
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

    .station-config {
        height: 100vh;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 10px 20px;
        background: #ffffff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #87a848;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .station-config-video {
            display: flex;
            flex-direction: column;
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
            margin-bottom: 20px;

            .station-config-img {
                height: 380px;
                margin-bottom: 10px;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
            }

            .station-config-img-btn {
                margin-left: auto;
                display: flex;
                flex-direction: row;
                align-items: center;

                .el-button {
                    border: none;
                    padding: 0 12px 0px 0px;
                    margin-left: auto;

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

                    span {
                        i {
                            margin-left: auto;
                            font-size: 24px;
                        }
                    }
                }
            }

        }

        .station-config-content {
            min-height: calc(100vh - 660px);
            max-height: calc(100vh - 660px);
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .station-config-header {
                display: flex;
                flex-direction: row;

                .header-title {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;

                    a {
                        display: flex;
                        width: 150px;
                        color: #000000;
                        font-size: 18px;
                        font-weight: 900;
                    }
                }

                .station-config-submit {
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

            .formClass {
                margin-top: 10px;

                .el-tabs__item.is-active,
                .el-tabs__item:hover {
                    color: #87a848 !important;
                }

                .ligthform {
                    min-height: calc(100vh - 840px);
                    max-height: calc(100vh - 840px);
                    overflow-y: auto;

                    .formitem {
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                        align-items: center;

                        .el-icon-remove-outline {
                            margin-right: 10px;
                            margin-bottom: 20px;
                        }
                    }
                }

                .create-btn-flow {
                    flex: 1;
                    display: flex;
                    align-items: flex-start;
                    color: rgba(154, 154, 154, 1);
                    font-size: 16px;
                    margin-top: 20px;
                    margin-bottom: 20px;

                    .el-icon-circle-plus-outline {
                        font-size: 32px;
                        color: #BEBEBE;
                        cursor: pointer;
                        margin-right: 7px;
                    }
                }


            }


            .el-form {
                display: flex;
                flex-direction: column;
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
                        color: #343434;
                    }

                    .el-form-item__content {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;

                        .el-select {
                            width: 180px !important;
                            margin-right: 20px;
                        }

                        .el-input {
                            width: 180px !important;
                        }

                        .el-slider__runway {
                            margin-right: 250px !important;
                            width: 230px !important;

                            .el-slider__bar {
                                background-color: #87a848 !important;
                            }

                            .el-slider__button-wrapper {
                                .el-slider__button {
                                    border: 2px solid #779340 !important;
                                }
                            }
                        }

                        .el-slider__input {
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

                        .el-input-number--small {
                            line-height: 36px !important;
                        }

                        .el-input-number--medium {
                            width: 180px !important;
                            line-height: 31px !important;

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
