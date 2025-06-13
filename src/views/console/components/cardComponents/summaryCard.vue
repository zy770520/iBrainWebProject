<template>
    <div class="box box3">
        <div class="header">
            <a>汇总数据</a>
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <div class="summary">
            <div class="summary-children">
                <span v-if="summaryData.total_number !== null">
                    <el-tooltip v-if="isNumberTooLong(summaryData.total_number)" :content="summaryData.total_number"
                        placement="top">
                        <a>{{ summaryData.total_number }}</a>
                    </el-tooltip>
                    <a v-else>{{ summaryData.total_number }}</a>
                    <a>pc</a>
                </span>
                <span v-else class="no-message">暂无数据</span>
                <span>
                    检测总数
                </span>
            </div>
            <div class="summary-children">
                <span v-if="summaryData.total_qualified_rate !== null">
                    <el-tooltip v-if="isNumberTooLong(summaryData.total_qualified_rate)"
                        :content="summaryData.total_qualified_rate" placement="top">
                        <a>{{ summaryData.total_qualified_rate }}</a>
                    </el-tooltip>
                    <a v-else>{{ summaryData.total_qualified_rate }}</a>
                    <a>%</a>
                </span>
                <span v-else class="no-message">暂无数据</span>
                <span>
                    总合格率
                </span>
            </div>
            <div class="summary-children">
                <span v-if="summaryData.average_speed !== null">
                    <el-tooltip v-if="isNumberTooLong(summaryData.average_speed)" :content="summaryData.average_speed"
                        placement="top">
                        <a>{{ summaryData.average_speed }}</a>
                    </el-tooltip>
                    <a v-else>{{ summaryData.average_speed }}</a>
                    <a>pc/min</a>
                </span>
                <span v-else class="no-message">暂无数据</span>
                <span>
                    平均速度
                </span>
            </div>
            <div class="summary-children">
                <span v-if="summaryData.instant_speed !== null">
                    <el-tooltip v-if="isNumberTooLong(summaryData.instant_speed)" :content="summaryData.instant_speed"
                        placement="top">
                        <a>{{ summaryData.instant_speed }}</a>
                    </el-tooltip>
                    <a v-else>{{ summaryData.instant_speed }}</a>
                    <a>pc/min</a>
                </span>
                <span v-else class="no-message">暂无数据</span>
                <span>
                    瞬时速度
                </span>
            </div>
        </div>
    </div>
</template>
<script>
import { EventSourceUrl } from "@/utils/index";

export default {
    name: 'SummaryCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
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
                    this.getSummaryData();
                } else {
                    if (this.summaryEventSource) {
                        this.summaryEventSource.close();
                    }
                }
            },
            deep: true,
            immediate: true
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.summaryData = {
                        total_number: null,
                        total_qualified_rate: null,
                        average_speed: null,
                        instant_speed: null
                    };
                }
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            summaryEventSource: null,
            summaryData: {
                total_number: null,
                total_qualified_rate: null,
                average_speed: null,
                instant_speed: null
            },
        }
    },
    mounted() {
    },
    methods: {
        //汇总数据
        getSummaryData() {
            if (this.isCallEventSource) {
                this.summaryEventSource = new EventSource(`${EventSourceUrl}/execution/statistics`);
                let that = this;
                this.summaryEventSource.onmessage = function (event) {
                    let messageResult = JSON.parse(event.data);
                    that.summaryData.total_number = messageResult.total_number;
                    that.summaryData.total_qualified_rate = messageResult.total_qualified_rate;
                    that.summaryData.average_speed = messageResult.average_speed;
                    that.summaryData.instant_speed = messageResult.instant_speed;
                };
                this.summaryEventSource.onerror = function (event) {
                    // if (that.summaryEventSource) {
                    //     that.summaryEventSource.close();
                    // }
                    console.error('EventSource 错误:', event);
                };
            }
        },
        // 判断数字是否超长
        isNumberTooLong(num) {
            if (num === null || num === undefined) return false;
            return num.toString().length > 6; // 超过8位数字显示tooltip
        },
        handleRemove() {
            this.$emit('remove');
        }
    }
}
</script>
<style lang="scss">
/* 确保tooltip正常显示 */
.summary-children .el-tooltip {
    display: inline-block;
    cursor: pointer;
}
</style>