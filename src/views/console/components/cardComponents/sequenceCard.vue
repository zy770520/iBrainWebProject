<template>
    <div class="box box3">
        <div class="header">
            <a>线序检测结果</a>
            <el-select v-if="isEdit" v-model="sequenceparamItem" placeholder="请选择" @change="SequenceparamItemChange">
                <el-option v-for="item in sequenceCardSelectData" :key="item.value" :label="item.camera_name"
                    :value="item">
                </el-option>
            </el-select>
            <a v-else :style="{ color: sequenceparamItem ? '#4c6026' : '#91231a' }">({{ sequenceparamItem ?
                sequenceparamItem
                : '未配置'
                }})</a>
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <div class="sequence-content" v-if="resultSequence.length > 0">
            <div class="sequence-result" :style="{ color: isSequenceOK ? '#3ac233' : '#eb2c14' }">{{ isSequenceOK ? 'OK'
                : 'NG' }}</div>
            <div class="sequence-grid">
                <div class="sequence-item-class">
                    <div class="sequence-item-title">结果</div>
                    <div class="sequence-item-content">
                        <div v-for="(item, index) in standardSequence" :key="index" class="sequence-item"
                            :style="getColorStyle(item.name)">
                            {{ item.name }}
                        </div>
                        <el-tooltip v-if="hasExtraTargets" :content="extraTargetsTooltip" placement="bottom"
                            effect="dark">
                            <div class="extra-targets-warning">
                                存在多余目标
                            </div>
                        </el-tooltip>
                    </div>
                </div>
                <div class="sequence-reslut-item">
                    <div v-for="(item, index) in standardSequence" :key="index">
                        <i v-if="isOK(index)" class="iconfont icon-lbznduigou"></i>
                        <i v-else class="iconfont icon-lbznchahao-"></i>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="sequence-content-data">
            <div class="sequence-no-data">
                暂无数据
            </div>
        </div>
    </div>
</template>
<script>
import { EventSourceUrl } from "@/utils/index";

