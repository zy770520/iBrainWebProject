<template>
    <div class="box box3">
        <div class="header">
            <a>扫码检测结果</a>
            <el-select v-if="isEdit" v-model="scanRecognitionparamItem" placeholder="请选择"
                @change="ScanRecognitionparamItemChange">
                <el-option v-for="item in scanRecognitionCardSelectData" :key="item.value" :label="item.camera_name"
                    :value="item">
                </el-option>
            </el-select>
            <a v-else :style="{ color: scanRecognitionparamItem ? '#4c6026' : '#91231a' }">({{ scanRecognitionparamItem
                ?
                scanRecognitionparamItem
                : '未配置'
            }})</a>
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <div v-if="scanRecognitionTableData && scanRecognitionTableData.length > 0" style="border: 1px solid #e7e7e7">
            <el-table :data="scanRecognitionTableData">
                <el-table-column v-for="column in scanRecognitionTableColumns" :key="column" :prop="column"
                    :label="column">
                    <template v-if="column === '扫码检测项'" v-slot="{ row }">
                        <span>{{ row['扫码检测项'] }}</span>
                    </template>
                    <template v-else-if="column === '扫码检测结果'" v-slot="{ row }">
                        <span>
                            {{ row['扫码检测结果'] }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-else class="scan-recognition-content">
            暂无数据
        </div>
    </div>
</template>
<script>
import { EventSourceUrl } from "@/utils/index";

export default {
    name: 'ScanRecognitionCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        scanRecognitionCardSelectData: {
            type: Array,
            default: () => [],
        },
        selectScanRecognitionCardSoure: {
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
                    this.getRealData(this.selectScanRecognitionCardSoure);
                } else {
                    if (this.scanRecognitionEventSource) {
                        this.scanRecognitionEventSource.close();
                    }
                }
            },
            deep: true,
            immediate: true
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.scanRecognitionTableData = null;
                }
            },
            deep: true,
            immediate: true
        },
        selectScanRecognitionCardSoure: {
            handler(value) {
                this.scanRecognitionparamItem = value.camera_name ? value.camera_name : null;
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            scanRecognitionEventSource: null,
            scanRecognitionparamItem: null,
            scanRecognitionTableColumns: ["扫码检测项", "扫码检测结果"],
            scanRecognitionTableData: null,
        }
    },
    computed: {
    },
    mounted() {
    },
    methods: {
        //环节清单数据
        ScanRecognitionparamItemChange: _.debounce(function (value) {
            console.log("🚀 ~ value:", value)
            this.$emit('scanRecognitionParams', {
                source_id: this.cardId,
                workflow_id: value.workflow_id,
                camera_ip: value.camera_ip,
                camera_name: value.camera_name,
                threshold_type: "ScanRecognition"
            });
            this.scanRecognitionparamItem = value.camera_name;
        }, 300),
        //实时请求数据
        getRealData(value) {
            console.log("🚀 ~ getRealData ~ value:", value);
            this.scanRecognitionEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_scan_recognition_workflow?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip);
            let that = this;
            this.scanRecognitionEventSource.onmessage = function (event) {
                // console.log("🚀 ~ scanRecognitionResult:", JSON.parse(event.data));
                let scanRecognitionResult = JSON.parse(event.data);
                // let scanRecognitionResult = [
                //     {
                //         "name": "类别一",
                //         "class": "C1",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别三",
                //         "class": "C3",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别二",
                //         "class": "C2",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别五",
                //         "class": "C5",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别四",
                //         "class": "C4",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别六",
                //         "class": "C6",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别一",
                //         "class": "C1",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别三",
                //         "class": "C3",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别二",
                //         "class": "C2",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别四",
                //         "class": "C4",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别六",
                //         "class": "C6",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别五",
                //         "class": "C5",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别六",
                //         "class": "C6",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别二",
                //         "class": "C2",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别一",
                //         "class": "C1",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别三",
                //         "class": "C3",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别四",
                //         "class": "C4",
                //         "result": "13434347458475847"
                //     },
                //     {
                //         "name": "类别五",
                //         "class": "C5",
                //         "result": "13434347458475847"
                //     },
                // ];
                let arr = scanRecognitionResult.map((item, index) => ({
                    "name": item.name,
                    "class": item.class,
                    "result": item.result,
                })).sort((a, b) => {
                    // 排序逻辑 从class属性中提取数字（例如从'C1'中提取'1'）
                    const numA = parseInt(a.class.replace('C', ''));
                    const numB = parseInt(b.class.replace('C', ''));
                    // 按数字大小排序
                    return numA - numB;
                });
                that.scanRecognitionTableData = arr.map((item, index) => ({
                    "扫码检测项": `${item.name}(${item.class})`,
                    "扫码检测结果": item.result,
                }));
            };
            this.scanRecognitionEventSource.onerror = function (event) {
                // console.error('EventSource 错误:', event);
            };
        },
        handleRemove() {
            this.$emit('remove');
        },
    }
}
</script>
<style lang="scss" scoped>
.scan-recognition-content {
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f9f9f9;
    border-radius: 10px;
    padding: 10px;
    box-sizing: border-box;
}
</style>