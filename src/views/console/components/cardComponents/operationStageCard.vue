<template>
    <div class="box box3">
        <div class="header">
            <a>环节清单检测结果</a>
            <el-select v-if="isEdit" v-model="operationStageparamItem" placeholder="请选择"
                @change="OperationStageparamItemChange">
                <el-option v-for="item in operationStageCardSelectData" :key="item.value" :label="item.camera_name"
                    :value="item">
                </el-option>
            </el-select>
            <a v-else :style="{ color: operationStageparamItem ? '#4c6026' : '#91231a' }">({{ operationStageparamItem ?
                operationStageparamItem
                : '未配置'
                }})</a>
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <div class="stage-content" v-if="operationStageData && Object.keys(operationStageData).length > 0">
            <!-- 过程编号 -->
            <div class="process-number" v-if="resultOperationStage">
                <a v-if="resultOperationStage.index">过程编号：{{ resultOperationStage.index }}</a>
                <a v-if="resultOperationStage && resultOperationStage.result"
                    :style="{ color: resultOperationStage.result == 'Qualified' ? '#b8de72' : '#91231a' }">{{
                        resultOperationStage.result == 'Qualified' ? 'OK' : 'NG'
                    }}</a>
            </div>
            <!-- 环节清单内容区域 -->
            <div class="stage-diagram">
                <!-- 起点 -->
                <div class="stage-node start-node" v-if="operationStageData.start"
                    :style="{ backgroundColor: (resultOperationStage.start) ? (resultOperationStage.start.result == 'Qualified' ? '#b8de72' : '#ff766a') : '#ffffff' }">
                    开始： ({{ operationStageData.start ?
                        operationStageData.start.name : '未设置' }})
                </div>

                <!-- 中间部分 -->
                <div class="middle-section">
                    <!-- 清单组 -->
                    <div class="checklist-group"
                        v-if="operationStageData.unordered && operationStageData.unordered.length > 0">
                        <div class="checklist-items">
                            <div class="checklist-item" v-for="(item, index) in operationStageData.unordered"
                                :key="index"
                                :style="{ backgroundColor: (resultOperationStage.unordered) ? (resultOperationStage.unordered[index].result == 'Qualified' ? '#b8de72' : '#ff766a') : '#ffffff' }">
                                {{ item.name }}
                            </div>
                        </div>
                    </div>

                    <!-- 序列组容器 -->
                    <div class="sequence-container"
                        v-if="operationStageData.ordered && operationStageData.ordered.length > 0">
                        <!-- 序列组 -->
                        <div class="sequence-group" v-for="(item, index) in operationStageData.ordered" :key="index">
                            <div v-if="item.length > 0">
                                <div class="sequence-title">{{ index + 1 }}号序列</div>
                                <div class="sequence-items">
                                    <div v-for="(sequenceItem, sequenceIndex) in item" :key="sequenceIndex">
                                        <div class="sequence-item"
                                            :style="{ backgroundColor: (resultOperationStage.ordered) ? (resultOperationStage.ordered[index][sequenceIndex].result == 'Qualified' ? '#b8de72' : '#ff766a') : '#ffffff' }">
                                            {{ sequenceItem.name }}
                                        </div>
                                        <!-- 箭头 (在非最后一个项后添加) -->
                                        <div v-if="sequenceIndex < item.length - 1" :key="'arrow-' + sequenceIndex"
                                            class="sequence-arrow">
                                            <div class="arrow-box">
                                                <div class="arrow-line"></div>
                                                <div class="arrow-head"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 终点 -->
                <div class="stage-node end-node" v-if="operationStageData.end"
                    :style="{ backgroundColor: (resultOperationStage.end) ? (resultOperationStage.end.result == 'Qualified' ? '#b8de72' : '#ff766a') : '#ffffff' }">
                    结束： ({{ operationStageData.end ?
                        operationStageData.end.name : '未设置' }})
                </div>
            </div>
            <!-- 错误原因 -->
            <div class="error-reason" v-if="resultOperationStage && resultOperationStage.causes.length > 0"
                style="color: #ff766a;">
                <a>不合格原因：{{ resultOperationStage.causes[0]
                    }}</a>
            </div>
        </div>
        <div class="stage-content" v-else>暂无数据</div>
    </div>
</template>
<script>
import { EventSourceUrl } from "@/utils/index";

