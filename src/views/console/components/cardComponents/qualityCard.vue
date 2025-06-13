<template>
    <div class="box box3">
        <div class="header">
            <a>外观检测结果</a>
            <el-select v-if="isEdit" v-model="qualityparamItem" placeholder="请选择" @change="QualityparamItemChange">
                <el-option v-for="item in qualityCardSelectData" :key="item.value" :label="item.camera_name"
                    :value="item">
                </el-option>
            </el-select>
            <a v-else :style="{ color: qualityparamItem ? '#4c6026' : '#91231a' }">({{ qualityparamItem ?
                qualityparamItem
                : '未配置'
            }})</a>
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
            <el-table v-if="configType == 'Quality'" :data="qualityTableData">
                <el-table-column v-for="column in qualityTableColumns" :key="column" :prop="column" :label="column">
                    <template v-if="column === '检测结果'" v-slot="{ row }">
                        <span :style="{ color: row['检测结果'] === 'NG' ? '#ea3323' : '#000000' }">
                            {{ row['检测结果'] }}
                        </span>
                    </template>
                    <template v-else-if="column === '单次检测数'" v-slot="{ row }">
                        <span :style="{ color: row['检测结果'] === 'NG' ? '#ea3323' : '#000000' }">
                            {{ row['单次检测数'] }}
                        </span>
                    </template>
                    <template v-else v-slot="{ row }">
                        <span :style="{ color: row['检测结果'] === 'NG' ? '#ea3323' : '#000000' }">
                            {{ row[column] }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
            <el-table v-else :data="qualityTableData">
                <el-table-column v-for="column in qualityTableColumns" :key="column" :prop="column" :label="column">
                    <template v-if="column === '检测结果'" v-slot="{ row }">
                        <span :style="{ color: row['外观检测项'] === '无漏点' ? '#59b62d' : '#ae2619' }">
                            {{ row['外观检测项'] === '无漏点' ? 'OK' : 'NG' }}
                        </span>
                    </template>
                    <template v-else-if="column === '单次检测数'" v-slot="{ row }">
                        <span :style="{ color: row['外观检测项'] === '无漏点' ? '#59b62d' : '#ae2619' }">
                            {{ row['单次检测数'] }}
                        </span>
                    </template>
                    <template v-else v-slot="{ row }">
                        <span :style="{ color: row['外观检测项'] === '无漏点' ? '#59b62d' : '#ae2619' }">
                            {{ row[column] }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
import { EventSourceUrl } from "@/utils/index";
import { queryRuntimeErrorCard } from "@/api/console";
export default {
    name: 'QualityCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        qualityCardSelectData: {
            type: Array,
            default: () => [],
        },
        selectQuailtyCardSoure: {
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
                    this.getRealData(this.selectQuailtyCardSoure);
                } else {
                    if (this.qualityEventSource) {
                        this.qualityEventSource.close();

                    }
                }
            },
            deep: true,
            immediate: true  // 添加此行，使 watcher 在组件创建时立即执行
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.qualityTableData = null;
                    this.partNumber = null;
                    this.sizeResult = null;
                    this.qualifiedRate = null;
                }
            },
            deep: true,
            immediate: true
        },
        selectQuailtyCardSoure: {
            handler(value) {
                this.qualityparamItem = value.camera_name ? value.camera_name : null;
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            qualityEventSource: null,
            qualityparamItem: null,
            qualityTableColumns: ["外观检测项", "检测结果", "单次检测数"],
            qualityTableData: null,
            partNumber: null,
            sizeResult: null,
            qualifiedRate: null,
        }
    },
    mounted() {
    },
    methods: {
        //外观数据
        QualityparamItemChange: _.debounce(function (value) {
            this.$emit('quailtyParams', {
                source_id: this.cardId,
                workflow_id: value.workflow_id,
                camera_ip: value.camera_ip,
                camera_name: value.camera_name,
                threshold_type: "Quality"
            });
            this.qualityparamItem = value.camera_name;
        }, 300),
        //实时请求数据
        getRealData(value) {
            console.log(222222);
            let thresholdType = 'Surface';
            this.qualityEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_workflow?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&_threshold_type=` + thresholdType);
            let that = this;
            this.qualityEventSource.onmessage = function (event) {
                let qualityResult = JSON.parse(event.data);
                that.partNumber = qualityResult.index;
                that.sizeResult = qualityResult.result;
                that.qualifiedRate = qualityResult.qualified_rate;
                let arr = qualityResult.items.map((item, index) => ({
                    "name": item.name,
                    "result": item.result,//检测结果
                    "external": item.external//单次检测数
                }));
                that.qualityTableData = arr.map((item, index) => ({
                    "外观检测项": item.name,
                    "检测结果": item.result == 'Qualified' ? 'OK' : item.result == 'Unqualified' ? 'NG' : 'uncertain',
                    "单次检测数": item.external,
                }));
            };
            this.qualityEventSource.onerror = function (event) {
                // if (that.qualityEventSource) {
                //     that.qualityEventSource.close();
                // }

                console.error('EventSource 错误:', event);
                //如果event中的currentTarget中的url包含http
                if (event.currentTarget.url.includes('http')) {
                    queryRuntimeErrorCard({
                        workflow_id: value.workflow_id,
                        camera_ip: value.camera_ip,
                        _threshold_type: thresholdType
                    }).then(res => {
                        // console.log('res', res);
                    });
                }
            };
        },
        handleRemove() {
            this.$emit('remove');
        }
    }
}
</script>
<style lang="scss"></style>