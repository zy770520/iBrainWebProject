<template>
    <div class="box box3">
        <div class="header">
            <a>外观汇总结果</a>
            <el-select v-if="isEdit" v-model="qualityTotalParamItem" placeholder="请选择"
                @change="QualityTotalParamItemChange">
                <el-option v-for="item in qualityTotalCardSelectData" :key="item.value" :label="item.camera_name"
                    :value="item">
                </el-option>
            </el-select>
            <a v-else :style="{ color: qualityTotalParamItem ? '#4c6026' : '#91231a' }">({{ qualityTotalParamItem ?
                qualityTotalParamItem
                : '未配置'
                }})</a>
            <a>{{ partNumber ? 'NO.' + partNumber : '' }}</a>
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <div class="partDeatil" v-if="partNumber && configType == 'Quality'">
            <a>零件编号：{{ partNumber }}</a>
            <a
                :style="{ color: sizeResult === 'Qualified' ? 'green' : sizeResult === 'Unqualified' ? 'red' : 'orange' }">
                {{ sizeResult == 'Qualified' ? 'OK' : sizeResult == 'Unqualified' ? 'NG' : 'uncertain' }}
            </a>
            <a>不合格率：{{ qualifiedRate ? (100 - qualifiedRate).toFixed(2) : '0.00' }}%</a>
        </div>
        <div style="border: 1px solid #e7e7e7">
            <el-table v-if="partNumber && partNumber % 8 === 0" :data="qualityTotalTableData">
                <el-table-column v-for="column in qualityTotalTableColumns" :key="column" :prop="column"
                    :label="column">
                    <template v-if="column === '检测结果'" v-slot="{ row }">
                        <span :style="{ color: row['外观检测项'] === '无漏点' ? '#59b62d' : '#ae2619' }">
                            {{ row['外观检测项'] === '无漏点' ? 'OK' : 'NG' }}
                        </span>
                    </template>
                    <template v-else-if="column === '一轮检测数'" v-slot="{ row }">
                        <span :style="{ color: row['外观检测项'] === '无漏点' ? '#59b62d' : '#ae2619' }">
                            {{ row['一轮检测数'] }}
                        </span>
                    </template>
                    <template v-else v-slot="{ row }">
                        <span :style="{ color: row['外观检测项'] === '无漏点' ? '#59b62d' : '#ae2619' }">
                            {{ row[column] }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
            <div v-else class="waiting-data">
                <!-- 如果运行未开始，则显示暂无数据 -->
                <span v-if="!isCallEventSource">暂无数据</span>
                <span v-else>数据汇总中...</span>
            </div>
        </div>
    </div>
</template>
<script>
import { EventSourceUrl } from "@/utils/index";
export default {
    name: 'QualityTotalCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        qualityTotalCardSelectData: {
            type: Array,
            default: () => [],
        },
        selectQualityTotalCardSoure: {
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
                    this.getRealData(this.selectQualityTotalCardSoure);
                } else {
                    if (this.qualityTotalEventSource) {
                        this.qualityTotalEventSource.close();
                    }
                }
            },
            deep: true,
            immediate: true  // 添加此行，使 watcher 在组件创建时立即执行
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.qualityTotalTableData = null;
                    this.partNumber = null;
                    this.sizeResult = null;
                    this.qualifiedRate = null;
                }
            },
            deep: true,
            immediate: true
        },
        selectQualityTotalCardSoure: {
            handler(value) {
                this.qualityTotalParamItem = value.camera_name ? value.camera_name : null;
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            qualityTotalEventSource: null,
            qualityTotalParamItem: null,
            qualityTotalTableColumns: ["外观检测项", "检测结果", "一轮检测数"],
            qualityTotalTableData: null,
            partNumber: null,
            sizeResult: null,
            qualifiedRate: null,
        }
    },
    mounted() {
    },
    methods: {
        //外观数据
        QualityTotalParamItemChange: _.debounce(function (value) {
            this.$emit('qualityTotalParams', {
                source_id: this.cardId,
                workflow_id: value.workflow_id,
                camera_ip: value.camera_ip,
                camera_name: value.camera_name,
                threshold_type: "Quality"
            });
            this.qualityTotalParamItem = value.camera_name;
        }, 300),
        //实时请求数据
        getRealData(value) {
            console.log(222222);
            let thresholdType = 'Surface';
            this.qualityTotalEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_workflow?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&_threshold_type=` + thresholdType);
            let that = this;

            // 用于存储累积的数据和每5条的最大external值
            let accumulatedData = [];
            let maxExternalByName = {};

            this.qualityTotalEventSource.onmessage = function (event) {
                let qualityResult = JSON.parse(event.data);
                that.partNumber = (qualityResult.index - 1) % 8 + 1;
                // that.sizeResult = qualityResult.result;
                // that.qualifiedRate = qualityResult.qualified_rate;

                // 累积数据
                accumulatedData.push(qualityResult);

                // 当index为5的倍数时更新一轮检测数
                if (qualityResult.index % 8 === 0 || accumulatedData.length === 8) {
                    // 收集最近5条记录
                    const lastFiveRecords = accumulatedData.slice(-8);

                    // 计算每个name对应的external最大值
                    lastFiveRecords.forEach(record => {
                        record.items.forEach(item => {
                            const name = item.name;
                            const external = item.external;

                            if (!maxExternalByName[name] || external > maxExternalByName[name]) {
                                maxExternalByName[name] = external;
                            }
                        });
                    });

                    // 清空累积数据，为下一轮做准备
                    accumulatedData = [];
                }

                // 准备表格数据
                let arr = qualityResult.items.map((item, index) => ({
                    "name": item.name,
                    "result": item.result,//检测结果
                    "external": maxExternalByName[item.name] || item.external //使用计算好的一轮检测数，如果没有则使用当前值
                }));

                // 更新表格数据
                that.qualityTotalTableData = arr.map((item, index) => ({
                    "外观检测项": item.name,
                    "检测结果": item.result == 'Qualified' ? 'OK' : item.result == 'Unqualified' ? 'NG' : 'uncertain',
                    "一轮检测数": item.external,
                }));

                console.log("更新一轮检测数:", maxExternalByName);
            };

            this.qualityTotalEventSource.onerror = function (event) {
                // console.error('Error:', event);
                // if (that.qualityTotalEventSource) {
                //     that.qualityTotalEventSource.close();
                // }
                console.error('EventSource 错误:', event);
                // let errorMsg = `数据卡片 “${value.camera_name}” 没有找到数据源“${value.camera_ip}”，请删除该卡片并重新添加！`;
                // that.$message.warning(errorMsg);
            };
        },
        handleRemove() {
            this.$emit('remove');
        }
    }
}
</script>
<style lang="scss">
.waiting-data {
    color: #6f6f6f;
    font-size: 18px;
    min-height: calc(100vh - 700px);
    max-height: calc(100vh - 700px);
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>