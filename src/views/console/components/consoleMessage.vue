<template>
    <div class="flex-container">
        <div class="left-side">
            <div class="box box1 nine-grid" id="grid" v-if="isRunning">
                <div class="grid-item" v-for="(item, index) in cameraIpData" :key="index"
                    v-if="cameraIpData && cameraIpData.length">
                    <el-tooltip v-if="item.name.length > 6" :content="item.name" placement="top">
                        <a><span>•</span>{{ item.name }}</a>
                    </el-tooltip>
                    <a v-else><span>•</span>{{ item.name }}</a>
                    <img :src="item.url" class="iframeClass" id="images" :key="item.url"
                        @error="handleImageError($event, item)" loading="lazy" />
                </div>
            </div>
            <div v-else class="textBox">
                <i v-if="isLoadingTransfrom" class="iconfont icon-lbznjiazaizhong" style="cursor: pointer;"></i>
                <span v-if="isLoadingTransfrom">{{ loadingText }}...</span>
                <span v-else>{{ loadingText }}</span>
            </div>
        </div>
        <div class="right-side">
            <i class="el-icon-circle-plus-outline" style="color: #b1b1b1;cursor: pointer;"
                @click="dialogVisible = true">添加检测项</i>
            <div class="dragClass">
                <div>
                    <div class="box box3" v-if="selectId.includes(1)">
                        <div class="header">
                            <a>尺寸/厚度检测结果</a>
                            <el-select v-model="sizeparamItem" placeholder="请选择" @change="SizeparamItemChange">
                                <el-option v-for="item in sizeCardSelectData" :key="item.value"
                                    :label="item.camera_name" :value="item">
                                </el-option>
                            </el-select>
                            <i class="el-icon-remove-outline" style="color: #eb2c14;margin-left: auto;"
                                @click="deletedrag(1)"></i>
                        </div>
                        <div class="testClass">
                            <div style="border: 1px solid #e7e7e7">
                                <el-table :data="sizeTableData">
                                    <el-table-column v-for="column in sizeTableColumns" :key="column" :prop="column"
                                        :label="column">
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </div>
                    <div class="box box3" v-if="selectId.includes(2)">
                        <div class="header">
                            <a>外观检测结果</a>
                            <el-select v-model="qualityparamItem" placeholder="请选择" @change="qualityParamItemChange">
                                <el-option v-for="item in qualityCardSelectData" :key="item.value"
                                    :label="item.camera_name" :value="item">
                                </el-option>
                            </el-select>
                            <i class="el-icon-remove-outline" style="color: #eb2c14;margin-left: auto;"
                                @click="deletedrag(2)"></i>
                        </div>
                        <div class="testClass">
                            <div style="border: 1px solid #e7e7e7">
                                <el-table :data="qualityTableData">
                                    <el-table-column v-for="column in qualityTableColumns" :key="column" :prop="column"
                                        :label="column">
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </div>
                    <div class="box box3" v-if="selectId.includes(6)">
                        <div class="header">
                            <a>执行统计</a>
                            <i class="el-icon-remove-outline" style="color: #eb2c14;margin-left: auto;"
                                @click="deletedrag(6)"></i>
                        </div>
                        <div class="testClass">
                            <div style="border: 1px solid #e7e7e7">
                                <el-table :data="excuorTableData">
                                    <el-table-column v-for="column in excuorTableColumns" :key="column" :prop="column"
                                        :label="column">
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="testType == 'Monitor'">
                    <div class="box box4" v-if="selectId.includes(3)">
                        <div class="header">
                            <a>速度检测结果</a>
                            <el-select v-model="speedparamItem" placeholder="请选择" @change="speedParamItemChange">
                                <el-option v-for="item in speedCardSelectData" :key="item.value"
                                    :label="item.camera_name" :value="item">
                                </el-option>
                            </el-select>
                            <i class="el-icon-remove-outline" style="color: #eb2c14;margin-left: auto;"
                                @click="deletedrag(3)"></i>
                        </div>
                        <div class="stageClass">
                            <div style="border: 1px solid #e7e7e7">
                                <el-table :data="speedTableData">
                                    <el-table-column v-for="column in speedTableColumns" :key="column" :prop="column"
                                        :label="column">
                                        <template v-if="column === '检测结果'" v-slot="{ row }">
                                            <span :style="{ color: row['检测结果'] === '合格' ? 'green' : 'red' }">
                                                {{ row['检测结果'] }}
                                            </span>
                                        </template>
                                        <template v-else-if="column === '数值'" v-slot="{ row }">
                                            <span>
                                                {{ row['数值'] }}
                                            </span>
                                        </template>
                                        <template v-else v-slot="{ row }">
                                            {{ row[column] }}
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </div>
                    <div class="box box4" v-if="selectId.includes(4)">
                        <div class="header">
                            <a>环节检测结果</a>
                            <el-select v-model="stageparamItem" placeholder="请选择" @change="stageParamItemChange">
                                <el-option v-for="item in stageCardSelectData" :key="item.value"
                                    :label="item.camera_name" :value="item">
                                </el-option>
                            </el-select>
                            <i class="el-icon-remove-outline" style="color: #eb2c14;margin-left: auto;"
                                @click="deletedrag(4)"></i>
                        </div>
                        <div class="stageClass">
                            <div class="stageItem" v-for="(item, index) in stageTableData" :key="index">
                                <span>
                                    <a>{{ item.number }}</a>
                                    <div class="progress">
                                        <el-progress type="circle" class="custom-progress" :width="item.width"
                                            stroke-linecap="square" :color="item.color"
                                            :format="() => setItemText(item.name)" :percentage="item.percentage">
                                        </el-progress>
                                    </div>
                                    <a>
                                        <i v-if="item.status == 'Qualified'" class="el-icon-check"
                                            style="color: #3e951a;"></i>
                                        <i v-else-if="item.status == null" class="el-icon-s-data"
                                            style="color: #f6cd47;"></i>
                                        <i v-else class="el-icon-close" style="color: #e20505;"></i>
                                    </a>
                                </span>
                                <div class="dashold">
                                    <div v-if="index !== stageTableData.length - 1" class="linetClass"></div>
                                    <div v-else></div>
                                    <i v-if="index !== stageTableData.length - 1"
                                        class="el-icon-caret-bottom jiantou"></i>
                                    <i v-else></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box box3" v-if="selectId.includes(5)">
                        <div class="header">
                            <a>外观检测结果</a>
                            <el-select v-model="qualityparamItem" placeholder="请选择" @change="qualityParamItemChange">
                                <el-option v-for="item in qualityCardSelectData" :key="item.value"
                                    :label="item.camera_name" :value="item">
                                </el-option>
                            </el-select>
                            <i class="el-icon-remove-outline" style="color: #eb2c14;margin-left: auto;"
                                @click="deletedrag(5)"></i>
                        </div>
                        <div class="testClass">
                            <div style="border: 1px solid #e7e7e7">
                                <el-table :data="qualityTableData">
                                    <el-table-column v-for="column in qualityTableColumns" :key="column" :prop="column"
                                        :label="column">
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <el-dialog title="选择检测结果" :visible.sync="dialogVisible" :modal-append-to-body="false" id="dialog">
                <div class="imgClass">
                    <el-checkbox v-model="isSelectOne" @change="handleCheckboxChange(1)"></el-checkbox>
                    <img src="../../../assets/imgs/dragable1.png" />
                </div>
                <div class="imgClass">
                    <el-checkbox v-model="isSelectTwo" @change="handleCheckboxChange(2)"></el-checkbox>
                    <img src="../../../assets/imgs/dragable2.png" />
                </div>
                <div class="imgClass" v-if="testType == 'Monitor'">
                    <el-checkbox v-model="isSelectThree" @change="handleCheckboxChange(3)"></el-checkbox>
                    <img src="../../../assets/imgs/dragable3.png" />
                </div>
                <div class="imgClass" v-if="testType == 'Monitor'">
                    <el-checkbox v-model="isSelectFour" @change="handleCheckboxChange(4)"></el-checkbox>
                    <img src="../../../assets/imgs/dragable5.png" class="dragable5" />
                </div>
                <div class="imgClass" v-if="testType == 'Monitor'">
                    <el-checkbox v-model="isSelectFive" @change="handleCheckboxChange(5)"></el-checkbox>
                    <img src="../../../assets/imgs/dragable2.png" />
                </div>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import {
    consoleStart,
    consoleStop,
} from "@/api/console.js";
import { getWorkflows } from '@/api/workflowConfig.js'
import { EventSourceUrl } from "@/utils/index";

