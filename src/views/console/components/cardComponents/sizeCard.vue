<template>
    <div class="box box2">
        <div class="header">
            <a>尺寸检测结果</a>
            <el-select v-if="isEdit" v-model="sizeparamItem" placeholder="请选择" @change="SizeparamItemChange">
                <el-option v-for="item in sizeCardSelectData" :key="item.value" :label="item.camera_name" :value="item">
                </el-option>
            </el-select>
            <a v-else :style="{ color: sizeparamItem ? '#4c6026' : '#91231a' }">({{ sizeparamItem ? sizeparamItem :
                '未配置'
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
            <el-table :data="sizeTableData">
                <el-table-column v-for="column in sizeTableColumns" :key="column" :prop="column" :label="column">
                    <template v-if="column === '尺寸检测项'" v-slot="{ row }">
                        <span :style="{ color: row['检测结果'] === 'Unqualified' ? '#ea3323' : '#000000' }">
                            {{ row['尺寸检测项'] }}
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
    name: 'SizeCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        sizeCardSelectData: {
            type: Array,
            default: () => [],
        },
        selectSizeCardSoure: {
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
                    this.getRealData(this.selectSizeCardSoure);
                } else {
                    if (this.sizeEventSource) {
                        this.sizeEventSource.close();
                    }
                }
            },
            deep: true,
            immediate: true  // 添加此行，使 watcher 在组件创建时立即执行
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.sizeTableData = null;
                    this.partNumber = null;
                    this.sizeResult = null;
                    this.qualifiedRate = null;
                }
            },
            deep: true,
            immediate: true
        },
        selectSizeCardSoure: {
            handler(value) {
                this.sizeparamItem = value.camera_name ? value.camera_name : null;
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            sizeEventSource: null,
            sizeparamItem: null,
            sizeTableColumns: ["尺寸检测项", "检测数据", "阈值"],
            sizeTableData: null,
            partNumber: null,
            sizeResult: null,
            qualifiedRate: null,
        }
    },
    mounted() {
    },
    methods: {
        //尺寸数据
        SizeparamItemChange: _.debounce(function (value) {
            this.$emit('sizeParams', {
                source_id: this.cardId,
                workflow_id: value.workflow_id,
                camera_ip: value.camera_ip,
                camera_name: value.camera_name,
                threshold_type: "Size"
            });
            this.sizeparamItem = value.camera_name;
        }, 300),
        //实时请求数据
        getRealData(value) {
            let thresholdType = 'Size';
            this.sizeEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_workflow?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&_threshold_type=` + thresholdType);
            let that = this;
            this.sizeEventSource.onmessage = function (event) {
                let sizeResult = JSON.parse(event.data);
                that.partNumber = sizeResult.index;
                that.sizeResult = sizeResult.result;
                that.qualifiedRate = sizeResult.qualified_rate;
                let arr = sizeResult.items.map((item, index) => ({
                    "name": item.name,//尺寸检测项
                    "value": Math.round(item.value * 1000) / 1000,//检测数据保留三位小数
                    "result": item.result,//检测结果
                    "external": item.external//阈值
                }));
                that.sizeTableData = arr.map((item, index) => ({
                    "尺寸检测项": item.name,
                    "检测数据": item.value,
                    "检测结果": item.result,
                    "阈值": item.external
                }));
            };
            this.sizeEventSource.onerror = function (event) {
                // if (that.sizeEventSource) {
                //     that.sizeEventSource.close();
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