export default {
    name: 'OperationStageCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        operationStageCardSelectData: {
            type: Array,
            default: () => [],
        },
        selectOperationStageCardSoure: {
            type: Object,
            default: () => { },
        },
        cardId: {
            type: String,
            default: () => '',
        },
        configType: {
            type: String,
            default: () => '',
        },
        isClearCardData: {
            type: Boolean,
            default: () => false,
        },
    },
    watch: {
        isCallEventSource: {
            handler(value) {
                if (value) {
                    this.getRealData(this.selectOperationStageCardSoure);
                } else {
                    if (this.operationStageEventSource) {
                        this.operationStageEventSource.close();
                    }
                }
            },
            deep: true,
            immediate: true
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.operationStageData = {};
                    this.resultOperationStage = {};
                }
            },
            deep: true,
            immediate: true
        },
        selectOperationStageCardSoure: {
            handler(value) {
                this.operationStageparamItem = value.camera_name ? value.camera_name : null;
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            operationStageEventSource: null,
            operationStageparamItem: null,
            operationStageData: {},
            resultOperationStage: {}, // 结果环节清单
        }
    },
    computed: {
    },
    mounted() {
    },
    methods: {
        //环节清单数据
        OperationStageparamItemChange: _.debounce(function (value) {
            console.log("🚀 ~ value:", value)
            this.$emit('operationStageParams', {
                source_id: this.cardId,
                workflow_id: value.workflow_id,
                camera_ip: value.camera_ip,
                camera_name: value.camera_name,
                threshold_type: "OperationStage"
            });
            this.operationStageparamItem = value.camera_name;
        }, 300),
        //实时请求数据
        getRealData(value) {
            console.log("🚀 ~ getRealData ~ value:", value);
            this.operationStageEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_operation_stage_workflow?camera_ip=` + value.camera_ip);
            let that = this;
            this.operationStageEventSource.onmessage = function (event) {
                console.log("🚀 ~ getRealData ~ that.operationStageCardSelectData:", that.operationStageCardSelectData)
                const matchedItem = that.operationStageCardSelectData.find(item =>
                    item.workflow_id === value.workflow_id
                );
                that.operationStageData = matchedItem.classes;
                console.log("🚀 ~ getRealData ~ operationStageData:", that.operationStageData)
                let operationStageResult = JSON.parse(event.data);
                console.log("🚀 ~ operationStageResult:", operationStageResult);
                that.resultOperationStage = operationStageResult;
            };
            this.operationStageEventSource.onerror = function (event) {
                console.error('EventSource 错误:', event);
            };
        },
        handleRemove() {
            this.$emit('remove');
        },
    }
}
</script>
<style lang="scss">
.stage-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    border-radius: 8px;
    background: rgba(249, 249, 249, 0.8);
    padding: 10px;
    min-height: 400px;

    .process-number {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%; // 添加这一行，让容器占满整个宽度

        a {
            display: flex;
            flex-direction: row;
            font-size: 16px;
            color: #424242;
            font-weight: 600;
        }
    }

    .stage-diagram {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;

        .stage-node {
            padding: 8px 16px;
            border-radius: 6px;
            text-align: center;
            min-width: 120px;

            &.start-node {
                border: 1px solid #d3d3d3;
            }

            &.end-node {
                border: 1px solid #d3d3d3;
            }
        }

        .middle-section {
            display: flex;
            gap: 20px;
            width: 100%;
            justify-content: center;
            padding: 20px 0;

            // 新增清单组样式
            .checklist-group {
                padding: 16px;
                border: 1px dashed #ddd;
                border-radius: 8px;
                background: rgba(247, 247, 247, 0.7);

                .checklist-items {
                    display: flex;
                    flex-direction: row;
                    gap: 10px;

                    .checklist-item {
                        padding: 5px;
                        border: 1px solid #d3d3d3;
                        border-radius: 10px;
                        text-align: center;
                        transition: all 0.3s ease;

                        &:hover {
                            transform: scale(1.02);
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                        }
                    }
                }
            }

            // 序列组容器
            .sequence-container {
                padding: 16px;
                border: 1px dashed #ddd;
                border-radius: 8px;
                background: rgba(247, 247, 247, 0.7);

                .sequence-group {
                    .sequence-title {
                        font-weight: bold;
                        margin-bottom: 10px;
                    }

                    .sequence-items {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 5px;

                        .sequence-item {
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            position: relative;
                            z-index: 1;
                        }

                        .sequence-arrow {
                            height: 30px;
                            width: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;

                            .arrow-box {
                                width: 30px;
                                height: 30px;
                                position: relative;
                                display: flex;
                                justify-content: center;
                                align-items: center;

                                .arrow-line {
                                    width: 2px;
                                    height: 30px;
                                    background-color: #333;
                                    position: absolute;
                                    top: 0;
                                }

                                .arrow-head {
                                    width: 10px;
                                    height: 10px;
                                    border: 2px solid #333;
                                    border-left: 0;
                                    border-top: 0;
                                    transform: rotate(45deg);
                                    position: absolute;
                                    bottom: 2px;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>