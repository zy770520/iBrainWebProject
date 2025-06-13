<template>
    <div class="config-container-system">
        <div class="system">
            <div class="system-img">
                <a class="title">触发总览表</a>
                <div>
                    <el-button @click="saveSystemParams">保存</el-button>
                </div>
            </div>
            <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
                <el-tab-pane label="触发位置" name="first">
                    <div class="system-list" v-show="activeName === 'first'">
                        <div class="system-table">
                            <el-table :data="tableData" ref="tableRef" @current-change="handleCurrentChange"
                                highlight-current-row :row-class-name="getRowClassName">
                                <el-table-column width="30">
                                    <template slot-scope="scope">
                                        <i class="el-icon-remove-outline"
                                            @click="handleDelete(scope.$index, scope.row)"></i>
                                    </template>
                                </el-table-column>
                                <el-table-column label="序号" width="70" type="index">
                                </el-table-column>
                                <el-table-column prop="name" label="触发设备">
                                </el-table-column>
                                <el-table-column prop="offset" label="触发位置">
                                </el-table-column>
                                <el-table-column prop="type" label="触发位置类型">
                                    <template slot-scope="scope">
                                        <span>{{
                                            scope.row.type === 'Camera' ? '相机' :
                                                scope.row.type === 'Light' ? '光源' :
                                                    scope.row.type === 'Station' ? '工位' :
                                                        scope.row.type === 'Executor' ? '电磁阀' :
                                                            scope.row.type
                                        }}</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <div class="create-btn-flow">
                            <div style="display: flex; align-items: center;">
                                <i class="el-icon-circle-plus-outline" @click="handleAdd()"></i> 新增触发设备
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="高级参数" name="second">
                    <div class="seniorParams" v-show="activeName === 'second'">
                        <el-form :model="seniorParamsForm" :rules="seniorFormRules" ref="seniorForm">
                            <div class="abnormal-formula">
                                <a>零件运动线速度</a>
                                <div class="abnormal-formula-item">
                                    <div class="abnormal-formula-item-children">
                                        <div>
                                            零件运动线速度 =
                                            <span style="color: #BBBBBB;">{{ ((formulaParamsForm.motorSpeed /
                                                seniorParamsForm.motor_drive_step
                                                /
                                                seniorParamsForm.reduction_ratio * Math.PI *
                                                seniorParamsForm.diameter) || 0).toFixed(2) }}mm/s
                                            </span>
                                        </div>
                                        <div>
                                            <span>步进电机转速&nbsp;&nbsp;&nbsp;&nbsp;/</span>
                                            <span><el-input-number v-model="formulaParamsForm.motorSpeed"
                                                    :disabled="true" :controls="false"
                                                    :precision="2"></el-input-number>Hz
                                            </span>
                                        </div>
                                        <div>
                                            <span>电机驱动器步数设置&nbsp;&nbsp;/</span>
                                            <span><el-input-number v-model="seniorParamsForm.motor_drive_step"
                                                    :controls="false" :precision="2"></el-input-number>
                                            </span>
                                        </div>
                                        <div>
                                            <span>减速机减速比&nbsp;&nbsp;*&nbsp;π&nbsp;*&nbsp;&nbsp;</span>
                                            <span><el-input-number v-model="seniorParamsForm.reduction_ratio"
                                                    :controls="false" :precision="2"></el-input-number>
                                            </span>
                                        </div>
                                        <div>
                                            <span>玻璃盘直径&nbsp;&nbsp;</span>
                                            <span><el-input-number v-model="seniorParamsForm.diameter" :controls="false"
                                                    :precision="2"></el-input-number>mm
                                            </span>
                                        </div>
                                    </div>
                                    <!-- <div class="abnormal-formula-item-children">
                                            <div>
                                                过长零件 =
                                                <span style="color: #BBBBBB;">{{ ((formulaParamsForm.longParts /
                                                    formulaParamsForm.motorSpeed /
                                                    formulaParamsForm.motor_drive_step /
                                                    formulaParamsForm.reduction_ratio * Math.PI *
                                                    formulaParamsForm.diameter * 1000) || 0).toFixed(2) }}ms
                                                </span>
                                            </div>
                                            <div>
                                                <span>过长零件&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</span>
                                                <span><el-input-number v-model="formulaParamsForm.longParts"
                                                        :controls="false" :precision="2"></el-input-number>mm
                                                </span>
                                            </div>
                                            <div>
                                                <span>零件运动线速度&nbsp;&nbsp;*&nbsp;1000</span>
                                            </div>
                                        </div>
                                        <div class="abnormal-formula-item-children">
                                            <div>
                                                过短零件间隔 =
                                                <span style="color: #BBBBBB;">{{ ((formulaParamsForm.shortParts /
                                                    formulaParamsForm.motorSpeed /
                                                    formulaParamsForm.motor_drive_step /
                                                    formulaParamsForm.reduction_ratio * Math.PI *
                                                    formulaParamsForm.diameter * 1000) || 0).toFixed(2) }}ms
                                                </span>
                                            </div>
                                            <div>
                                                <span>过短零件间隔&nbsp;&nbsp;/</span>
                                                <span><el-input-number v-model="formulaParamsForm.shortParts"
                                                        :controls="false" :precision="2"></el-input-number>mm
                                                </span>
                                            </div>
                                            <div>
                                                <span>零件运动线速度&nbsp;&nbsp;*&nbsp;1000</span>
                                            </div>
                                        </div> -->
                                </div>
                            </div>
                            <div class="params-trigger">
                                <a>误触发保护功能</a>
                                <div class="trigger-form">
                                    <el-form-item label="使能:" prop="enable_false_triggering">
                                        <el-switch v-model="seniorParamsForm.enable_false_triggering"></el-switch>
                                    </el-form-item>
                                    <el-form-item label="起始时间:" prop="monitoring_start">
                                        <el-input-number :disabled="!seniorParamsForm.enable_false_triggering"
                                            v-model="seniorParamsForm.monitoring_start" :controls="false"
                                            :precision="0"></el-input-number>10us
                                    </el-form-item>
                                    <el-form-item label="终止时间:" prop="monitoring_end">
                                        <el-input-number :disabled="!seniorParamsForm.enable_false_triggering"
                                            v-model="seniorParamsForm.monitoring_end" :controls="false"
                                            :precision="0"></el-input-number>10us
                                    </el-form-item>
                                </div>
                            </div>
                            <div class="params-abnormal">
                                <a>零件异常过滤</a>
                                <div class="abnormal-form">
                                    <el-form-item label="过长零件:" prop="passage">
                                        <!-- <span v-if="isNaN(passage) || !isFinite(passage)">5000&nbsp;mm</span> -->
                                        <span>
                                            <el-input v-model="seniorParamsForm.passage"></el-input>mm</span>
                                    </el-form-item>
                                    <el-form-item label="过短零件间隔:" prop="interval">
                                        <!-- <span v-if="isNaN(interval) || !isFinite(interval)">1&nbsp;mm</span> -->
                                        <span>
                                            <el-input v-model="seniorParamsForm.interval"></el-input>mm</span>
                                    </el-form-item>
                                    <el-form-item label="零件频率:" prop="frame_rate">
                                        <el-input-number v-model="seniorParamsForm.frame_rate" :controls="false"
                                            :precision="2"></el-input-number>Hz
                                    </el-form-item>
                                </div>
                            </div>
                        </el-form>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="system-config">
            <div class="system-config-video" v-show="activeName === 'first'">
                <a class="title">硬件配置状态</a>
                <div class="system-config-img">
                    <img :src="imgUrl" />
                    <div class="lineClass"></div>
                </div>
                <div class="solenoid-config-run">
                    <div class="system-select">
                        <el-form :model="rateForm" :rules="rule" ref="rateForm">
                            <el-form-item prop="motorId" label="电机：">
                                <el-select v-model="rateForm.motorId" size="small" :disabled="true">
                                    <el-option v-for="(item, index) in motorsList" :key="index" :label="item.name"
                                        :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </div>
                    <i v-if='startRun' @click="triggerRun" class='el-icon-video-play'></i>
                    <i v-else @click="stopRun" class='iconfont icon-lbzntingzhi1'></i>
                </div>
            </div>
            <div class="system-config-content" v-show="activeName === 'first'">
                <div class="system-config-header">
                    <div class="title">触发设备配置</div>
                </div>
                <el-form :model="formInline" :rules="rules" ref="formInline">
                    <el-form-item label="触发设备：" prop="id">
                        <el-select v-model="paramValue" @change="paramItemChange" :disabled="!isCreate">
                            <el-option v-for="(item, index) in devicesList" :key="index" :label="item.name"
                                :value="item">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="触发位置：" prop="offset">
                        <el-input-number size="medium" v-model="formInline.offset" :min="10" :max="2500" :step="1"
                            @input="handleInput" :disabled="isDisabled" @change="handleInput"
                            @blur="handleBlur"></el-input-number>mm
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <RemoveDialog :removeDialogVisible="isShowDialog" :removeData="removeMessage"></RemoveDialog>
    </div>