export default {
    name: 'SequenceCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        sequenceCardSelectData: {
            type: Array,
            default: () => [],
        },
        selectSequenceCardSoure: {
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
                    this.getRealData(this.selectSequenceCardSoure);
                } else {
                    if (this.sequenceEventSource) {
                        this.sequenceEventSource.close();
                    }
                }
            },
            deep: true,
            immediate: true
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.resultSequence = [];
                    this.standardSequence = [];
                }
            },
            deep: true,
            immediate: true
        },
        selectSequenceCardSoure: {
            handler(value) {
                this.sequenceparamItem = value.camera_name ? value.camera_name : null;
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            sequenceEventSource: null,
            sequenceparamItem: null,
            standardSequence: [], // 标准序列
            resultSequence: [], // 结果序列
        }
    },
    computed: {
        isSequenceOK() {
            // 如果结果序列中的index与标准列中的索引能一一对应，则判断为OK
            return this.standardSequence.length == this.resultSequence.length && this.standardSequence.every((item, index) => this.resultSequence.find(result => result.index === index));
        },
        limitedResultSequence() {
            if (!this.standardSequence.length) return [];
            return this.resultSequence.slice(0, this.standardSequence.length);
        },
        extraTargetsTooltip() {
            return `多余目标：${this.resultSequence.map(item => item.name).join('、')}`;
        },
        hasExtraTargets() {
            // 如果结果序列中有一个index不在标准序列中，则返回true
            return this.resultSequence.some(result => {
                // 获取标准序列中所有的index值
                const standardIndices = this.standardSequence.map((_, index) => index);
                // 检查当前结果的index是否不在标准序列的index范围内
                return !standardIndices.includes(result.index);
            });
        },
    },
    mounted() {
    },
    methods: {
        isOK(index) {
            // 如果标准序列中的某一个的index能够在结果序列中找到，则判断为OK
            return this.resultSequence.some(result => result.index === index);
        },

        //线序数据
        SequenceparamItemChange: _.debounce(function (value) {
            console.log("🚀 ~ value:", value)
            this.$emit('sequenceParams', {
                source_id: this.cardId,
                workflow_id: value.workflow_id,
                camera_ip: value.camera_ip,
                camera_name: value.camera_name,
                threshold_type: "Relative"
            });
            this.sequenceparamItem = value.camera_name;
        }, 300),
        //实时请求数据
        getRealData(value) {
            console.log("🚀 ~ getRealData ~ value:", value);
            console.log("🚀 ~ getRealData ~ sequenceCardSelectData:", this.sequenceCardSelectData);
            let thresholdType = 'Relative';
            this.sequenceEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_speed_or_stage_workflow?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&threshold_type=` + thresholdType);
            let that = this;
            this.sequenceEventSource.onmessage = function (event) {
                let sequenceResult = JSON.parse(event.data);
                // let sequenceResult = [
                //     {
                //         name: '粉',
                //         class: 'C1',
                //         result: 'Unqualified'
                //     },
                //     {
                //         name: '黄',
                //         class: 'C2',
                //         result: 'Qualified'
                //     },
                //     {
                //         name: '黄',
                //         class: 'C2',
                //         result: 'Unqualified'
                //     },
                //     {
                //         name: '粉',
                //         class: 'C1',
                //         result: 'Unqualified'
                //     } 
                // ];
                const matchedItem = that.sequenceCardSelectData.find(item =>
                    item.workflow_id === value.workflow_id
                );
                let arr = [];
                // 遍历 arr 数组
                matchedItem.classes.classes.forEach(item => {
                    // 在 matchedItem 中查找匹配的 class 值
                    const found = matchedItem.classes.feature_sets.find(element => element.class === item);
                    if (found) {
                        // 如果找到，添加到 arr 中
                        arr.push(found);
                    }
                });
                that.standardSequence = arr;
                that.resultSequence = sequenceResult;
            };
            this.sequenceEventSource.onerror = function (event) {
                // console.error('Error:', event);
                // if (that.sequenceEventSource) {
                //     that.sequenceEventSource.close();
                // }
                console.error('EventSource 错误:', event);
                // let errorMsg = `数据卡片 “${value.camera_name}” 没有找到数据源“${value.camera_ip}”，请删除该卡片并重新添加！`;
                // that.$message.warning(errorMsg);
            };
        },
        handleRemove() {
            this.$emit('remove');
        },
        getColorStyle(name) {
            let style = {};
            if (name) {
                if (name.includes('红')) {
                    style.backgroundColor = '#f85c5c';
                    style.color = '#ffffff';
                } else if (name.includes('黄')) {
                    style.backgroundColor = '#f8e05c';
                    style.color = '#000000';
                } else if (name.includes('绿')) {
                    style.backgroundColor = '#3ac233';
                    style.color = '#ffffff';
                } else if (name.includes('白')) {
                    style.backgroundColor = '#ffffff';
                    style.color = '#000000';
                } else if (name.includes('黑')) {
                    style.backgroundColor = '#000000';
                    style.color = '#ffffff';
                } else if (name.includes('粉')) {
                    style.backgroundColor = '#ffc0cb';
                    style.color = '#ffffff';
                } else if (name.includes('蓝')) {
                    style.backgroundColor = '#4282C9';
                    style.color = '#ffffff';
                } else if (name.includes('棕')) {
                    style.backgroundColor = '#8B4513';
                    style.color = '#ffffff';
                }
                return style;
            }
        },
    }
}
</script>
<style lang="scss">
.sequence-content {
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
    padding: 10px;
    border-radius: 10px;
    // height: 360px;

    .sequence-result {
        font-size: 16px;
        font-weight: bold;
        margin-left: auto;
    }

    .sequence-grid {
        display: flex;
        flex-direction: row;
        padding: 0px 20px 0px 20px;

        .sequence-line {
            border: 1px dashed #cdcdcd;
            margin-left: 30px;
            margin-right: 30px;
        }

        .sequence-item-class {
            display: flex;
            flex-direction: column;

            .sequence-item-title {
                font-size: 16px;
                font-weight: bold;
                color: #000000;
                margin-bottom: 10px;
            }

            .sequence-item-content {
                display: flex;
                flex-direction: column;
                min-height: 530px;
                max-height: 530px;
                overflow-y: auto;

                .sequence-item {
                    width: 300px;
                    margin-bottom: 10px;
                    padding: 10px;
                    border-radius: 5px;
                    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.4);
                    font-size: 16px;
                    font-weight: bold;
                }

                .extra-targets-warning {
                    color: #f56c6c;
                    font-size: 14px;
                    padding: 8px;
                    margin-top: 10px;
                    cursor: pointer;
                    border: 1px dashed #f56c6c;
                    border-radius: 4px;
                    text-align: center;
                }
            }
        }

        .sequence-reslut-item {
            display: flex;
            flex-direction: column;
            margin-top: 30px;
            margin-left: 20px;

            div {
                height: 44px;
                line-height: 44px;
                margin-bottom: 8px;

                &:last-child {
                    margin-bottom: 0px;
                }
            }
        }
    }
}

.sequence-content-data {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    min-height: 700px;
    /* 确保有足够的高度显示 */
    background: #f5f5f5;
    padding: 10px;
    border-radius: 10px;

    .sequence-no-data {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        font-weight: bold;
        color: #9b9b9b;
    }
}

.error-dialog {
    border-radius: 20px;

    .el-dialog__header {
        padding: 0px !important;
    }

    .error-content {
        display: flex;
        align-items: center;

        i {
            font-size: 36px;
            margin-right: 10px;
        }

        .error-message {
            color: #a53118;
            font-size: 14px;
        }
    }
}
</style>