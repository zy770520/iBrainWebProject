<template>
    <div class="flex-container">
        <div class="left-side">
            <div class="box box1 nine-grid" id="grid" ref="viewer" v-if="isRunning">
                <div class="grid-item" v-for="(item, index) in cameraIpData" :key="index"
                    v-if="cameraIpData && cameraIpData.length">
                    <el-tooltip v-if="item.name.length > 12" :content="item.name" placement="top">
                        <a :class="{ 'with-save': item.save_image_behaviour !== 'NotSave' }">
                            <span>•</span>
                            {{ item.name }}
                            <span v-if="item.save_image_behaviour !== 'NotSave'">(开启存图)</span>
                        </a>
                    </el-tooltip>
                    <a v-else :class="{ 'with-save': item.save_image_behaviour !== 'NotSave' }">
                        <span>•</span>{{ item.name }}
                        <span v-if="item.save_image_behaviour !== 'NotSave'">
                            (开启存图)
                        </span>
                    </a>
                    <i class="iconfont icon-lbznquanpinganniu" style="color: #000000"
                        @click="handleFullScreen(index)"></i>
                    <img :src="item.url" class="iframeClass" id="images" :key="item.url" loading="lazy" />
                </div>
            </div>
            <div v-else class="textBox">
                <i v-if="isLoadingTransfrom" class="iconfont icon-lbznjiazaizhong" style="cursor: pointer;"></i>
                <span v-if="isLoadingTransfrom">{{ loadingText }}...</span>
                <span v-else>{{ loadingText }}</span>
            </div>
        </div>
        <div class="right-side">
            <div class="dragClass">
                <div v-if="rightCards.length > 0">
                    <template v-for="card in rightCards">
                        <SummaryCard v-if="card.type === 'summary' && configType == 'Quality'" :key="card.id"
                            :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted"
                            :isClearCardData="isClearCardData" @remove="removeCard(card.id)" />
                        <ExecutorCard v-if="card.type === 'executor' && configType == 'Quality'" :key="card.id"
                            :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted" :configId="configId"
                            :isClearCardData="isClearCardData" @remove="removeCard(card.id)" />
                        <SizeCard v-if="card.type === 'Size' && configType == 'Quality'" :key="card.id"
                            :cardId="card.id" :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted"
                            :isDisabled="isDisabled" :sizeCardSelectData="filteredSizeCardSelectData"
                            :selectSizeCardSoure="card.selectCardSoure" @sizeParams="getSizeParams"
                            :isClearCardData="isClearCardData" @remove="removeCard(card.id)" />
                        <QualityCard v-if="card.type === 'Quality'" :key="card.id" :cardId="card.id"
                            :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted" :isDisabled="isDisabled"
                            :qualityCardSelectData="filteredQualityCardSelectData"
                            :selectQuailtyCardSoure="card.selectCardSoure" :configType="configType"
                            :isClearCardData="isClearCardData" @quailtyParams="getQualityParams"
                            @remove="removeCard(card.id)" />
                        <ThickCard v-if="card.type === 'Thick' && configType == 'Quality'" :key="card.id"
                            :cardId="card.id" :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted"
                            :isDisabled="isDisabled" :thickCardSelectData="filteredThickCardSelectData"
                            :selectThickCardSoure="card.selectCardSoure" @thickParams="getThickParams"
                            :isClearCardData="isClearCardData" @remove="removeCard(card.id)" />
                        <SpeedCard v-if="card.type === 'Speed' && configType == 'Monitor'" :key="card.id"
                            :cardId="card.id" :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted"
                            :isDisabled="isDisabled" :speedCardSelectData="filteredSpeedCardSelectData"
                            :selectSpeedCardSoure="card.selectCardSoure" @speedParams="getSpeedParams"
                            :isClearCardData="isClearCardData" @remove="removeCard(card.id)" />
                        <StageCard v-if="card.type === 'Stage' && configType == 'Monitor'" :key="card.id"
                            :cardId="card.id" :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted"
                            :isDisabled="isDisabled" :stageCardSelectData="filteredStageCardSelectData"
                            :selectStageCardSoure="card.selectCardSoure" @stageParams="getStageParams"
                            :isClearCardData="isClearCardData" @remove="removeCard(card.id)" />
                        <SequenceCard v-if="card.type === 'Relative' && configType == 'Monitor'" :key="card.id"
                            :cardId="card.id" :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted"
                            :isDisabled="isDisabled" :sequenceCardSelectData="filteredSequenceCardSelectData"
                            :selectSequenceCardSoure="card.selectCardSoure" @sequenceParams="getSequenceParams"
                            :isClearCardData="isClearCardData" @remove="removeCard(card.id)" />
                        <OperationStageCard v-if="card.type === 'OperationStage' && configType == 'Monitor'"
                            :key="card.id" :cardId="card.id" :isCallEventSource="isCallEventSource"
                            :isEdit="card.isShowDeleted" :isDisabled="isDisabled"
                            :operationStageCardSelectData="filteredOperationStageCardSelectData"
                            :selectOperationStageCardSoure="card.selectCardSoure"
                            @operationStageParams="getOperationStageParams" :isClearCardData="isClearCardData"
                            @remove="removeCard(card.id)" />
                        <ScanRecognitionCard v-if="card.type === 'ScanRecognition' && configType == 'Monitor'"
                            :key="card.id" :cardId="card.id" :isCallEventSource="isCallEventSource"
                            :isEdit="card.isShowDeleted" :isDisabled="isDisabled"
                            :scanRecognitionCardSelectData="filteredScanRecognitionCardSelectData"
                            :selectScanRecognitionCardSoure="card.selectCardSoure"
                            @scanRecognitionParams="getScanRecognitionParams" :isClearCardData="isClearCardData"
                            @remove="removeCard(card.id)" />
                        <QualityTotalCard v-if="card.type === 'QualityTotal' && configType == 'Monitor'" :key="card.id"
                            :cardId="card.id" :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted"
                            :isDisabled="isDisabled" :qualityTotalCardSelectData="filteredQualityTotalCardSelectData"
                            :selectQualityTotalCardSoure="card.selectCardSoure" :isClearCardData="isClearCardData"
                            @qualityTotalParams="getQualityTotalParams" @remove="removeCard(card.id)" />
                        <TotalTxtCard v-if="card.type === 'TotalTxt' && configType == 'Monitor'" :key="card.id"
                            :cardId="card.id" :isCallEventSource="isCallEventSource" :isEdit="card.isShowDeleted"
                            :isDisabled="isDisabled" :totalTxtCardSelectData="filteredTotalTxtCardSelectData"
                            :selectTotalTxtCardSoure="card.selectCardSoure" @totalTxtParams="getTotalTxtParams"
                            @remove="removeCard(card.id)" />
                    </template>
                </div>
                <div v-else class="dragClass-txt">
                    暂无数据
                </div>
            </div>
            <div v-if="isShowEditingBtn && $store.state.applicationInfo.currentUser" class="edit-component">
                <a v-if="editComponentText == '完成'" @click="cancelEditComponent">取消</a>
                <a @click="confirmEditComponent">{{ editComponentText }}</a>
            </div>
        </div>
        <div id="middle" class="middle-side" v-if="isEditing">
            <div class="middle-img">
                <div class="imgclass" v-if="configType == 'Quality'" @click="addComponent('Size')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_size.png" />
                </div>
                <div class="imgclass" @click="addComponent('Quality')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_quailty.png" />
                </div>
                <div class="imgclass" v-if="configType == 'Quality'" @click="addComponent('summary')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_summary.png" />
                </div class="imgclass">
                <div class="imgclass" v-if="configType == 'Quality'" @click="addComponent('executor')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_summary2.png" />
                </div>
                <div class="imgclass" v-if="configType == 'Quality'" @click="addComponent('Thick')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_thick.png" />
                </div>
                <div class="imgclass" v-if="configType == 'Monitor'" @click="addComponent('Speed')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_speed.png" />
                </div>
                <div class="imgclass" v-if="configType == 'Monitor'" @click="addComponent('Stage')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_stage.png" />
                </div>
                <div class="imgclass" v-if="configType == 'Monitor'" @click="addComponent('Relative')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_sequence.png" />
                </div>
                <div class="imgclass" v-if="configType == 'Monitor'" @click="addComponent('OperationStage')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_operation_stage.png" />
                </div>
                <div class="imgclass" v-if="configType == 'Monitor'" @click="addComponent('ScanRecognition')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_scan_recognition.png" />
                </div>
                <div class="imgclass" v-if="configType == 'Monitor'" @click="addComponent('QualityTotal')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_quailty_total.png" />
                </div>
                <div class="imgclass" @click="addComponent('TotalTxt')">
                    <i class="iconfont icon-lbznicaddadd3"></i>
                    <img src="../../../assets/imgs/card_text.png" />
                </div>
            </div>
        </div>
        <!-- 运行时错误消息弹窗 -->
        <el-dialog title="运行时错误消息:" :visible.sync="errorDialogVisible" custom-class="errors-dialog"
            :close-on-click-modal="false" :modal-append-to-body="false">
            <div class="error-content">
                <div class="error-message">
                    <span>
                        {{ errorMessage }}
                    </span>
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import Viewer from 'viewerjs';
import {
    consoleStart,
    consoleStop,
    queryCardConfig,
    saveCardConfig,
    exeCurrentState,
    queryRuntimeError
} from "@/api/console.js";
import { getLastDisplay } from "@/api/workflowConfig";
import { EventSourceUrl } from "@/utils/index";
import { getWorkflows } from '@/api/workflowConfig.js';
import SummaryCard from "./cardComponents/summaryCard.vue";
import ExecutorCard from "./cardComponents/executorCard.vue";
import SizeCard from "./cardComponents/sizeCard.vue";
import QualityCard from "./cardComponents/qualityCard.vue";
import ThickCard from "./cardComponents/thickCard.vue";
import SpeedCard from "./cardComponents/speedCard.vue";
import StageCard from "./cardComponents/stageCard.vue";
import SequenceCard from "./cardComponents/sequenceCard.vue";
import OperationStageCard from "./cardComponents/operationStageCard.vue";
import ScanRecognitionCard from "./cardComponents/scanRecognitionCard.vue";
import QualityTotalCard from "./cardComponents/qualityTotalCard.vue";
import TotalTxtCard from "./cardComponents/TotalTxtCard.vue";