</template>

<script>
import { query_motors, query_triggers, save_trigger, update_offset, list_trigger_devices, delete_offset, query_offset_associations } from "@/api/register.js";
import { WebSocketBaseUrl, EventSourceUrl } from "../../utils/index";
import RemoveDialog from "./removeHardwareComponent/index.vue";
export default {
    name: 'config',
    components: {
        RemoveDialog
    },
    data() {
        return {
            ctlr_id: this.$route.query.id,
            WebSocket: null,
            startRun: true,
            paramValue: null,
            imgUrl: null,
            currentRunCameraIp: null,
            hasUnsavedChanges: false,
            initialData: null, // 用于存储初始数据状态
            isShowDialog: false,
            removeMessage: {},
            formInline: {
                id: null,
                name: null,
                type: null,
                offset: 0,
            },
            rateForm: {
                motorId: null,
            },
            seniorParamsForm: {
                enable_false_triggering: false,//是否启用误触发
                monitoring_start: 190,//监控开始时间
                monitoring_end: 230,//监控结束时间
                passage: 5000,//零件通过传感器时间
                interval: 1,//传感器未感知到零件的时间
                frame_rate: 19,//零件中心点通过帧率
                motor_drive_step: 20000,//电机驱动器步数设置
                reduction_ratio: 20,//减速比
                diameter: 550,//玻璃盘直径
            },
            formulaParamsForm: {
                motorSpeed: 0,//步进电机转速
                motor_drive_step: 0,//步数设置
                reduction_ratio: 0,//减速比
                diameter: 0,//玻璃盘直径
                longParts: 0,//过长零件
                shortParts: 0,//过短零件
            },
            devicesList: [],
            motorsList: [],
            tableData: [],
            devicesDataInfo: [],
            isDisabled: true,
            isCreate: false,
            activeName: 'first',
            currentId: null,
            currentOffset: null,
            currentType: null,
            keepHighlight: false,
            currentRow: null, // 用于记录当前选中行
            rules: {
                id: [
                    { required: true, message: '请选择设备', trigger: 'blur' }
                ],
                offset: [
                    { required: true, message: '请输入触发位置', trigger: 'blur', pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/ }
                ]
            },
            rule: {
                motorId: [
                    { required: true, message: '请选择电机', trigger: 'blur' }
                ]
            },
            seniorFormRules: {
                monitoring_start: [
                    { required: true, message: '请输入起始时间', trigger: 'blur' }
                ],
                monitoring_end: [
                    { required: true, message: '请输入终止时间', trigger: 'blur' }
                ],
                frame_rate: [
                    { required: true, message: '请输入零件频率', trigger: 'blur' }
                ]
            }
        }
    },
    watch: {
        'formInline': {
            handler(newVal, oldVal) {
                if (oldVal && (newVal.offset !== oldVal.offset || newVal.name !== oldVal.name)) {
                    this.hasUnsavedChanges = true;
                }
            },
            deep: true
        },
        'tableData': {
            handler() {
                // 仅当初始数据已加载时才判断变化
                if (this.initialData) {
                    this.hasUnsavedChanges = this.checkUnsavedChanges();
                }
            },
            deep: true
        },
        'seniorParamsForm': {
            handler() {
                // 仅当初始数据已加载时才判断变化
                if (this.initialData) {
                    this.hasUnsavedChanges = this.checkUnsavedChanges();
                }
            },
            deep: true
        }
    },
    computed: {
        // passage: {
        //     get() {
        //         return this.formulaParamsForm.longParts / this.formulaParamsForm.motorSpeed / this.formulaParamsForm.motor_drive_step /
        //             this.formulaParamsForm.reduction_ratio * Math.PI * this.formulaParamsForm.diameter * 1000
        //     },
        //     set() {

        //     }
        // },
        // interval: {
        //     get() {
        //         return this.formulaParamsForm.shortParts / this.formulaParamsForm.motorSpeed / this.formulaParamsForm.motor_drive_step /
        //             this.formulaParamsForm.reduction_ratio * Math.PI * this.formulaParamsForm.diameter * 1000
        //     },
        //     set() {

        //     }
        // }
    },

    async mounted() {
        await this.initData();
        await this.getTriggerData();
        // 初始化完成后，保存初始状态
        this.initialData = {
            tableData: JSON.parse(JSON.stringify(this.tableData)),
            seniorParamsForm: JSON.parse(JSON.stringify(this.seniorParamsForm))
        };
    },
    methods: {
        //初始化
        async initData() {
            let params = { ctlr_id: this.ctlr_id };
            const motorsData = await query_motors(params);
            const devicesData = await list_trigger_devices(params);
            this.devicesDataInfo = devicesData;
            this.motorsList = motorsData.map((item) => {
                return {
                    id: item.id,
                    name: item.name
                }
            });
            if (this.motorsList.length > 0) {
                this.rateForm.motorId = this.motorsList[0].id;
                this.formulaParamsForm.motorSpeed = motorsData[0].speed;
            }
            this.devicesList = devicesData.map((deviceItem, index) => {
                return {
                    id: deviceItem.id,
                    name: deviceItem.name,
                    type: deviceItem.type,
                    ip: deviceItem.camera_info ? deviceItem.camera_info.ip : '',
                    value: index,
                    offset: 100,
                };
            });
            this.hasUnsavedChanges = false; // 重置未保存标记
        },
        // 检查是否有未保存的更改
        checkUnsavedChanges() {
            if (!this.initialData) return false;

            // 比较表格数据 - 使用更精确的比较方法
            const currentTableData = this.tableData.map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                offset: item.offset.toString()
            }));

            const initialTableData = this.initialData.tableData.map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                offset: item.offset.toString()
            }));

            // 比较高级参数 - 只比较重要字段
            const relevantParams = ['enable_false_triggering', 'monitoring_start', 'monitoring_end', 'frame_rate'];

            const hasTableChanges = JSON.stringify(currentTableData) !== JSON.stringify(initialTableData);
            console.log("🚀 ~ checkUnsavedChanges ~ 比较结果:", hasTableChanges)

            // 检查高级参数是否有变化
            let hasParamChanges = false;
            for (const param of relevantParams) {
                if (this.seniorParamsForm[param] !== this.initialData.seniorParamsForm[param]) {
                    hasParamChanges = true;
                    break;
                }
            }

            return hasTableChanges || hasParamChanges;
        },
        //获取已注册触发设备
        getTriggerData() {
            query_triggers({ ctlr_id: this.ctlr_id }).then((res) => {
                if (res) {
                    let { ctlr_id, devices, ...rest } = res;
                    this.seniorParamsForm = { ...rest };
                    if (res.devices.length > 0) {
                        let resDevices = res.devices;
                        if (this.devicesDataInfo.length > 0) {
                            let arr3 = resDevices.map(item2 => {
                                let matchedItem = this.devicesDataInfo.find(item => item.id === item2.id);
                                if (matchedItem && matchedItem.camera_info) {
                                    return {
                                        ...item2,
                                        ip: matchedItem.camera_info.ip
                                    };
                                }
                                return item2;
                            });
                            this.tableData = [...arr3];
                        }
                    }
                    // 更新初始数据
                    this.initialData = {
                        tableData: JSON.parse(JSON.stringify(this.tableData)),
                        seniorParamsForm: JSON.parse(JSON.stringify(this.seniorParamsForm))
                    };
                }
            })
        },
        //新增
        handleAdd() {
            let num = this.tableData.length;
            if (this.tableData.length > 0) {
                this.tableData.forEach(item => {
                    if (item.name === '未配置') {
                        this.$message.warning('当前有正在新增的触发设备！')
                        return
                    }
                })
            }
            if (num > 31) {
                this.$message.warning('保存数据已达上限！')
                return
            } else {
                this.isCreate = true;
                if (this.tableData.some(item => item.name === '未配置')) {
                    this.$message.warning('当前有正在新增的触发设备！')
                    return false;
                } else {
                    // 重置设备列表为初始状态
                    this.devicesList = this.devicesDataInfo.map((deviceItem, index) => {
                        return {
                            id: deviceItem.id,
                            name: deviceItem.name,
                            type: deviceItem.type,
                            ip: deviceItem.camera_info ? deviceItem.camera_info.ip : '',
                            value: index,
                            offset: 100,
                        };
                    });

                    // 过滤掉已存在于 tableData 中的设备
                    if (this.tableData.length > 0) {
                        this.devicesList = this.devicesList.filter(item => {
                            return !this.tableData.some(item1 => (item1.id === item.id && item1.type === item.type));
                        });
                    }

                    const newRow = {
                        id: null,
                        name: '未配置',
                        offset: 100
                    };
                    this.tableData.push(newRow);
                    // 设置新行为当前选中行
                    this.$nextTick(() => {
                        this.$refs.tableRef.setCurrentRow(newRow);
                        // this.currentRow = newRow;
                        this.isDisabled = false;
                    });
                    this.hasUnsavedChanges = this.checkUnsavedChanges();
                }
            }
        },
        //删除
        handleDelete(index, row) {
            //查询当前删除的行是否可删除
            if (row.name == '未配置') {
                this.tableData.splice(index, 1);
                this.paramValue = null;
                this.$refs["formInline"].resetFields();
                this.isDisabled = true;
                this.isCreate = false; // 重置创建状态
                this.hasUnsavedChanges = this.checkUnsavedChanges();
            } else {
                let removeParams = {
                    ctlr_id: Number(this.ctlr_id),
                    devices: [
                        {
                            id: row.id,
                            type: row.type
                        }
                    ]
                };
                query_offset_associations(removeParams).then(res => {
                    // 检查res[0]是否为null或undefined
                    if (!res || !res[0]) {
                        // 如果res[0]为null或undefined，直接删除
                        this.deleteOffset(row, index);
                    } else if ((res[0].workflows && res[0].workflows.length > 0) || (res[0].work_configs && res[0].work_configs.length > 0)) {
                        //如果不可以删除
                        this.isShowDialog = false;
                        this.removeMessage = {};
                        this.$nextTick(() => {
                            this.isShowDialog = true;
                            this.removeMessage = res[0];
                            this.removeMessage.ctlrId = this.ctlr_id;
                            this.removeMessage.name = res[0].device.name;
                            this.removeMessage.removeId = row.id;
                            this.removeMessage.removeType = row.type;
                        });
                    } else {
                        //如果可以删除，则删除
                        this.deleteOffset(row, index);
                    }
                })
            }
        },
        // 添加deleteOffset方法，避免代码重复
        deleteOffset(row, index) {
            let params = {
                ctlr_id: this.ctlr_id,
                device_id: row.id,
                device_type: row.type
            };
            this.$confirm('确定要删除此触发设备?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 如果删除的不是"未配置"的行，则将设备添加回 devicesList
                if (row.name !== '未配置') {
                    const deviceToRestore = {
                        id: row.id,
                        name: row.name,
                        type: row.type,
                        ip: row.ip,
                        value: this.devicesList.length,
                        offset: 100
                    };

                    // 检查是否已存在于 devicesList 中
                    const exists = this.devicesList.some(item =>
                        item.id === deviceToRestore.id && item.type === deviceToRestore.type
                    );
                    if (!exists) {
                        this.devicesList.push(deviceToRestore);
                    }
                }
                delete_offset(params).then(res => {
                    this.$message.success('触发距离删除成功！');
                    this.tableData.splice(index, 1);
                    this.paramValue = null;
                    this.$refs["formInline"].resetFields();
                    this.isDisabled = true;
                    this.isCreate = false; // 重置创建状态
                    this.hasUnsavedChanges = this.checkUnsavedChanges();
                })
            });
        },
        //选中当前行
        handleCurrentChange(value) {
            // console.log("🚀 ~ handleCurrentChange ~ value:", value)
            if (value) {
                // this.currentRow = value;
                this.currentId = value.id;
                this.currentOffset = value.offset;
                this.currentType = value.type;
                this.isDisabled = false;
                this.paramValue = value.name;
                this.formInline = { ...value };
                this.$refs.tableRef.setCurrentRow(value);
                // 只有在非试运行状态下才重置图像
                if (this.startRun) {
                    this.imgUrl = null;
                }
                let currentCameraInfo = this.tableData.filter(item => item.id === value.id);
                if (this.currentRunCameraIp && currentCameraInfo[0].ip !== this.currentRunCameraIp) {
                    this.stopRun();
                }
            }
        },
        //高亮样式
        getRowClassName({ row, rowIndex }) {
            // 如果当前行等于选中行，则返回高亮类的名称
            // return this.currentRow === row ? 'highlight-row' : '';
        },
        //下拉选择
        paramItemChange(value) {
            this.formInline = { ...value };
            // 编辑设备的情况
            let index = this.tableData.findIndex(item => item.id === this.currentId && item.type === this.currentType);
            if (index !== -1) {
                const updatedRow = {
                    ...value,
                    offset: this.formInline.offset
                };
                this.$set(this.tableData, index, updatedRow);
                // this.currentRow = updatedRow;
                this.$refs.tableRef.setCurrentRow(updatedRow);
            }
            // }
            // 只有在非试运行状态下才重置图像
            if (this.startRun) {
                this.imgUrl = null;
            }
            this.hasUnsavedChanges = this.checkUnsavedChanges();
        },
        //触发位置变化
        handleInput: _.debounce(function (value) {
            if (!this.startRun) {
                update_offset({ offset: value }).then(res => {
                    this.$message.success('更新触发位置成功！')
                })
            }
            let index = this.tableData.findIndex(item => item.id === this.currentId && item.type === this.currentType);
            // console.log("🚀 ~ index:", index)
            if (index !== -1) {
                const updatedRow = {
                    ...this.tableData[index],
                    offset: value
                };
                // console.log("🚀 ~ updatedRow:", updatedRow)
                this.$set(this.tableData, index, updatedRow);
                // this.currentRow = updatedRow;
                this.$refs.tableRef.setCurrentRow(updatedRow);
            }
            // }
            // console.log('this.tableData', this.tableData);
            this.hasUnsavedChanges = this.checkUnsavedChanges();
        }, 300),
        validateTriggerPositionDuplicate() {
            // 如果表格为空，返回 true
            if (!this.tableData || this.tableData.length === 0) {
                return true;
            }

            // 获取所有有效的 offset 值（排除当前正在编辑的行）
            const currentId = this.currentId;
            const offsets = this.tableData
                .filter(item => item.id !== currentId && item.type === this.currentType) // 排除当前正在编辑的行
                .map(item => {
                    const offset = Number(item.offset);
                    return isNaN(offset) ? null : offset;
                })
                .filter(offset => offset !== null); // 过滤掉无效的数字

            // 检查当前编辑的 offset 是否在其他行中存在
            const currentOffset = Number(this.formInline.offset);
            const hasDuplicate = offsets.includes(currentOffset);

            if (hasDuplicate) {
                this.$message.warning(`触发位置${currentOffset}重复！`);
                return false;
            }
            return true;
        },
        validateTriggerPositionMinimum() {
            // 检查当前编辑的设备
            if (this.formInline.offset / ((this.formulaParamsForm.motorSpeed /
                this.seniorParamsForm.motor_drive_step /
                this.seniorParamsForm.reduction_ratio * Math.PI *
                this.seniorParamsForm.diameter) || 0).toFixed(2) < 0.1) {
                this.$message.warning(`${this.formInline.name}触发位置不能小于0.1mm！`);
                return false;
            }

            // 检查表格中所有设备
            for (const device of this.tableData) {
                if (device.offset / ((this.formulaParamsForm.motorSpeed /
                    this.seniorParamsForm.motor_drive_step /
                    this.seniorParamsForm.reduction_ratio * Math.PI *
                    this.seniorParamsForm.diameter) || 0).toFixed(2) < 0.1) {
                    this.$message.warning(`${device.name}触发位置不能小于0.1mm！`);
                    return false;
                }
            }
            return true;
        },
        validateDataLimit() {
            let num = 0;
            if (this.tableData.length > 0) {
                this.tableData.forEach((item) => {
                    if (item.type && item.type == 'Station') {
                        num = num + 2;
                    } else {
                        num++;
                    }
                });
            }
            if (num > 31) {
                this.$message.warning('保存数据已达上限！');
                return false;
            }
            return true;
        },
        handleBlur(event) {
            // 在这里可以添加其他逻辑处理
            // 更新tableData中对应项的offset值
            if (this.currentId !== null && this.currentType !== null) {
                const index = this.tableData.findIndex(item =>
                    item.id === this.currentId && item.type === this.currentType
                );

                if (index !== -1) {
                    // 确保使用Vue的响应式更新方法
                    this.$set(this.tableData[index], 'offset', this.formInline.offset);
                }
            } else if (this.isCreate) {
                // 处理新创建项的情况
                const index = this.tableData.findIndex(item => item.name === '未配置');
                if (index !== -1) {
                    this.$set(this.tableData[index], 'offset', this.formInline.offset);
                }
            }
            // 标记有未保存的更改
            this.hasUnsavedChanges = this.checkUnsavedChanges();
        },
        // 保存
        saveSystemParams() {
            // 先让当前激活的输入元素失去焦点，确保数据已更新
            document.activeElement.blur();

            // 首先检查是否有未配置的设备
            const hasUnconfiguredDevice = this.tableData.some(item => item.name === '未配置');
            if (hasUnconfiguredDevice) {
                this.$message.warning('存在未配置的触发设备，请先完成配置或删除后再保存！');
                return;
            }

            // 创建一个Promise数组来存储所有的校验任务
            const validationPromises = [];

            // 添加触发设备配置的表单校验
            const triggerConfigValidation = new Promise((resolve) => {
                if (this.isDisabled) {
                    resolve(true);
                    return;
                }
                this.$refs["formInline"].validate(valid => {
                    if (!valid) {
                        this.$message.warning('请完成触发设备配置的必填项！');
                        resolve(false);
                        return;
                    }

                    // 使用抽取的校验方法
                    if (!this.validateTriggerPositionDuplicate() ||
                        !this.validateTriggerPositionMinimum() ||
                        !this.validateDataLimit()) {
                        resolve(false);
                        return;
                    }
                    resolve(true);
                });
            });
            validationPromises.push(triggerConfigValidation);

            // 添加高级参数的表单校验
            const seniorParamsValidation = new Promise((resolve) => {
                this.$refs["seniorForm"].validate(valid => {
                    if (!valid) {
                        this.$message.warning('请完成高级参数的必填项！');
                        resolve(false);
                        return;
                    }
                    resolve(true);
                });
            });
            validationPromises.push(seniorParamsValidation);

            // 等待所有校验完成
            Promise.all(validationPromises).then(results => {
                // 如果所有校验都通过
                if (results.every(result => result === true)) {
                    let params = { ...this.seniorParamsForm };
                    let newArr = this.tableData.map(item => {
                        return {
                            offset: item.offset.toString(),
                            name: item.name,
                            type: item.type,
                            id: item.id
                        };
                    });
                    params['ctlr_id'] = Number(this.ctlr_id);
                    params['devices'] = [...newArr];
                    params['motor_drive_step'] = this.seniorParamsForm.motor_drive_step.toString();
                    params['reduction_ratio'] = this.seniorParamsForm.reduction_ratio.toString();
                    params['diameter'] = this.seniorParamsForm.diameter.toString();
                    // params['passage'] = (isNaN(this.passage) || !isFinite(this.passage)) ? '5000' : this.passage.toFixed(2);
                    // params['interval'] = (isNaN(this.interval) || !isFinite(this.interval)) ? '1' : this.interval.toFixed(2);
                    save_trigger(params).then(res => {
                        this.$message.success('保存成功！');
                        // 使用统一的方法更新保存状态
                        this.updateSavedState();
                    });
                }
            });
        },
        // 添加 tab 切换处理方法
        handleTabClick(tab, event) {
            if (tab.name === 'second') {
                // 如果当前正在编辑设备配置
                if (!this.isDisabled) {
                    this.$refs["formInline"].validate(valid => {
                        if (!valid) {
                            this.$message.warning('请完成触发设备配置的必填项！');
                            // 阻止切换，将activeName设置回first
                            this.$nextTick(() => {
                                this.activeName = 'first';
                            });
                            return;
                        }

                        // 使用抽取的校验方法
                        if (!this.validateTriggerPositionDuplicate() ||
                            !this.validateTriggerPositionMinimum() ||
                            !this.validateDataLimit()) {
                            // 阻止切换，将activeName设置回first
                            this.$nextTick(() => {
                                this.activeName = 'first';
                            });
                            return;
                        }
                    });
                }
            }
        },
        //电磁阀试运行
        triggerRun() {
            if (this.isDisabled) {
                this.$message.warning('请选择触发设备！')
                return;
            }
            this.$refs["rateForm"].validate(valid => {
                if (valid) {
                    this.$refs["formInline"].validate(valid => {
                        if (valid) {
                            this.currentRunCameraIp = this.formInline.ip;
                            //试运行触发系统
                            let that = this
                            let addr = `${WebSocketBaseUrl}/trigger/trial_running_trigger?ctlr_id=` + this.ctlr_id + `&device_type=` + this.formInline.type + `&device_id=` + this.formInline.id + `&offset=` + this.formInline.offset + `&motor_id=` + this.rateForm.motorId + `&passage=` + this.seniorParamsForm.passage +
                                `&interval=` + this.seniorParamsForm.interval + `&frame_rate=` + this.seniorParamsForm.frame_rate + `&motor_drive_step=` + this.seniorParamsForm.motor_drive_step + `&reduction_ratio=` + this.seniorParamsForm.reduction_ratio + `&diameter=` + this.seniorParamsForm.diameter;
                            this.WebSocket = new WebSocket(addr);
                            // 连接成功打开时的处理
                            this.WebSocket.onopen = function (event) {
                                that.startRun = false;
                                that.$message.success('试运行成功！');
                                if (that.formInline.type == 'Camera' || that.formInline.type == 'Station') {
                                    that.imgUrl = `${EventSourceUrl}/view?ip=` + that.formInline.ip;
                                } else {
                                    that.imgUrl = null;
                                }
                            };
                        } else {
                            return false;
                        }
                    });
                } else {
                    return false;
                }
            });
        },
        //关闭试运行
        stopRun() {
            if (this.WebSocket && !this.startRun) {
                this.startRun = true;
                this.$message.success('试运行已关闭!');
                this.WebSocket.close();
                this.currentRunCameraIp = null;
            }
        },
        // 添加新方法，用于更新保存状态
        updateSavedState() {
            this.initialData = {
                tableData: JSON.parse(JSON.stringify(this.tableData)),
                seniorParamsForm: JSON.parse(JSON.stringify(this.seniorParamsForm))
            };
            this.hasUnsavedChanges = false;
        },
    },
    beforeDestroy() {
        this.stopRun();
    },
    async beforeRouteLeave(to, from, next) {
        // 如果正在试运行，先停止
        if (!this.startRun) {
            this.stopRun();
        }

        // 直接使用已计算的hasUnsavedChanges标志，避免重复计算
        if (!this.hasUnsavedChanges) {
            next();
            return;
        }

        // 再次确认是否有未保存的更改（双重检查）
        const hasChanges = this.checkUnsavedChanges();
        if (!hasChanges) {
            next();
            return;
        }

        try {
            const result = await this.$confirm('当前有未保存的数据，是否进行保存？', '提示', {
                confirmButtonText: '保存',
                cancelButtonText: '不保存',
                type: 'warning',
                distinguishCancelAndClose: true // 区分取消和关闭
            }).catch(action => {
                // 处理用户点击 X 按钮或取消按钮的情况
                return action === 'cancel' || action === 'close' ? 'cancel' : Promise.reject(action);
            });

            if (result === 'cancel') {
                next();
                return;
            }

            if (result === 'confirm') {
                let validationPassed = true;
                let validationError = false;

                // 根据当前激活的标签页进行相应的表单验证
                if (this.activeName === 'first' && !this.isDisabled) {
                    try {
                        const formInlineValid = await this.$refs["formInline"].validate().catch(() => false);
                        if (!formInlineValid) {
                            this.$message.warning('请完成触发设备配置的必填项！');
                            validationPassed = false;
                        } else if (!this.validateTriggerPositionDuplicate() ||
                            !this.validateTriggerPositionMinimum() ||
                            !this.validateDataLimit()) {
                            validationPassed = false;
                        }
                    } catch (error) {
                        validationError = true;
                        console.warn('触发设备配置表单验证失败:', error);
                    }
                }

                // 验证高级参数表单
                if (!validationError) {
                    try {
                        const seniorFormValid = await this.$refs["seniorForm"].validate().catch(() => false);
                        if (!seniorFormValid) {
                            this.$message.warning('请完成高级参数的必填项！');
                            validationPassed = false;
                        }
                    } catch (error) {
                        validationError = true;
                        console.warn('高级参数表单验证失败:', error);
                    }
                }

                // 如果有验证错误或验证未通过，阻止跳转
                if (validationError || !validationPassed) {
                    // 不使用 next(false)，而是直接返回，让路由继续当前页面
                    return;
                }

                let params = { ...this.seniorParamsForm };
                let newArr = this.tableData.map(item => {
                    return {
                        ...item,
                        offset: item.offset.toString(),
                    };
                });
                params['ctlr_id'] = Number(this.ctlr_id);
                params['devices'] = [...newArr];
                params['motor_drive_step'] = this.seniorParamsForm.motor_drive_step.toString();
                params['reduction_ratio'] = this.seniorParamsForm.reduction_ratio.toString();
                params['diameter'] = this.seniorParamsForm.diameter.toString();
                // params['passage'] = (isNaN(this.passage) || !isFinite(this.passage)) ? '5000' : this.passage.toFixed(2);
                // params['interval'] = (isNaN(this.interval) || !isFinite(this.interval)) ? '1' : this.interval.toFixed(2);
                try {
                    await save_trigger(params);
                    // 保存成功后更新初始数据
                    this.updateSavedState();
                    next();
                } catch (error) {
                    this.$message.warning('保存失败！');
                    return;
                }
            }
        } catch (error) {
            // 发生其他错误时，继续当前页面
            return;
        }
    }
}
</script>

