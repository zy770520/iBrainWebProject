<template>
    <div class="box box2">
        <div class="header">
            <a>厚度检测结果</a>
            <el-select v-if="isEdit" v-model="thickparamItem" placeholder="请选择" @change="ThickparamItemChange">
                <el-option v-for="item in thickCardSelectData" :key="item.value" :label="item.camera_name"
                    :value="item">
                </el-option>
            </el-select>
            <a v-else :style="{ color: thickparamItem ? '#4c6026' : '#91231a' }">({{ thickparamItem ? thickparamItem
                : '未配置'
            }})</a>
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <div class="partDeatil" v-if="partNumber">
            <a>零件编号：{{ partNumber }}</a>
            <a
                :style="{ color: sizeResult === 'Qualified' ? 'green' : sizeResult === 'Unqualified' ? 'red' : 'orange' }">
                {{ sizeResult == 'Qualified' ? 'OK' : sizeResult == 'Unqualified' ? 'NG' : 'uncertain' }}
            </a>
            <a>不合格率：{{ qualifiedRate ? (100 - qualifiedRate).toFixed(2) : '0.00' }}%</a>
        </div>
        <div style="border: 1px solid #e7e7e7">
            <el-table :data="thickTableData">
                <el-table-column v-for="column in thickTableColumns" :key="column" :prop="column" :label="column">
                    <template v-if="column === '厚度检测项'" v-slot="{ row }">
                        <span :style="{ color: row['检测结果'] === 'Unqualified' ? '#ea3323' : '#000000' }">
                            {{ row['厚度检测项'] }}
                        </span>
                    </template>
                    <template v-else-if="column === '检测数据'" v-slot="{ row }">
                        <span :style="{ color: row['检测结果'] === 'Unqualified' ? '#ea3323' : '#000000' }">
                            {{ row['检测数据'] }}
                        </span>
                    </template>
                    <template v-else-if="column === '阈值'" v-slot="{ row }">
                        <span :style="{ color: row['检测结果'] === 'Unqualified' ? '#ea3323' : '#000000' }">
                            {{ row['阈值'] }}
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
    name: 'ThickCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        thickCardSelectData: {
            type: Array,
            default: () => [],
        },
        selectThickCardSoure: {
            type: Object,
            default: () => { },
        },
        cardId: {
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
                    this.getRealData(this.selectThickCardSoure);
                } else {
                    if (this.thickEventSource) {
                        this.thickEventSource.close();
                        // this.thickTableData = null;
                        // this.partNumber = null;
                        // this.sizeResult = null;
                        // this.qualifiedRate = null;
                    }
                }
            },
            deep: true,
            immediate: true  // 添加此行，使 watcher 在组件创建时立即执行
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.thickTableData = null;
                    this.partNumber = null;
                    this.sizeResult = null;
                    this.qualifiedRate = null;
                }
            },
            deep: true,
            immediate: true
        },
        selectThickCardSoure: {
            handler(value) {
                this.thickparamItem = value.camera_name ? value.camera_name : null;
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            thickEventSource: null,
            thickparamItem: null,
            thickTableColumns: ["厚度检测项", "检测数据", "阈值"],
            thickTableData: null,
            partNumber: null,
            sizeResult: null,
            qualifiedRate: null,
        }
    },
    mounted() {
    },
    methods: {
        //厚度数据
        ThickparamItemChange: _.debounce(function (value) {
            this.$emit('thickParams', {
                source_id: this.cardId,
                workflow_id: value.workflow_id,
                camera_ip: value.camera_ip,
                camera_name: value.camera_name,
                threshold_type: "Thick"
            });
            this.thickparamItem = value.camera_name;
        }, 300),
        //实时请求数据
        getRealData(value) {
            let thresholdType = 'Thick';
            this.thickEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_workflow?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&_threshold_type=` + thresholdType);
            let that = this;
            this.thickEventSource.onmessage = function (event) {
                let thickResult = JSON.parse(event.data);
                that.partNumber = thickResult.index;
                that.sizeResult = thickResult.result;
                that.qualifiedRate = thickResult.qualified_rate;
                let arr = thickResult.items.map((item, index) => ({
                    "name": item.name,
                    "value": Math.round(item.value * 1000) / 1000,//检测数据保留三位小数
                    "result": item.result,//检测结果
                    "external": item.external//阈值
                }));
                that.thickTableData = arr.map((item, index) => ({
                    "厚度检测项": item.name,
                    "检测数据": item.value,
                    "检测结果": item.result,
                    "阈值": item.external
                }));
            };
            this.thickEventSource.onerror = function (event) {
                // if (that.thickEventSource) {
                //     that.thickEventSource.close();
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