export default {
    name: "ConsoleMsgCard",
    components: {
        SummaryCard,
        ExecutorCard,
        SizeCard,
        QualityCard,
        ThickCard,
        SpeedCard,
        StageCard,
        SequenceCard,
        OperationStageCard,
        ScanRecognitionCard,
        QualityTotalCard,
        TotalTxtCard
    },
    props: {},
    computed: {
        filteredQualityCardSelectData() {
            return this.qualityCardSelectData.filter(item => !this.selectedQualityItems.includes(item.camera_name));
        },
        filteredSizeCardSelectData() {
            return this.sizeCardSelectData.filter(item => !this.selectedSizeItems.includes(item.camera_name));
        },
        filteredThickCardSelectData() {
            return this.thickCardSelectData.filter(item => !this.selectedThickItems.includes(item.camera_name));
        },
        filteredSpeedCardSelectData() {
            return this.speedCardSelectData.filter(item => !this.selectedSpeedItems.includes(item.camera_name));
        },
        filteredStageCardSelectData() {
            return this.stageCardSelectData.filter(item => !this.selectedStageItems.includes(item.camera_name));
        },
        filteredSequenceCardSelectData() {
            return this.sequenceCardSelectData.filter(item => !this.selectedSequenceItems.includes(item.camera_name));
        },
        filteredOperationStageCardSelectData() {
            return this.operationStageCardSelectData.filter(item => !this.selectedOperationStageItems.includes(item.camera_name));
        },
        filteredQualityTotalCardSelectData() {
            return this.qualityTotalCardSelectData.filter(item => !this.selectedQualityTotalItems.includes(item.camera_name));
        },
        filteredTotalTxtCardSelectData() {
            return this.totalTxtCardSelectData.filter(item => !this.selectedTotalTxtItems.includes(item.camera_name));
        },
        filteredScanRecognitionCardSelectData() {
            return this.scanRecognitionCardSelectData.filter(item => !this.selectedScanRecognitionItems.includes(item.camera_name));
        },
    },
    data() {
        return {
            viewer: null,
            messageStartEventSource: null,
            messageEndEventSource: null,
            dialogVisible: false,
            startShow: true,
            endShow: false,
            isDisabled: false,
            isRunning: false,
            isLoadingTransfrom: false,
            isCallEventSource: false,
            isClearCardData: false,
            isEditing: false,
            isShowEditingBtn: true,
            editComponentText: '编辑小组件',
            loadingText: "设备暂未开始运行!",
            stationNumbers: null,
            qualityCardSelectData: null,
            sizeCardSelectData: null,
            thickCardSelectData: null,
            speedCardSelectData: null,
            stageCardSelectData: null,
            sequenceCardSelectData: null,
            operationStageCardSelectData: null,
            scanRecognitionCardSelectData: null,
            qualityTotalCardSelectData: null,
            totalTxtCardSelectData: null,
            systemStatus: null,
            configId: null,
            sysState: null,
            messageStartResult: null,
            workflowConfigData: [],
            selectId: [],
            cameraIpData: [],
            selectedQualityItems: [],
            selectedSizeItems: [],
            selectedThickItems: [],
            selectedSpeedItems: [],
            selectedStageItems: [],
            selectedSequenceItems: [],
            selectedOperationStageItems: [],
            selectedScanRecognitionItems: [],
            selectedQualityTotalItems: [],
            selectedTotalTxtItems: [],
            configType: '',
            rightCards: [
                {
                    type: 'summary', id: 'summary-1', isShowDeleted: false, selectCardSoure: null
                },
                {
                    type: 'executor', id: 'executor-1', isShowDeleted: false, selectCardSoure: null
                }
            ],
            cardCounter: {
                summary: 1,
                executor: 1,
                Size: 0,
                Quality: 0,
                Thick: 0,
                Speed: 0,
                Stage: 0,
                Relative: 0,
                OperationStage: 0,
                ScanRecognition: 0,
                QualityTotal: 0,
                TotalTxt: 0,
            },
            errorMessage: '',
            errorDialogVisible: false,
            timer: null,
            startTime: null,
        };
    },
    watch: {
        isEditing: {
            handler(newVal) {
                console.log("🚀 ~ handler ~ newVal:", newVal)
                this.$baseEventBus.$emit("$Bus_isShowEditing", newVal);
            },
            immediate: true
        }
    },
    mounted() {
        //刷新页面后调用接口查询当前运行状态
        this.getCurrentState();
        const workflowData = JSON.parse(this.$sessionStorage.getItem('workflowData'));
        const configId = workflowData ? workflowData.configId : '';
        const workflow = workflowData ? workflowData.workflow : '';
        if (workflow && configId) {
            console.log(1);
            this.getCurrentConfigDetail(configId, workflow);
        }
        this.$baseEventBus.$on("$Bus_workflowConfig", (config_id, config_type, data) => {
            this.configType = config_type;
            if (data) {
                console.log(2);
                this.getCurrentConfigDetail(config_id, data);
            }
        });
        this.$baseEventBus.$on("$Bus_start", async (data, config_id) => {
            if (data == 'start') {
                //如果九宫格img的src不为空，则需要先清空九宫格img的src
                if (document.querySelectorAll('.iframeClass').length) {
                    document.querySelectorAll('.iframeClass').forEach(item => {
                        item.src = "";
                    });
                    this.isRunning = false;
                    this.isClearCardData = true;
                }
                // this.$message.warning('设备启动');
                console.log('设备启动');
                this.getCurrentState(config_id);
            }
        });
        this.$baseEventBus.$on("$Bus_end", (data) => {
            if (data == 'end') {
                this.stopRunning();
            }
        });
        // 监听beforeunload事件，在页面刷新或关闭前关闭EventSource连接
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    },
    methods: {
        //全屏显示图像
        handleFullScreen(index) {
            if (this.viewer) {
                this.viewer.destroy();
            }

            this.$nextTick(() => {
                const viewerOptions = {
                    inline: true,
                    navbar: false,
                    title: false,
                    backdrop: 'static',
                    button: false,
                    keyboard: true,
                    toolbar: {
                        zoomIn: true,
                        zoomOut: true,
                        reset: true,
                    },
                    initialViewIndex: index,
                    container: this.$refs.viewer,
                    viewed() {
                        const viewerCanvasImg = document.querySelector('.viewer-canvas img');
                        if (viewerCanvasImg) {
                            viewerCanvasImg.style.imageRendering = 'pixelated';
                        }
                    }
                };

                // 初始化 viewer
                this.viewer = new Viewer(this.$refs.viewer, viewerOptions);

                // 显示指定索引的图片
                this.viewer.view(index);

                // 使用setTimeout确保viewer完全初始化后再添加关闭按钮
                setTimeout(() => {
                    // 查找.viewer-container元素
                    const viewerContainer = document.querySelector('.viewer-container');

                    if (viewerContainer) {
                        viewerContainer.style.position = 'absolute';
                        viewerContainer.style.top = '0';
                        viewerContainer.style.left = '0';
                        viewerContainer.style.width = '100%';
                        viewerContainer.style.height = '100%';
                        viewerContainer.style.background = '#fff';
                        viewerContainer.style.zIndex = '1000';

                        // 检查是否已存在关闭按钮，如果存在则先移除
                        const existingCloseButton = document.querySelector('.viewer-close-btn');
                        if (existingCloseButton) {
                            existingCloseButton.remove();
                        }

                        // 创建关闭按钮并设置唯一类名
                        const closeButton = document.createElement('div');
                        closeButton.className = 'viewer-close-btn';

                        // 设置内联样式，确保按钮可见
                        closeButton.style.position = 'absolute';
                        closeButton.style.top = '20px';
                        closeButton.style.right = '20px';
                        closeButton.style.width = '40px';
                        closeButton.style.height = '40px';
                        closeButton.style.backgroundColor = 'red'; // 使用醒目的红色
                        closeButton.style.borderRadius = '50%';
                        closeButton.style.display = 'flex';
                        closeButton.style.justifyContent = 'center';
                        closeButton.style.alignItems = 'center';
                        closeButton.style.cursor = 'pointer';
                        closeButton.style.zIndex = '9999'; // 使用非常高的z-index
                        closeButton.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

                        // 使用简单的X符号
                        closeButton.innerHTML = '<span style="color: white; font-size: 28px; font-weight: bold; line-height: 28px;">×</span>';

                        // 添加点击事件
                        closeButton.addEventListener('click', () => {
                            if (this.viewer) {
                                this.viewer.destroy();
                                console.log('关闭预览');
                            }
                        });

                        // 添加到容器
                        viewerContainer.appendChild(closeButton);

                        // 打印确认信息
                        console.log('关闭按钮已添加', closeButton);
                    } else {
                        console.error('未找到.viewer-container元素');
                    }
                }, 300); // 增加延时，确保DOM已完全加载
            });
        },
        //查询当前运行状态
        getCurrentState(config_id) {
            exeCurrentState().then(res => {
                let stateResult = res;
                this.sysState = res;
                if (stateResult) {
                    this.$baseEventBus.$emit("$Bus_currentConfigId", stateResult.config_id);
                    if (stateResult.state == 'Starting') {
                        //设备正在启动
                        //查询工作流
                        getWorkflows(stateResult.config_id).then(res => {
                            console.log(3);
                            this.getCurrentConfigDetail(stateResult.config_id, res);
                            this.queryRuntimeError();
                            // this.$message.warning('设备正在启动');
                            console.log('设备正在启动');
                            this.getMessageStartEvent(stateResult.config_id, this.sysState);
                        })
                    } else if (stateResult.state == 'Started') {
                        //设备启动完成
                        //查询工作流
                        getWorkflows(stateResult.config_id).then(res => {
                            console.log(4);
                            this.getCurrentConfigDetail(stateResult.config_id, res);
                            this.queryRuntimeError();
                            this.isRunning = true;
                            this.loadingText = null;
                            // 确保 getCermaData 及内部 DOM 更新完成后再刷新图片
                            this.getCermaData().then(() => {
                                this.$nextTick(() => {
                                    this.refreshImages();
                                });
                            });
                            this.isDisabled = true;
                            this.startShow = false;
                            this.endShow = true;
                            this.isLoadingTransfrom = false;
                            this.$nextTick(() => {
                                this.isCallEventSource = true;
                            });
                            this.isShowEditingBtn = false;
                            this.isDisabled = false;
                            this.$store.state.applicationInfo.showConfigMenu = false;
                            if (this.messageStartEventSource) {
                                this.messageStartEventSource.close();
                            }
                            this.getMessageEndEvent();
                            this.$baseEventBus.$emit("$start_Success", this.isDisabled, this.startShow, this.endShow, '', false, true);
                            this.startTimer();
                        })
                    } else if (stateResult.state == 'Stopping') {
                        //设备正在停止
                        this.getMessageEndEvent();
                    }
                } else {
                    if (config_id) {
                        // this.$message.warning('设备未启动');
                        console.log('设备未启动');
                        this.getMessageStartEvent(config_id);
                    }
                }
            })
        },
        //启动事件
        async getMessageStartEvent(config_id, sysState) {
            if (config_id) {
                try {
                    if (this.messageStartEventSource) {
                        this.messageStartEventSource.close();
                    }
                    console.log('调用启动事件');
                    // this.$message.warning('调用启动事件');
                    this.messageStartEventSource = new EventSource(`${EventSourceUrl}/execution/start_event`);
                    let that = this;
                    this.messageStartEventSource.onmessage = function (event) {
                        let messageResult = JSON.parse(event.data);
                        if (messageResult) {
                            that.isLoadingTransfrom = true;
                            that.loadingText = messageResult.details.description;
                            that.systemStatus = messageResult;
                            that.$baseEventBus.$emit("$start_Success", that.isDisabled, that.startShow, that.endShow, that.systemStatus, true, true);
                        }
                        // 如果收到最后一条消息且状态为Running，则处理成功状态
                        if (messageResult && messageResult.is_final && messageResult.status == 'Running') {
                            console.log("start最后一条消息");
                            that.handleStartSuccess();
                            // 关闭 EventSource
                            if (that.messageStartEventSource) {
                                that.messageStartEventSource.close();
                            }
                        }
                    };
                    this.messageStartEventSource.onerror = function (event) {
                    };
                    if (!sysState || sysState.state == 'Starting') {
                        // 调用 consoleStart，并在失败时执行逻辑
                        try {
                            await consoleStart({ config_id: config_id });
                        } catch (error) {
                            this.isLoadingTransfrom = false;
                            this.loadingText = "设备暂未开始运行!";
                            this.$store.state.applicationInfo.showConfigMenu = true;
                            this.$baseEventBus.$emit("$start_Success", this.isDisabled, this.startShow, this.endShow, '', false, false);
                            if (this.messageStartEventSource) {
                                this.messageStartEventSource.close();
                            }
                            if (this.isCallEventSource) {
                                this.isCallEventSource.close();
                            }
                            return; // 结束后续逻辑
                        }
                    }
                } finally {
                    if (this.messageStartEventSource) {
                        this.messageStartEventSource.close();
                    }
                }
            } else {
                this.$message.warning('请选择一条数据运行！')
            }
        },
        // 处理启动成功的方法
        handleStartSuccess() {
            this.isRunning = true;
            this.loadingText = null;
            this.getCermaData().then(() => {
                this.$nextTick(() => {
                    this.refreshImages();
                });
            });
            this.startTimer();
            this.$message.success("设备已启动！");
            this.isDisabled = false;
            this.startShow = false;
            this.endShow = true;
            this.isLoadingTransfrom = false;
            this.isCallEventSource = true;
            this.isShowEditingBtn = false;
            this.isClearCardData = false;
            this.$baseEventBus.$emit("$start_Success", this.isDisabled, this.startShow, this.endShow, '', false, true);
            this.$store.state.applicationInfo.showConfigMenu = false;
            this.queryRuntimeError();
            this.getMessageEndEvent();
        },
        //停止事件
        getMessageEndEvent() {
            if (this.messageEndEventSource) {
                this.messageEndEventSource.close();
            }
            this.messageEndEventSource = new EventSource(`${EventSourceUrl}/execution/stop_event`);
            let that = this;
            this.messageEndEventSource.onmessage = function (event) {
                let messageResult = JSON.parse(event.data);
                if (messageResult) {
                    console.log(11111);
                    // 移除所有class为iframeClass的img元素，解决前端图像断流问题
                    // document.querySelectorAll('.iframeClass').forEach(item => {
                    //     item.src = "";
                    // });
                    // that.isRunning = false;
                    that.isCallEventSource = false;
                    // that.isLoadingTransfrom = true;
                    that.loadingText = messageResult.details.description;
                    that.systemStatus = messageResult;

                    if (messageResult.is_final || (!messageResult.is_final && messageResult.state == 'Stopping' && messageResult.details.description.includes('所有电机'))) {
                        that.$message.success("设备已停止！");
                        that.isDisabled = false;
                        that.startShow = true;
                        that.endShow = false;
                        // that.isLoadingTransfrom = false;
                        // that.loadingText = "设备暂未开始运行!";
                        that.isShowEditingBtn = true;

                        // 获取并显示最后一帧图片
                        that.fetchLastFrames();

                        that.$baseEventBus.$emit("$start_Fail", that.isDisabled, that.startShow, that.endShow, '', false);

                        // 清理所有相关资源
                        if (that.messageEndEventSource) {
                            that.messageEndEventSource.close();
                        }
                    } else {
                        that.$baseEventBus.$emit("$start_Fail", that.isDisabled, that.startShow, that.endShow, that.systemStatus, true);
                    }
                }
            };
            this.messageEndEventSource.onerror = function (event) {
                console.error('messageEndEventSource-Error:', event);
                that.isDisabled = false;
                that.startShow = true;
                that.endShow = false;
                that.isLoadingTransfrom = false;
                that.loadingText = "设备暂未开始运行!";
                that.$baseEventBus.$emit("$start_Fail", that.isDisabled, that.startShow, that.endShow, '', false);
                that.isShowEditingBtn = true;
                // 清理所有相关资源
                if (that.messageEndEventSource) {
                    that.messageEndEventSource.close();
                }
            };
        },
        //停止运行
        async stopRunning() {
            if (this.endShow) {
                try {
                    await consoleStop();
                    this.stopTimer();
                } catch (error) {
                    console.log("🚀 ~ stopRunning ~ error:", error)
                    this.isDisabled = false;
                    this.startShow = true;
                    this.endShow = false;
                    this.isLoadingTransfrom = false;
                    this.loadingText = "设备暂未开始运行!";

                    // 尝试获取最后一帧图片
                    this.fetchLastFrames();

                    this.$baseEventBus.$emit("$start_Fail", this.isDisabled, this.startShow, this.endShow, '', false);
                    this.isShowEditingBtn = true;
                    // 清理所有相关资源
                    if (this.messageEndEventSource) {
                        this.messageEndEventSource.close();
                    }
                    return; // 结束后续逻辑
                } finally {
                    this.isDisabled = false;
                    this.$baseEventBus.$emit("$start_Fail", this.isDisabled, this.startShow, this.endShow, '', false);
                }
            }
        },
        //获取当前工作配置详情
        getCurrentConfigDetail(config_id, data) {
            // 过滤掉enable_workflow为false的工作流数据
            const filteredWorkflow = data.workflow.filter(item => item.enable_workflow);
            //查询卡片配置
            queryCardConfig({ config_id: config_id }).then(res => {
                if (res && res.card_config) {
                    console.log("🚀 ~ queryCardConfig ~ res:", JSON.parse(res.card_config));
                }
                if (res) {
                    let cardResult = JSON.parse(res.card_config);
                    // 创建一个新数组，只包含workflow_id匹配的卡片
                    let newCardResult = cardResult.filter(card => {
                        // 如果卡片类型是summary或executor，直接保留
                        if (card.type === 'summary' || card.type === 'executor') {
                            return true;
                        }
                        // 对于其他类型的卡片，检查workflow_id是否存在于filteredWorkflow中
                        return card.selectCardSoure && filteredWorkflow.some(workflow =>
                            workflow.id === card.selectCardSoure.workflow_id
                        );
                    });
                    // 设置卡片的删除图标显示状态
                    if (this.editComponentText == '完成') {
                        newCardResult.forEach(item => {
                            item.isShowDeleted = true;
                        });
                    } else {
                        newCardResult.forEach(item => {
                            item.isShowDeleted = false;
                        });
                    }
                    this.rightCards = newCardResult;
                } else {
                    this.rightCards = [
                        {
                            type: 'summary', id: 'summary-1', isShowDeleted: false, selectCardSoure: null
                        },
                        {
                            type: 'executor', id: 'executor-1', isShowDeleted: false, selectCardSoure: null
                        }
                    ];
                }
            });
            this.configId = config_id;
            this.workflowConfigData = { ...data, workflow: filteredWorkflow };
            let cardData = filteredWorkflow.map((camera, index) => {
                return {
                    "value": index,
                    "camera_name": camera.camera.name,
                    "workflow_id": camera.id,
                    "camera_ip": camera.camera.ip,
                    "classes": camera.classes,
                    "threshold_type": camera.classes.type,
                };
            });
            this.qualityCardSelectData = cardData.filter(item => item.threshold_type == "Surface");
            this.sizeCardSelectData = cardData.filter(item => item.threshold_type == "Size");
            this.thickCardSelectData = cardData.filter(item => item.threshold_type == "Thick");
            this.stageCardSelectData = cardData.filter(item => item.threshold_type == "Stage");
            this.speedCardSelectData = cardData.filter(item => item.threshold_type == "Speed");
            this.sequenceCardSelectData = cardData.filter(item => item.threshold_type == "Relative");
            this.operationStageCardSelectData = cardData.filter(item => item.threshold_type == "OperationStage");
            this.scanRecognitionCardSelectData = cardData.filter(item => item.threshold_type == "ScanRecognition");
            this.qualityTotalCardSelectData = cardData.filter(item => item.threshold_type == "Surface");
            this.totalTxtCardSelectData = cardData.filter(item => item.threshold_type == "TotalTxt");
        },
        // 获取多宫格数据
        async getCermaData() {
            //如果九宫格数据中的img的src不为空，则需要先清空九宫格数据中img的src

            this.cameraIpData = this.workflowConfigData.workflow.map(camera => {
                const timestamp = new Date().getTime();
                return {
                    "url": `${EventSourceUrl}/view?ip=${camera.camera.ip}&_t=${timestamp}`,
                    "name": camera.camera.name,
                    "save_image_behaviour": camera.save_image_behaviour
                };
            });
            // 等待 DOM 更新后再执行格子布局的调整
            await this.$nextTick();
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
                        default:
                            if (videoNum > 16) {
                                el.classList.add("nine-grid-more");
                            }
                            break;
                    }
                }
            }
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
        // 添加新方法
        handleBeforeUnload(event) {
            // if (this.endShow) {
            //     this.stopRunning();
            // }
            // if (this.messageStartEventSource) {
            //     this.messageStartEventSource.close();
            // }
        },
        //取消编辑组件
        cancelEditComponent() {
            this.isEditing = false;
            this.editComponentText = "编辑小组件";
            this.rightCards.forEach(item => {
                item.isShowDeleted = false;
            })
        },
        //编辑组件
        confirmEditComponent() {
            if (this.configId) {
                this.isEditing = !this.isEditing;
                if (this.isEditing) {
                    this.editComponentText = "完成";
                    this.rightCards.forEach(item => {
                        item.isShowDeleted = true;
                    })
                } else {
                    this.editComponentText = "编辑小组件";
                    this.rightCards.forEach(item => {
                        item.isShowDeleted = false;
                    })
                }
                if (!this.isEditing && this.editComponentText == "编辑小组件") {
                    // 更新每个卡片的selectCardSoure
                    let arr = this.rightCards.map(card => {
                        if (card.type === 'Size' || card.type === 'Quality' || card.type === 'Thick' || card.type === 'Speed' || card.type === 'Stage' || card.type === 'Relative' || card.type === 'QualityTotal' || card.type === 'TotalTxt' || card.type === 'OperationStage' || card.type === 'ScanRecognition') {
                            return {
                                ...card,
                                selectCardSoure: {
                                    source_id: card.selectCardSoure ? card.selectCardSoure.source_id : null,
                                    workflow_id: card.selectCardSoure ? card.selectCardSoure.workflow_id : null,
                                    camera_ip: card.selectCardSoure ? card.selectCardSoure.camera_ip : null,
                                    camera_name: card.selectCardSoure ? card.selectCardSoure.camera_name : null,
                                    threshold_type: card.type.charAt(0).toUpperCase() + card.type.slice(1)
                                }
                            };
                        }
                        return card;
                    });
                    console.log("🚀 ~ confirmEditComponent ~ arr:", arr)
                    let cardConfigParams = {
                        id: null,
                        config_id: this.configId,
                        card_config: JSON.stringify(arr)
                    };
                    //保存卡片配置
                    saveCardConfig(cardConfigParams).then(res => {
                        this.$message.success('数据保存完成！')
                    })
                }
            } else {
                this.$message.warning('请选择一条数据编辑！')
            }
        },
        //新增组件
        addComponent(type) {
            // 获取当前类型卡片的最大id编号
            const existingCards = this.rightCards.filter(card => card.type === type);
            let maxId = 0;
            if (existingCards.length > 0) {
                maxId = Math.max(...existingCards.map(card => {
                    const idNumber = parseInt(card.id.split('-')[1]);
                    return isNaN(idNumber) ? 0 : idNumber;
                }));
            }

            // 使用最大id + 1作为新卡片的id
            const newId = maxId + 1;
            this.cardCounter[type] = newId;

            var selectCardSoure;
            if (type == 'summary' || type == 'executor') {
                selectCardSoure = null;
            } else {
                selectCardSoure = {
                    "workflow_id": null,
                    "camera_ip": null,
                    "camera_name": null,
                    "threshold_type": type
                }
            }
            const newCard = {
                type: type,
                id: `${type}-${newId}`,
                isShowDeleted: true,
                selectCardSoure: selectCardSoure
            };
            let typeName;
            switch (type) {
                case 'Size':
                    typeName = '尺寸';
                    break;
                case 'Quality':
                    typeName = '外观';
                    break;
                case 'summary':
                    typeName = '汇总';
                    break;
                case 'executor':
                    typeName = '汇总执行';
                    break;
                case 'Thick':
                    typeName = '厚度';
                    break;
                case 'Speed':
                    typeName = '速度';
                    break;
                case 'Stage':
                    typeName = '环节';
                    break;
                case 'Relative':
                    typeName = '线序';
                    break;
                case 'OperationStage':
                    typeName = '环节清单';
                    break;
                case 'ScanRecognition':
                    typeName = '扫码识别';
                    break;
                case 'QualityTotal':
                    typeName = '外观汇总';
                    break;
                case 'TotalTxt':
                    typeName = '样本数量';
                    break;
                default:
                    typeName = type;
            }
            this.rightCards.push(newCard);
            this.$message.success(`【${typeName}类】组件已添加！`)
        },
        //删除组件
        removeCard(cardId) {
            const index = this.rightCards.findIndex(card => card.id === cardId);
            if (index !== -1) {
                const card = this.rightCards[index];
                // 从已选择列表中移除
                if (card.selectCardSoure && card.selectCardSoure.camera_name) {
                    switch (card.type) {
                        case 'Quality':
                            const qualityIndex = this.selectedQualityItems.indexOf(card.selectCardSoure.camera_name);
                            if (qualityIndex > -1) {
                                this.selectedQualityItems.splice(qualityIndex, 1);
                            }
                            break;
                        case 'Size':
                            const sizeIndex = this.selectedSizeItems.indexOf(card.selectCardSoure.camera_name);
                            if (sizeIndex > -1) {
                                this.selectedSizeItems.splice(sizeIndex, 1);
                            }
                            break;
                        case 'Thick':
                            const thickIndex = this.selectedThickItems.indexOf(card.selectCardSoure.camera_name);
                            if (thickIndex > -1) {
                                this.selectedThickItems.splice(thickIndex, 1);
                            }
                            break;
                        case 'Speed':
                            const speedIndex = this.selectedSpeedItems.indexOf(card.selectCardSoure.camera_name);
                            if (speedIndex > -1) {
                                this.selectedSpeedItems.splice(speedIndex, 1);
                            }
                            break;
                        case 'Stage':
                            const stageIndex = this.selectedStageItems.indexOf(card.selectCardSoure.camera_name);
                            if (stageIndex > -1) {
                                this.selectedStageItems.splice(stageIndex, 1);
                            }
                            break;
                        case 'Relative':
                            const sequenceIndex = this.selectedSequenceItems.indexOf(card.selectCardSoure.camera_name);
                            if (sequenceIndex > -1) {
                                this.selectedSequenceItems.splice(sequenceIndex, 1);
                            }
                            break;
                        case 'OperationStage':
                            const operationStageIndex = this.selectedOperationStageItems.indexOf(card.selectCardSoure.camera_name);
                            if (operationStageIndex > -1) {
                                this.selectedOperationStageItems.splice(operationStageIndex, 1);
                            }
                            break;
                        case 'ScanRecognition':
                            const scanRecognitionIndex = this.selectedScanRecognitionItems.indexOf(card.selectCardSoure.camera_name);
                            if (scanRecognitionIndex > -1) {
                                this.selectedScanRecognitionItems.splice(scanRecognitionIndex, 1);
                            }
                            break;
                        case 'QualityTotal':
                            const qualityTotalIndex = this.selectedQualityTotalItems.indexOf(card.selectCardSoure.camera_name);
                            if (qualityTotalIndex > -1) {
                                this.selectedQualityTotalItems.splice(qualityTotalIndex, 1);
                            }
                            break;
                        case 'TotalTxt':
                            const totalTxtIndex = this.selectedTotalTxtItems.indexOf(card.selectCardSoure.camera_name);
                            if (totalTxtIndex > -1) {
                                this.selectedTotalTxtItems.splice(totalTxtIndex, 1);
                            }
                            break;
                    }
                }
                this.rightCards.splice(index, 1);
                this.$message.success('组件已删除！')
            }
        },
        //获取尺寸卡片数据源
        getSizeParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'Size' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的尺寸项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedSizeItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedSizeItems.splice(index, 1);
                    }
                }
                this.selectedSizeItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        //获取外观卡片数据源
        getQualityParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'Quality' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的外观项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedQualityItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedQualityItems.splice(index, 1);
                    }
                }
                this.selectedQualityItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        //获取厚度卡片数据源
        getThickParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'Thick' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的厚度项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedThickItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedThickItems.splice(index, 1);
                    }
                }
                this.selectedThickItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        //获取速度卡片数据源
        getSpeedParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'Speed' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的速度项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedSpeedItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedSpeedItems.splice(index, 1);
                    }
                }
                this.selectedSpeedItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        //获取环节卡片数据源
        getStageParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'Stage' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的环节项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedStageItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedStageItems.splice(index, 1);
                    }
                }
                this.selectedStageItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        //获取线序卡片数据源
        getSequenceParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'Relative' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的线序项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedSequenceItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedSequenceItems.splice(index, 1);
                    }
                }
                this.selectedSequenceItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        //获取环节清单卡片数据源
        getOperationStageParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'OperationStage' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的环节清单项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedOperationStageItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedOperationStageItems.splice(index, 1);
                    }
                }
                this.selectedOperationStageItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        //获取扫码识别卡片数据源
        getScanRecognitionParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'ScanRecognition' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的扫码识别项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedScanRecognitionItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedScanRecognitionItems.splice(index, 1);
                    }
                }
                this.selectedScanRecognitionItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        //获取外观汇总卡片数据源
        getQualityTotalParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'QualityTotal' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的外观汇总项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedQualityTotalItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedQualityTotalItems.splice(index, 1);
                    }
                }
                this.selectedQualityTotalItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        //获取样本数量卡片数据源
        getTotalTxtParams(value) {
            const cardIndex = this.rightCards.findIndex(card => card.type === 'TotalTxt' && card.id === value.source_id);
            if (cardIndex !== -1) {
                // 更新已选择的样本数量项
                const oldValue = this.rightCards[cardIndex].selectCardSoure;
                if (oldValue && oldValue.camera_name) {
                    const index = this.selectedTotalTxtItems.indexOf(oldValue.camera_name);
                    if (index > -1) {
                        this.selectedTotalTxtItems.splice(index, 1);
                    }
                }
                this.selectedTotalTxtItems.push(value.camera_name);
                this.rightCards[cardIndex].selectCardSoure = value;
            }
        },
        // 获取每个相机的最后一帧图片
        async fetchLastFrames() {
            try {
                // 如果没有相机数据，则返回
                if (!this.workflowConfigData || !this.workflowConfigData.workflow || !this.workflowConfigData.workflow.length) {
                    return;
                }

                // 保持isRunning为true以保留九宫格布局
                this.isRunning = true;
                console.log('移除所有class为iframeClass的img元素');
                // 移除所有class为iframeClass的img元素，解决前端图像断流问题
                document.querySelectorAll('.iframeClass').forEach(item => {
                    item.src = "";
                });

                // 等待DOM更新，确保图片源已被清空
                await this.$nextTick();

                // 为每个相机获取最后一帧图片
                const promises = this.workflowConfigData.workflow.map(async (camera) => {
                    try {
                        const result = await getLastDisplay({ ip: camera.camera.ip });
                        if (result && result.bytes) {
                            // 将二进制数据转换为Blob并创建URL
                            const uint8ArrayOfImageData = new Uint8Array(result.bytes);
                            const blob = new Blob([uint8ArrayOfImageData], { type: "image/png" });
                            const imageUrl = URL.createObjectURL(blob);

                            // 更新相机数据中的URL
                            return {
                                url: imageUrl,
                                name: camera.camera.name,
                                save_image_behaviour: camera.save_image_behaviour
                            };
                        }
                        return null;
                    } catch (error) {
                        console.error(`获取相机 ${camera.camera.ip} 最后一帧图片失败:`, error);
                        return null;
                    }
                });

                // 等待所有请求完成
                const results = await Promise.all(promises);

                // 过滤掉null结果并更新相机数据
                const validResults = results.filter(result => result !== null);
                if (validResults.length > 0) {
                    this.cameraIpData = validResults;

                    // 等待DOM更新
                    await this.$nextTick();

                    // 刷新图片
                    this.refreshImages();
                }
            } catch (error) {
                console.error('获取最后一帧图片失败:', error);
            }
        },
        //查询运行时错误消息
        queryRuntimeError() {
            this.errorMessage = '';
            queryRuntimeError().then(res => {
                console.log('res', res);
                if (res) {
                    this.errorDialogVisible = true;
                    // 使用正则表达式提取双引号之间的内容
                    const match = res.match(/"([^"]+)"/);
                    if (match && match[1]) {
                        this.errorMessage = match[1];
                    }
                } else {
                    this.errorDialogVisible = false;
                }
            })
        },
        // 开始计时
        startTimer() {
            this.startTime = new Date();
            this.timer = setInterval(() => {
                const currentTime = new Date();
                const diff = currentTime - this.startTime;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                this.$baseEventBus.$emit('updateRunningDuration', duration);
            }, 1000);
        },
        // 停止计时
        stopTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
                this.startTime = null;
                this.$baseEventBus.$emit('updateRunningDuration', null);
            }
        },
    },
    created() {
    },
    beforeDestroy() {
        this.$baseEventBus.$off("$Bus_start");
        this.$baseEventBus.$off("$Bus_end");
        this.$baseEventBus.$off("$Bus_workflowConfig");
        this.$baseEventBus.$off("$Bus_currentConfigId");
        window.removeEventListener('beforeunload', this.handleBeforeUnload);

        // 清理observer
        if (this.viewer && this.viewer._observer) {
            this.viewer._observer.disconnect();
        }

        // 清理viewer
        if (this.viewer) {
            this.viewer.destroy();
        }

        // 其他清理代码
        if (this.endShow) {
            // this.stopRunning();
        }
        this.stopTimer();
    },
};
</script>
<style lang="scss">
.flex-container {
    display: flex;
    padding: 20px;
    height: 100vh;

    *::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: transparent !important;
    }

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
            position: relative; // 添加相对定位

            .viewer-container {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: #fff !important;
                z-index: 1000 !important;
                border-radius: 16px !important; // 保持与九宫格相同的圆角

                // 添加关闭按钮样式
                .viewer-close-button {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    background-color: rgba(0, 0, 0, 0.5);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    z-index: 1100;

                    &:hover {
                        background-color: rgba(0, 0, 0, 0.7);
                    }

                    i {
                        color: #fff;
                        font-size: 20px;
                    }
                }
            }

            // 调整工具栏位置
            .viewer-toolbar {
                bottom: 10px !important;

                .viewer-zoom-in,
                .viewer-zoom-out,
                .viewer-reset {
                    background-color: rgba(0, 0, 0, 0.5) !important;
                    border-radius: 4px !important;
                }
            }
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
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;
                border-radius: 9px;
                border: 1px solid #dedee0;
                padding-top: 35px;

                a {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    display: block;
                    padding: 5px 10px;
                    color: #000000;
                    font-weight: 900;
                    max-width: 160px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    cursor: pointer;
                    z-index: 999;
                    font-size: 16px;
                    background-color: rgba(239, 239, 239, 0.9);
                    text-align: left;
                    box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.26);
                    box-sizing: border-box;
                    border-radius: 0 0 9px 0;

                    span {
                        display: inline-block;
                        font-size: 16px;
                        color: #36aa0f;
                        margin-right: 2px;
                    }

                    &.with-save {
                        max-width: 220px; // 有"开启存图"时的最大宽度
                    }
                }

                .icon-lbznquanpinganniu {
                    position: absolute;
                    top: 0;
                    right: 0;
                    display: block;
                    z-index: 999;
                }

                .iframeClass {
                    width: 100%;
                    height: calc(100% - 5px);
                    object-fit: scale-down;
                    position: relative;
                    display: block;
                }

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
        width: 420px;
        max-width: 420px;
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

        .partDeatil {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            a {
                font-size: 16px;
                font-weight: 900;
            }
        }

        .el-table {

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
        width: 420px;
        max-width: 420px;
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
                font-size: 20px;
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

        .partDeatil {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            a {
                font-size: 16px;
                font-weight: 900;
            }
        }

        .summary {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            padding: 10px 0px 0px 0px;

            .summary-children {
                border: 1px solid #d6def5; // 添加边框
                border-radius: 10px; // 圆角
                margin-right: 15px;
                margin-bottom: 20px;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center; // 垂直居中
                height: 100%;

                span {
                    font-size: 18px; // 增加字体大小
                    color: #000000; // 字体颜色
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    min-width: 165px;
                    max-width: 155px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;

                    a {
                        color: #727990; // 字体颜色
                        font-weight: bold; // 加粗
                        display: inline-block;

                        &:nth-child(1) {
                            font-size: 38px; // 字体大小
                            max-width: 170px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        &:nth-child(2) {
                            font-size: 18px; // 字体大小
                        }
                    }

                    &:nth-child(1) {
                        padding: 30px 15px 0px 15px; // 内边距
                        margin-bottom: 50px;
                    }

                    &:last-child {
                        background: #d6def5;
                        min-width: auto !important;
                        border-radius: 6px;
                        padding: 2px 10px 2px 10px;
                        margin-bottom: 10px;
                        font-size: 16px !important;
                    }
                }

                .no-message {
                    margin-bottom: 65px !important;
                    padding-top: 40px !important;
                    color: #727990 !important;
                }

                &:nth-child(2) {
                    margin-right: 0px;
                }

                &:last-child {
                    margin-right: 0px;
                }
            }
        }

        .el-table {

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
        position: relative;
        z-index: 4;

        i {
            font-size: 20px;
        }

        .dragClass {
            min-height: calc(100vh - 135px);
            max-height: calc(100vh - 135px);
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

            .dragClass-txt {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 400px;
                color: #727990;
                font-size: 20px;
                font-weight: 900;
                text-shadow: 0px 3px 8px rgba(100, 100, 100, 0.5);
            }
        }

        .edit-component {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            a {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                width: 200px;
                height: 35px;
                border-radius: 10px 10px 10px 10px;
                background-color: rgba(0, 0, 0, 0.16);
                color: rgba(255, 255, 255, 1);
                font-size: 18px;
                text-align: center;
                font-weight: 900;

                &:active {
                    background-color: #b4b4b4;
                }

                &:nth-child(1) {
                    margin-right: 20px;
                }
            }
        }

    }

    .middle-side {
        min-width: 1278px;
        max-width: 1278px;
        line-height: 25px;
        border-radius: 20px 0px 0px 20px;
        background-color: rgba(0, 0, 0, 0.29);
        min-height: calc(100vh - 50px);
        max-height: calc(100vh - 50px);
        position: absolute;
        z-index: 1;
        right: 0px;
        top: 0;
        transition: right 0.3s ease;

        .middle-img {
            min-width: 750px;
            max-width: 750px;
            min-height: calc(100vh - 135px);
            max-height: calc(100vh - 135px);
            overflow-y: auto;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;

            .imgclass {
                padding: 10px;
                padding-right: 25px;
                margin: 20px;
                border-radius: 10px;
                background-color: #e9e9e9;
                box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.26);
                position: relative;

                img {
                    min-width: 285px;
                    max-width: 285px;
                }

                i {
                    position: absolute;
                    right: 10px;
                    top: 10px;
                }
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
            font-size: 15px;
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

.errors-dialog {
    width: 500px !important;
    margin-top: 40vh !important;

    .el-dialog__header {
        padding: 10px !important;
    }

    .error-message {
        color: #ef0a0a !important;
        font-weight: 900 !important;
        font-size: 30px !important;
    }
}
</style>