export default {
    name: "Console",
    components: {
        // MonitorCard, SpeedCard 
    },
    props: {},
    computed: {
    },
    data() {
        return {
            viewer: null,
            testType: null,
            sizeEventSource: null,
            qualityEventSource: null,
            speedEventSource: null,
            stageEventSource: null,
            messageStartEventSource: null,
            messageEndEventSource: null,
            isSelectOne: false,
            isSelectTwo: false,
            isSelectThree: false,
            isSelectFour: false,
            isSelectFive: false,
            isSelectSix: false,
            dialogVisible: false,
            startShow: true,
            endShow: false,
            isDisabled: false,
            isRunning: false,
            isLoadingTransfrom: false,
            loadingText: "系统暂未开始运行!",
            qualityTableColumns: ["外观检测项", "缺陷数量",],
            qualityTableData: null,
            sizeTableColumns: ["尺寸/厚度检测项", "数值",],
            sizeTableData: null,
            speedTableColumns: ["速度检测项", "数值", "检测结果"],
            speedTableData: null,
            stageTableData: null,
            excuorTableColumns: ["执行单元", "累计执行次数"],
            excuorTableData: null,
            stageparamItem: null,
            speedparamItem: null,
            sizeparamItem: null,
            qualityparamItem: null,
            stationNumbers: null,
            qualityCardSelectData: null,
            sizeCardSelectData: null,
            speedCardSelectData: null,
            stageCardSelectData: null,
            systemStatus: null,
            selectId: [],
            cameraIpData: [],
            successMessageData: [
                {
                    "status": "initializing",
                    "is_Final": false,
                    "details": {
                        "step": "configure_controller",
                        "description": "配置飞拍控制器"
                    }
                },
                {
                    "status": "initializing",
                    "is_Final": false,
                    "details": {
                        "step": "initialize_workflow",
                        "description": "初始化工作流"
                    }
                },
                {
                    "status": "initializing",
                    "is_Final": false,
                    "details": {
                        "step": "start_motor",
                        "description": "转盘电机启动"
                    }
                },
                {
                    "status": "initializing",
                    "details": {
                        "step": "start_feeder",
                        "description": "上料器启动，上下料皮带启动"
                    }
                },
                {
                    "status": "running",
                    "is_Final": true,
                    "details": {
                        "step": "waiting_for_image",
                        "description": "等待接收相机图像"
                    }
                }
            ],
            failMessageData: [
                {
                    "status": "stopping",
                    "is_Final": false,
                    "details": {
                        "step": "configure_controller",
                        "description": "配置飞拍控制器"
                    }
                },
                {
                    "status": "stopping",
                    "is_Final": false,
                    "details": {
                        "step": "destroy_workflow",
                        "description": "销毁工作流"
                    }
                },
                {
                    "status": "stopping",
                    "is_Final": false,
                    "details": {
                        "step": "stop_feeder",
                        "description": "上料器停止，转盘持续转动清理残料"
                    }
                },
                {
                    "status": "stopping",
                    "is_Final": false,
                    "details": {
                        "step": "stop_motor",
                        "description": "转盘电机停止，上下料皮带停止"
                    }
                },
                {
                    "status": "stopped",
                    "is_Final": true,
                    "details": {
                        "step": "completed",
                        "description": "设备已停止"
                    }
                }
            ]
        };
    },
    watch: {
    },

    mounted() {
        this.$baseEventBus.$on("$Bus_start", async (data, config_id) => {
            if (data == 'start') {
                if (config_id) {
                    try {
                        this.messageStartEventSource = new EventSource('http://localhost:3000/execution/start_event');
                        let that = this;
                        this.messageStartEventSource.onmessage = function (event) {
                            let messageResult = JSON.parse(event.data);
                            console.log("🚀 ~ this.$baseEventBus.$on ~ messageResult:", messageResult)
                            that.loadingText = messageResult.details.description;
                            that.systemStatus = messageResult;
                            that.isLoadingTransfrom = true;
                            that.$baseEventBus.$emit("$start_Success", that.isDisabled, that.startShow, that.endShow, that.systemStatus, true);
                        };
                        this.messageStartEventSource.onerror = function (event) {
                            console.error('Error:', event);
                        };
                        await consoleStart({ config_id: config_id });
                        // 只有在成功时才更新字段
                        this.isRunning = true;
                        await this.getCermaData(config_id);
                        // 重新获取数据
                        // 使用nextTick确保DOM更新后再刷新图片
                        this.$nextTick(() => {
                            this.refreshImages();
                        });
                        this.isDisabled = true;
                        this.startShow = false;
                        this.endShow = true;
                        this.isLoadingTransfrom = false;
                        this.$message.success("设备已开启！");
                        if (this.messageStartEventSource) {
                            this.messageStartEventSource.close();
                        }
                    } finally {
                        this.isDisabled = false;
                        this.$baseEventBus.$emit("$start_Success", this.isDisabled, this.startShow, this.endShow, '', false);
                        // this.$baseEventBus.$emit("$start_Success", this.isDisabled, this.startShow, this.endShow);

                    }
                } else {
                    this.$message.warning('请选择一条数据！')
                }
            }
        });
        this.$baseEventBus.$on("$Bus_end", (data) => {
            if (data == 'end') {
                // this.isDisabled = true;
                // this.startShow = false;
                // this.endShow = true;
                // this.$baseEventBus.$emit("$start_Fail", this.isDisabled, this.startShow, this.endShow);
                this.stopRunning();
            }
        });
        // 监听beforeunload事件，在页面刷新或关闭前关闭EventSource连接
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    },
    methods: {
        //停止运行
        async stopRunning() {
            if (this.endShow) {
                try {
                    this.messageEndEventSource = new EventSource('http://localhost:3000/execution/stop_event');
                    let that = this;
                    this.messageEndEventSource.onmessage = function (event) {
                        let messageResult = JSON.parse(event.data);
                        console.log("🚀 ~ this.$baseEventBus.$on ~ messageResult:", messageResult)
                        that.loadingText = messageResult.details.description;
                        that.systemStatus = messageResult;
                        that.isLoadingTransfrom = true;
                        if (messageResult.is_final) {
                            that.isDisabled = false;
                            that.startShow = true;
                            that.endShow = false;
                            that.isLoadingTransfrom = false;
                            that.loadingText = "系统暂未开始运行!"
                            that.$baseEventBus.$emit("$start_Fail", that.isDisabled, that.startShow, that.endShow, '', false);
                            that.$message.success("设备已停止！");
                            // 清理所有相关资源
                            if (that.messageEndEventSource) {
                                that.messageEndEventSource.close();
                            }
                        } else {
                            that.$baseEventBus.$emit("$start_Fail", that.isDisabled, that.startShow, that.endShow, that.systemStatus, true);
                        }
                    };
                    this.messageEndEventSource.onerror = function (event) {
                        console.error('Error:', event);
                    };
                    await consoleStop();
                    this.isRunning = false;
                } finally {
                    this.isDisabled = false;
                    this.$baseEventBus.$emit("$start_Fail", this.isDisabled, this.startShow, this.endShow, '', false);
                    // this.isDisabled = false;
                    // this.startShow = true;
                    // this.endShow = false;
                    // this.loadingText = "系统暂未开始运行!"
                    // this.$baseEventBus.$emit("$start_Fail", this.isDisabled, this.startShow, this.endShow);
                }
            }
        },
        getStageData() {
            let stageResult = [
                {
                    "flag": "Unqualified",
                    "ident": "C2",
                    "name": "类别2",
                    "value": "0"
                }, {
                    "flag": null,
                    "ident": "C1",
                    "name": "类别1",
                    "value": "0"
                },
                {
                    "flag": "Qualified",
                    "ident": "C3",
                    "name": "类别3",
                    "value": "0"
                }
            ]
            let classData = [
                {
                    "class": "C1",
                    "name": "类别1",
                    "parameter": {
                        "continuous": "30ms",
                        "type": "Stage"
                    }
                },
                {
                    "class": "C2",
                    "name": "类别2",
                    "parameter": {
                        "continuous": "30ms",
                        "type": "Stage"
                    }
                },
                {
                    "class": "C3",
                    "name": "类别3",
                    "parameter": {
                        "continuous": "30ms",
                        "type": "Stage"
                    }
                }
            ]
            let result = [];
            classData.forEach(item => {
                let found = stageResult.find(element => element.ident === item.class);
                if (found) {
                    result.push({
                        "flag": found.flag,
                        "ident": item.class,
                        "name": item.name,
                        "value": found.value
                    });
                }
            });
            let arr3 = result.map((item, index) => ({
                "number": index + 1,
                "name": item.name,
                "percentage": 100,
                "status": item.flag,
                "width": 80,
                "color": item.flag == 'Qualified' ? "#3e951a" : item.flag == null ? "#f6cd47" : '#e20505'
            }));
            // 打印结果
            this.stageTableData = arr3;
        },
        previewURL(index) {
            this.viewer.show();
            this.viewer.view(index);
        },
        // 获取工作流数据
        async getCermaData(config_id) {
            const workflow = await getWorkflows(config_id);
            this.cameraIpData = workflow.workflow.map(camera => {
                return {
                    "url": `${EventSourceUrl}/view?ip=${camera.camera.ip}`,
                    "name": camera.camera.name
                };
            });
            let cardData = workflow.workflow.map((camera, index) => {
                return {
                    "value": index,
                    "camera_name": camera.camera.name,
                    "workflow_id": camera.id,
                    "camera_ip": camera.camera.ip,
                    "classes": camera.classes,
                    "threshold_type": camera.classes.type,
                };
            });
            this.testType = workflow.type;
            this.qualityCardSelectData = cardData.filter(item => item.threshold_type == "Surface");
            this.sizeCardSelectData = cardData.filter(item => item.threshold_type == "Size" || item.threshold_type == "Thick");
            this.stageCardSelectData = cardData.filter(item => item.threshold_type == "Stage");
            this.speedCardSelectData = cardData.filter(item => item.threshold_type == "Speed");
            this.$nextTick(() => {
                if (this.cameraIpData && this.cameraIpData.length && this.isRunning) {
                    const videoNum = this.cameraIpData.length;
                    const el = document.getElementById("grid");
                    if (el) {
                        switch (videoNum) {
                            case 1:
                                el.classList.add("nine-grid1");
                                break;
                            case 2:
                                el.classList.add("nine-grid2");
                                break;
                            case 3:
                            case 4:
                                el.classList.add("nine-grid4");
                                break;
                            case 5:
                            case 6:
                                el.classList.add("nine-grid6");
                                break;
                            case 7:
                            case 8:
                            case 9:
                                el.classList.add("nine-grid9");
                                break;
                            case 10:
                            case 11:
                            case 12:
                                el.classList.add("nine-grid12");
                                break;
                            case 13:
                            case 14:
                            case 15:
                            case 16:
                                el.classList.add("nine-grid16");
                                break;
                        }
                        if (videoNum > 16) {
                            el.classList.add("nine-grid-more");
                        }
                    }
                }
            });
        },
        // 刷新图片
        refreshImages() {
            if (this.cameraIpData && this.cameraIpData.length) {
                // 获取所有图片元素
                const images = document.querySelectorAll('.iframeClass');

                images.forEach((img, index) => {
                    const currentUrl = this.cameraIpData[index].url;
                    // 直接更新图片的src属性
                    img.src = currentUrl;
                });
            }
        },
        //尺寸or厚度切换工位
        SizeparamItemChange: _.debounce(function (value) {
            if (this.endShow) {
                if (this.sizeEventSource) {
                    this.sizeEventSource.close();
                }
                let thresholdType = value.threshold_type == 'Surface' ? 'Quality' : value.threshold_type;
                this.sizeEventSource = new EventSource(`http://localhost:3000/execution/statistics?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&threshold_type=` + thresholdType);
                let that = this;
                this.sizeEventSource.onmessage = function (event) {
                    if (value.threshold_type == 'Size' || value.threshold_type == 'Thick') {
                        let sizeResult = JSON.parse(event.data);
                        let arr1 = sizeResult.map((item, index) => ({
                            "name": item.name,
                            "value": item.value,
                        }));
                        that.sizeTableData = arr1.map((item, index) => ({
                            "尺寸/厚度检测项": item.name,
                            "数值": item.value,
                        }));
                    }
                };
                this.sizeEventSource.onerror = function (event) {
                    console.error('Error:', event);
                };
            }
        }, 300),
        //外观切换工位
        qualityParamItemChange: _.debounce(function (value) {
            if (this.endShow) {
                if (this.qualityEventSource) {
                    this.qualityEventSource.close();
                }
                let thresholdType = value.threshold_type == 'Surface' ? 'Quality' : value.threshold_type;
                this.qualityEventSource = new EventSource(`http://localhost:3000/execution/statistics?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&threshold_type=` + thresholdType);
                let that = this;
                this.qualityEventSource.onmessage = function (event) {
                    if (value.threshold_type == 'Surface') {
                        let qualityResult = JSON.parse(event.data);
                        let arr1 = qualityResult.map((item, index) => ({
                            "name": item.name,
                            "value": item.value,
                        }));
                        that.qualityTableData = arr1.map((item, index) => ({
                            "外观检测项": item.name,
                            "缺陷数量": item.value,
                        }));
                    }
                };
                this.qualityEventSource.onerror = function (event) {
                    console.error('Error:', event);
                };
            }
        }, 300),
        //速度切换工位
        speedParamItemChange: _.debounce(function (value) {
            if (this.endShow) {
                if (this.speedEventSource) {
                    this.speedEventSource.close();
                }
                let thresholdType = value.threshold_type == 'Surface' ? 'Quality' : value.threshold_type;
                this.speedEventSource = new EventSource(`http://localhost:3000/execution/statistics?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&threshold_type=` + thresholdType);
                let that = this;
                this.speedEventSource.onmessage = function (event) {
                    if (value.threshold_type == 'Speed') {
                        let speedResult = JSON.parse(event.data);
                        let arr1 = speedResult.map((item, index) => ({
                            "name": item.name,
                            "value": parseFloat(item.value).toFixed(2),
                            "flag": item.flag,
                        }));
                        that.speedTableData = arr1.map((item, index) => ({
                            "速度检测项": item.name,
                            "数值": item.value,
                            "检测结果": item.flag === "Qualified" ? '合格' : '不合格'
                        }));
                    }

                };
                this.speedEventSource.onerror = function (event) {
                    console.error('Error:', event);
                };
            }
        }, 300),
        //环节切换工位
        stageParamItemChange: _.debounce(function (value) {
            if (this.endShow) {
                if (this.stageEventSource) {
                    this.stageEventSource.close();
                }
                let thresholdType = value.threshold_type == 'Surface' ? 'Quality' : value.threshold_type;
                this.stageEventSource = new EventSource(`http://localhost:3000/execution/statistics?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&threshold_type=` + thresholdType);
                let that = this;
                this.stageEventSource.onmessage = function (event) {
                    if (value.threshold_type == 'Stage') {
                        let stageResult = JSON.parse(event.data);
                        let classData = value.classes.classes;
                        let result = [];
                        classData.forEach(item => {
                            let found = stageResult.find(element => element.ident === item.class);
                            if (found) {
                                result.push({
                                    "flag": found.flag,
                                    "ident": item.class,
                                    "name": item.name,
                                    "value": found.value
                                });
                            }
                        });
                        let arr3 = result.map((item, index) => ({
                            "number": index + 1,
                            "name": item.name,
                            "percentage": 100,
                            "status": item.flag,
                            "color": item.flag == 'Qualified' ? "#3e951a" : item.flag == null ? "#f6cd47" : '#e20505'
                        }));
                        // 打印结果
                        that.stageTableData = arr3;
                    }
                };
                this.stageEventSource.onerror = function (event) {
                    console.error('Error:', event);
                };
            }
        }, 300),
        //选择组件
        handleCheckboxChange(id) {
            if (this.selectId.includes(id)) {
                let arr = this.selectId.filter(item => item !== id);
                this.selectId = [...arr];
            } else {
                this.selectId.push(id);
            }
        },
        //删除组件
        deletedrag(id) {
            let arr = this.selectId.filter(item => item !== id);
            this.selectId = [...arr];
            switch (id) {
                case 1:
                    this.isSelectOne = false;
                    break;
                case 2:
                    this.isSelectTwo = false;
                    break;
                case 3:
                    this.isSelectThree = false;
                    break;
                case 4:
                    this.isSelectFour = false;
                    break;
                case 5:
                    this.isSelectFive = false;
                    break;
                case 6:
                    this.isSelectSix = false;
                    break;
                default:
                    console.log('No action specified.');
            }
        },
        //格式化进度条
        setItemText(name) {
            return `${name}`;
        },
        // 添加新方法
        handleBeforeUnload(event) {
            if (this.endShow) {
                this.stopRunning();
            }
        },
        // 修改图片错误处理方法
        handleImageError(event, item) {
            // 添加日志便于调试
            // console.log('Image load failed, retrying...', item.url);

            // // 生成新的时间戳
            // const timestamp = Date.now();
            // const newUrl = item.url.includes('_t=')
            //     ? item.url.replace(/(_t=)\d+/, `$1${timestamp}`)
            //     : `${item.url}&_t=${timestamp}`;

            // // 添加延迟重试机制
            // setTimeout(() => {
            //     event.target.src = newUrl;
            // }, 1000); // 延迟1秒后重试
        },
    },
    created() {
        this.selectId = [];
    },
    beforeDestroy() {
        this.$baseEventBus.$off("$Bus_start");
        this.$baseEventBus.$off("$Bus_end");
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        // 清理所有资源
        if (this.endShow) {
            this.stopRunning();
        }
    },
};
</script>
<style lang="scss">
.flex-container {
    display: flex;
    padding: 20px;
    height: 100vh;

    .box {
        padding: 20px;
        text-align: center;
    }

    .left-side {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        flex: 3;
        position: relative;
        margin-right: 20px;

        .textBox {
            background: #ffffff;
            box-shadow: 0px 2px 9px 0px #b6b6b6;
            border-radius: 16px;
            min-height: calc(100vh - 100px);
            max-height: calc(100vh - 100px);
            display: flex;
            justify-content: center;
            align-items: center;

            span {
                font-size: 26px;
                color: #727990;
                font-weight: 900;
            }

            .iconfont.icon-lbznjiazaizhong {
                animation: spin 1s linear infinite;
                font-size: 24px;
                margin-right: 5px;
                /* 添加旋转动画 */
            }

            @keyframes spin {
                from {
                    transform: rotate(0deg);
                    /* 从0度开始 */
                }

                to {
                    transform: rotate(360deg);
                    /* 旋转到360度 */
                }
            }
        }

        .box1 {
            background: #ffffff;
            box-shadow: 0px 2px 9px 0px #b6b6b6;
            border-radius: 16px;
        }

        .nine-grid {
            min-height: calc(100vh - 100px);
            max-height: calc(100vh - 100px);
            display: grid;
            width: 100%;
            /* 宽度自适应 */
            gap: 10px;
            /* 网格间的间隔 */
            padding: 20px;
            /* 容器内边距 */
            box-sizing: border-box;

            .grid-item {
                font-size: 12px;
                overflow: hidden;
                /* 防止图片撑开宫格 */
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;
                border-radius: 9px;
                border: 1px solid #dedee0;

                a {
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 4px;
                    color: #000000;
                    font-weight: 900;
                    width: 150px;
                    max-width: 150px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    cursor: pointer;
                    z-index: 999;
                    font-size: 16px;
                    color: #36aa0f;

                    span {
                        display: inline-block;
                        font-size: 16px;
                        color: #36aa0f;
                        margin-right: 2px;
                    }
                }

            }

            .iframeClass {
                width: 100%;
                height: 100%;
                object-fit: scale-down;
                /* 图片等比例自适应宫格 */
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }
        }
    }

    .imgbox {
        display: flex;
        flex-direction: column;

        .topImg {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin-bottom: 30px;

            .num {
                padding: 24px 66px 24px 0px;
                display: flex;
                justify-content: flex-start;
                align-content: center;
                background: #ffffff;
                box-shadow: 0px 2px 16px 0px rgba(153, 162, 192, 0.24);
                border-radius: 18px;
                border: 1px solid #c7d3fa;
                align-items: center;

                .num1 {
                    display: flex;
                    flex-direction: column;
                    font-weight: bold;
                    font-size: 24px;
                    color: #333333;
                    margin-left: 40px;

                    .a1 {
                        margin-bottom: 10px;
                    }
                }
            }
        }

        .bottomimg {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;

            .centerImg {
                padding: 50px 30px 50px 30px;
                background: #ffffff;
                -webkit-box-shadow: 0px 2px 16px 0px rgba(153, 162, 192, 0.24);
                box-shadow: 0px 2px 16px 0px rgba(153, 162, 192, 0.24);
                border-radius: 18px;
                border: 1px solid #c7d3fa;
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin-right: 30px;

                span {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;

                    a {
                        display: inline-block;
                    }

                    .text {
                        font-weight: bold;
                        font-size: 22px;
                        color: #333333;
                    }

                    .text1 {
                        font-weight: bold;
                        font-size: 34px;
                        width: 149px;
                    }
                }
            }

            .gifClass {
                height: 340px;
                flex: 2;
                background-image: url("../../../assets/imgs/background.png");
                background-repeat: no-repeat;
                background-size: 100% 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }

    .setchange {
        position: absolute;
        right: 0px;
        top: 10px;
        width: 22px;
        height: 22px;
    }

    .box2 {
        background: #ffffff;
        box-shadow: 0px 2px 9px 0px #b6b6b6;
        border-radius: 16px;
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
        overflow: auto;

        .header {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;

            a {
                font-weight: bold;
                font-size: 18px;
                margin-right: 10px;

                .el-select {
                    font-weight: bold;
                    font-size: 14px;
                    max-width: 100px;
                    margin-top: 5px;

                    .el-input__inner {
                        height: 30px;
                        line-height: 30px;
                        background: none;
                        border: none;
                        font-weight: bold;
                        font-size: 14px;
                    }

                    .el-input__icon {
                        line-height: 30px;
                    }

                    .el-input {
                        .el-select__caret {
                            color: #000000;
                        }
                    }
                }
            }
        }

        .el-table {
            width: 402px;
            min-width: 402px;

            .el-table__body-wrapper {
                min-height: calc(100vh - 730px);
                max-height: calc(100vh - 730px);
                overflow-x: hidden !important;
                overflow-y: auto !important;
            }
        }

        .effectClass {
            margin: auto;
            margin-top: 40px;

            span {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: flex-start;
                margin-bottom: 35px;

                a {
                    font-weight: bold;
                    font-size: 18px;

                    &:nth-child(1) {
                        color: #000000;
                    }

                    &:nth-child(2) {
                        color: #9dc9f6;
                    }
                }
            }
        }
    }

    .box3 {
        background: #ffffff;
        box-shadow: 0px 2px 9px 0px #b6b6b6;
        border-radius: 16px;
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
        overflow: auto;

        .header {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            margin-bottom: 5px;

            a {
                font-weight: bold;
                font-size: 18px;
                margin-right: 10px;

                .el-select {
                    font-weight: bold;
                    font-size: 14px;
                    max-width: 100px;
                    margin-top: 5px;

                    .el-input__inner {
                        height: 30px;
                        line-height: 30px;
                        background: none;
                        border: none;
                        font-weight: bold;
                        font-size: 14px;
                    }

                    .el-input__icon {
                        line-height: 30px;
                    }

                    .el-input {
                        .el-select__caret {
                            color: #000000;
                        }
                    }
                }
            }
        }

        .el-table {
            width: 402px;
            min-width: 402px;

            .el-table__body-wrapper {
                min-height: calc(100vh - 750px);
                max-height: calc(100vh - 750px);
                overflow-x: hidden !important;
                overflow-y: auto !important;
                border: none;
            }
        }
    }

    .right-side {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        flex: 1;

        i {
            font-size: 20px;
        }

        .dragClass {
            min-height: calc(100vh - 135px);
            max-height: calc(100vh - 135px);
            padding: 10px;
            overflow-y: auto;

            .box4 {
                background: #ffffff;
                box-shadow: 0px 2px 9px 0px #b6b6b6;
                border-radius: 16px;
                margin-bottom: 20px;
                display: flex;
                flex-direction: column;
                overflow: auto;

                .header {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;

                    a {
                        font-weight: bold;
                        font-size: 18px;
                        margin-right: 10px;

                        .el-select {
                            font-weight: bold;
                            font-size: 14px;
                            max-width: 100px;
                            margin-top: 5px;

                            .el-input__inner {
                                height: 30px;
                                line-height: 30px;
                                background: none;
                                border: none;
                                font-weight: bold;
                                font-size: 14px;
                            }

                            .el-input__icon {
                                line-height: 30px;
                            }

                            .el-input {
                                .el-select__caret {
                                    color: #000000;
                                }
                            }
                        }
                    }
                }

                .el-table {
                    width: 423px;
                    min-width: 423px;

                    .el-table__body-wrapper {
                        min-height: calc(100vh - 620px);
                        max-height: calc(100vh - 620px);
                        overflow-x: hidden !important;
                        overflow-y: auto !important;
                    }
                }

                .stageClass {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    min-height: calc(100vh - 230px);
                    max-height: calc(100vh - 230px);
                    overflow-x: hidden !important;
                    overflow-y: auto !important;
                    padding: 10px;

                    .stageItem {
                        span {
                            display: flex;
                            flex-direction: row;
                            justify-content: space-around;
                            align-items: center;
                            font-weight: 900;

                            .progress {
                                display: flex;
                                flex-direction: column;
                                justify-content: flex-start;
                                align-items: center;

                                .custom-progress {
                                    .el-progress__text {
                                        font-size: 16px !important;
                                        color: #000000 !important;
                                    }

                                    .el-progress-circle {
                                        min-height: 80px !important;
                                        min-width: 80px !important;
                                        max-height: 80px !important;
                                        max-width: 80px !important;
                                    }
                                }


                                i {
                                    font-size: 32px;
                                }

                            }

                            a {
                                font-size: 26px;

                                i {
                                    font-size: 26px;
                                    font-weight: bolder;
                                }
                            }
                        }

                        .dashold {
                            display: flex;
                            justify-content: center;
                            flex-direction: column;
                            align-items: center;
                            margin-right: 10px;

                            .linetClass {
                                height: 65px;
                                border-style: dashed;
                                border-color: #000000;
                                /* 设置边框颜色 */
                                border-width: 1px;
                                /* 设置边框宽度 */
                            }

                            .jiantou {
                                color: #000000;
                                margin-top: -8px;
                            }

                        }
                    }
                }
            }
        }

        .el-dialog {
            width: 38%;
            border-radius: 10px;

            .el-dialog__body {
                padding: 5px 10px 10px 15px;
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                flex-wrap: wrap;

                .imgClass {
                    padding: 10px;
                    margin: 10px;
                    border-radius: 10px;
                    background-color: rgba(255, 255, 255, 1);
                    box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.14);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;

                    img {
                        max-width: 285px;
                        max-height: 270px;
                        min-width: 285px;
                        min-height: 270px;
                    }

                    .dragable5 {
                        max-width: 285px;
                        max-height: 540px;
                        min-width: 285px;
                        min-height: 540px;
                    }
                }
            }

            .el-button {
                padding: 10px 15px;
            }

            .el-button--default {
                border: 0.005208rem solid #000000;
                color: #000000;
            }

            .el-button--primary {
                border: 0.005208rem solid #000000;
                background-color: #000000;
                color: #ffffff;
            }
        }


    }


    .el-table {
        th.el-table__cell {
            background-color: #e3eefa;
            border: 1px solid #f2f3f5;
        }

        td.el-table__cell {
            border-right: 1px solid #ebeef5;
            padding: 2px 0;
        }

        th.el-table__cell>.cell {
            color: #000000;
            font-size: 16px;
        }
    }


    .el-button+.el-button,
    .el-checkbox.is-bordered+.el-checkbox.is-bordered {
        margin-left: 0px;
    }

    .actives {
        color: #3056d3;
        width: 88px;
        height: 30px;
        font-weight: bold;
        line-height: 30px;
        background: #ffffff;
        border: 1px solid #e4e7ed;
        border-image: linear-gradient(168deg, rgb(41, 157, 250), rgb(48, 87, 212)) 1 1;
        cursor: pointer;
    }
}

.nine-grid1 {
    grid-template-columns: repeat(1, 1fr);
    /* 一宫格 */
    grid-template-rows: repeat(1, 1fr);
}

.nine-grid2 {
    grid-template-columns: repeat(2, 1fr);
    /* 二宫格 */
    grid-template-rows: repeat(1, 1fr);
}

.nine-grid4 {
    grid-template-columns: repeat(2, 1fr);
    /* 四宫格 */
    grid-template-rows: repeat(2, 1fr);
}

.nine-grid6 {
    grid-template-columns: repeat(3, 1fr);
    /* 六宫格 */
    grid-template-rows: repeat(2, 1fr);
}

.nine-grid9 {
    grid-template-columns: repeat(3, 1fr);
    /* 九宫格 */
    grid-template-rows: repeat(3, 1fr);
}

.nine-grid12 {
    grid-template-columns: repeat(4, 1fr);
    /* 十二宫格 */
    grid-template-rows: repeat(3, 1fr);
}

.nine-grid16 {
    grid-template-columns: repeat(4, 1fr);
    /* 十六宫格 */
    grid-template-rows: repeat(4, 1fr);
}

.nine-grid-more {
    grid-template-columns: repeat(4, 1fr);
    /* 创建四列 */
    grid-auto-rows: minmax(138.25, max-content);
    /* 根据内容自动调整行高，保持十六宫格的高度 */
    align-items: start;

    /* 垂直方向上对齐 */
    .grid-item {
        height: 138.25px;
        /* 根据需要设置高度 */
    }
}
</style>
