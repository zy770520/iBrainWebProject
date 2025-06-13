<template>
    <div class="box box2">
        <div class="header">
            <a>速度检测结果</a>
            <el-select v-if="isEdit" v-model="speedparamItem" placeholder="请选择" @change="speedParamItemChange">
                <el-option v-for="item in speedCardSelectData" :key="item.value" :label="item.camera_name"
                    :value="item">
                </el-option>
            </el-select>
            <a v-else :style="{ color: speedparamItem ? '#4c6026' : '#91231a' }">({{ speedparamItem ? speedparamItem
                : '未配置'
            }})</a>
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <!-- <div class="partDeatil" v-if="partNumber">
            <a>零件编号：{{ partNumber }}</a>
            <a
                :style="{ color: sizeResult === 'Qualified' ? 'green' : sizeResult === 'Unqualified' ? 'red' : 'orange' }">
                {{ sizeResult == 'Qualified' ? 'OK' : sizeResult == 'Unqualified' ? 'NG' : 'uncertain' }}
            </a>
            <a>合格率：{{ qualifiedRate }}%</a>
        </div> -->
        <div style="border: 1px solid #e7e7e7">
            <el-table :data="speedTableData">
                <el-table-column v-for="column in speedTableColumns" :key="column" :prop="column" :label="column">
                    <template v-if="column === '速度检测项'" v-slot="{ row }">
                        <span :style="{ color: row['检测结果'] === 'Unqualified' ? '#ea3323' : '#000000' }">
                            {{ row['速度检测项'] }}
                        </span>
                    </template>
                    <template v-else-if="column === '检测数据'" v-slot="{ row }">
                        <span :style="{ color: row['检测结果'] === 'Unqualified' ? '#ea3323' : '#000000' }">
                            {{ row['检测数据'] }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
import { EventSourceUrl } from "@/utils/index";
export default {
    name: 'SpeedCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        speedCardSelectData: {
            type: Array,
            default: () => [],
        },
        selectSpeedCardSoure: {
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
                    this.getRealData(this.selectSpeedCardSoure);
                } else {
                    if (this.speedEventSource) {
                        this.speedEventSource.close();
                    }
                }
            },
            deep: true,
            immediate: true  // 添加此行，使 watcher 在组件创建时立即执行
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.speedTableData = null;
                    this.partNumber = null;
                    this.sizeResult = null;
                    this.qualifiedRate = null;
                }
            },
            deep: true,
            immediate: true
        },
        selectSpeedCardSoure: {
            handler(value) {
                this.speedparamItem = value.camera_name ? value.camera_name : null;
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            speedEventSource: null,
            speedparamItem: null,
            speedTableColumns: ["速度检测项", "检测数据"],
            speedTableData: null,
            partNumber: null,
            sizeResult: null,
            qualifiedRate: null,
        }
    },
    mounted() {
    },
    methods: {
        //速度数据
        speedParamItemChange: _.debounce(function (value) {
            this.$emit('speedParams', {
                source_id: this.cardId,
                workflow_id: value.workflow_id,
                camera_ip: value.camera_ip,
                camera_name: value.camera_name,
                threshold_type: "Speed"
            });
            this.speedparamItem = value.camera_name;
        }, 300),
        //实时请求数据
        getRealData(value) {
            let thresholdType = 'Speed';
            this.speedEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_speed_or_stage_workflow?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&threshold_type=` + thresholdType);
            let that = this;
            this.speedEventSource.onmessage = function (event) {
                let speedResult = JSON.parse(event.data);
                // that.partNumber = speedResult.index;
                // that.sizeResult = speedResult.result;
                // that.qualifiedRate = speedResult.qualified_rate;
                let arr = speedResult.map((item, index) => ({
                    "name": item.name,
                    "speed": Math.round(item.speed * 1000) / 1000,//检测数据保留三位小数
                    "result": item.result,//检测结果
                }));
                that.speedTableData = arr.map((item, index) => ({
                    "速度检测项": item.name,
                    "检测数据": item.speed,
                    "检测结果": item.result,
                }));
            };
            this.speedEventSource.onerror = function (event) {
                // console.error('EventSource 错误:', event);
            };
        },
        handleRemove() {
            this.$emit('remove');
        }
    }
}
</script>
<style lang="scss"></style>