<style lang="scss">
.config-container-system {
    height: calc(100vh - 90px);
    padding: 0px 0px 0px 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .system {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: calc(100vh - 130px);
        padding: 20px;
        margin: 20px 20px 0px 0px;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .system-img {
            display: flex;
            flex-direction: row;

            div {
                display: flex;
                flex-direction: row;
                margin-left: auto;

                .el-button {
                    font-size: 14px;
                    font-weight: bold;
                    background: #000000;
                    color: #fff;
                    padding: 8px 15px;
                    text-align: center;
                    border-radius: 12px;
                }
            }
        }

        .system-list {
            flex: 1;
            display: flex;
            flex-direction: column;

            .system-table {
                width: 768px;
                max-width: 768px;
                overflow-x: auto;

                .el-table {
                    max-height: calc(100vh - 270px) !important;
                    overflow-y: auto;
                    color: #343434;

                    .el-table__cell {
                        text-align: center;
                    }

                    .cell {
                        font-size: 14px !important;
                        padding-left: 0px !important;

                        .el-icon-remove-outline {
                            font-size: 18px;
                        }
                    }

                    .el-table__body tr.current-row>td.el-table__cell {
                        background-color: #e0d5c9 !important;
                    }
                }

                .highlight-row {
                    background-color: #e0d5c9;
                    /* 高亮颜色 */
                }
            }

            .create-btn-flow {
                flex: 1;
                display: flex;
                align-items: flex-start;
                color: rgba(154, 154, 154, 1);
                font-size: 16px;
                padding: 10px 20px 20px 35px;

                .el-icon-circle-plus-outline {
                    font-size: 24px;
                    color: #BEBEBE;
                    cursor: pointer;
                    margin-right: 7px;
                }
            }
        }

        .seniorParams {
            display: flex;
            flex-direction: column;

            .seniorParamsBtn {
                display: flex;
                margin-left: auto;
                margin-bottom: 20px;

                .el-button {
                    font-size: 14px;
                    font-weight: bold;
                    background: #000000;
                    color: #fff;
                    padding: 8px 15px;
                    text-align: center;
                    border-radius: 12px;
                }

                .cancelBtn {
                    background: #ffffff;
                    color: #000000;
                    border-color: #000000;
                }
            }

            .abnormal-formula {
                display: flex;
                flex-direction: column;
                border: 1px solid #c3a58f;
                border-radius: 6px;
                padding: 20px;
                margin-bottom: 20px;

                a {
                    display: inline-block;
                    margin-bottom: 20px;
                    font-size: 18px;
                    color: #000000;
                    font-weight: 900;
                }

                .abnormal-formula-item {
                    display: flex;
                    flex-direction: column;

                    .abnormal-formula-item-children {
                        display: flex;
                        flex-direction: row;

                        div {
                            margin-right: 10px;
                            font-size: 16px;
                            color: #525356;
                        }

                        span {
                            display: flex;
                            flex-direction: row;
                            align-items: center;

                            .el-input-number {
                                width: 100px;
                            }
                        }
                    }
                }
            }

            .params-trigger {
                display: flex;
                flex-direction: column;
                border: 1px solid #c3a58f;
                border-radius: 6px;
                padding: 20px;
                margin-bottom: 20px;

                a {
                    display: inline-block;
                    margin-bottom: 20px;
                    font-size: 18px;
                    color: #000000;
                    font-weight: 900;
                }

                .trigger-form {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;

                    .el-switch {
                        width: 40px;
                    }

                    .el-switch.is-checked .el-switch__core {
                        border-color: #000000;
                        background-color: #000000;
                    }

                    .el-form-item {
                        margin-bottom: 0px;
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                        font-size: 16px;

                        .el-form-item__label {
                            font-size: 16px;
                        }

                        .el-form-item__content {
                            display: flex;
                        }
                    }
                }

            }

            .params-abnormal {
                display: flex;
                flex-direction: column;
                border: 1px solid #c3a58f;
                border-radius: 6px;
                padding: 20px;

                a {
                    display: inline-block;
                    margin-bottom: 20px;
                    font-size: 18px;
                    color: #000000;
                    font-weight: 900;
                }

                .abnormal-form {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;

                    .el-form-item {
                        margin-bottom: 0px;
                        display: flex;
                        flex-direction: row;
                        font-size: 16px;

                        .el-form-item__label {
                            font-size: 16px;
                        }

                        .el-form-item__content {
                            display: flex;

                            .el-input-number {
                                width: 110px;
                            }

                            .el-input {
                                width: 110px;
                            }
                        }
                    }
                }

            }
        }

        .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
            border-bottom-color: #d4c2b0 !important;
            border-bottom: 4px solid;
        }

        .el-tabs__item.is-active {
            color: #c5b4a3 !important;
        }

        .el-tabs__item:hover {
            color: #c5b4a3 !important;
        }
    }

    .system-config {
        height: 100vh;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 10px 20px;
        background: #ffffff;
        border-radius: 10px 0px 0px 10px;
        border-left: 3px solid #d7c4b2;
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

        .system-config-video {
            display: flex;
            flex-direction: column;
            padding: 20px 20px 10px 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
            margin-bottom: 20px;

            .system-config-img {
                height: 365px;
                position: relative;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .lineClass {
                    position: absolute;
                    top: 30px;
                    left: 50%;
                    border-left: 2px solid black;
                    width: 1px;
                    height: 300px;
                    overflow: hidden;
                }
            }

            .solenoid-config-run {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                margin-left: auto;

                .system-select {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    margin-bottom: 10px;
                }

                i {
                    font-size: 24px;
                }
            }

        }

        .system-config-content {
            min-height: calc(100vh - 640px);
            max-height: calc(100vh - 640px);
            padding: 20px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

            .system-config-header {
                display: flex;
                flex-direction: row;

                .system-config-submit {
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

                        &:nth-child(1) {
                            background: #ffffff;
                            color: #000000;
                            border-color: #000000;
                        }
                    }
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
                margin-bottom: 0px !important;

                .el-form-item__label {
                    width: 100px;
                    max-width: 100px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-align: right;
                }

                .el-form-item__content {
                    .el-select {
                        width: 180px !important;
                    }

                    .el-input__inner:focus {
                        border-color: #dadce4 !important;
                    }

                    .el-input-number--medium {
                        width: 180px !important;
                        line-height: 34px !important;

                        .el-input-number__decrease {
                            border-radius: 10px 0 0 10px;
                        }

                        .el-input-number__increase {
                            border-radius: 0 10px 10px 0;
                        }
                    }

                    .el-input {
                        width: 180px !important;
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
    }
}
</style>