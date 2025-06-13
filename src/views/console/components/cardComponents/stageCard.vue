<template>
    <div class="box box2">
        <div class="header">
            <a>环节检测结果</a>
            <el-select v-if="isEdit" v-model="stageparamItem" placeholder="请选择" @change="StageparamItemChange">
                <el-option v-for="item in stageCardSelectData" :key="item.value" :label="item.camera_name"
                    :value="item">
                </el-option>
            </el-select>
            <a v-else :style="{ color: stageparamItem ? '#4c6026' : '#91231a' }">({{ stageparamItem ? stageparamItem
                : '未配置'
                }})</a>
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <div class="stageCardClass" style="border: 1px solid #e7e7e7">
            <div class="stageItem" v-for="(item, index) in stageTableData" :key="index">
                <span>
                    <a>{{ item.number }}</a>
                    <div class="progress">
                        <el-progress type="circle" class="custom-progress" :width="item.width" stroke-linecap="square"
                            :color="item.color" :format="() => setItemText(item.name)" :percentage="item.percentage">
                        </el-progress>
                    </div>
                    <a>
                        <i v-if="item.status == 'Qualified'" class="el-icon-check" style="color: #3e951a;"></i>
                        <i v-else-if="item.status == null" class="el-icon-s-data" style="color: #f6cd47;"></i>
                        <i v-else class="el-icon-close" style="color: #e20505;"></i>
                    </a>
                </span>
                <div class="dashold">
                    <div v-if="index !== stageTableData.length - 1" class="linetClass"></div>
                    <div v-else></div>
                    <i v-if="index !== stageTableData.length - 1" class="el-icon-caret-bottom jiantou"></i>
                    <i v-else></i>
                </div>
            </div>
        </div>
        <el-dialog :visible.sync="errorDialogVisible" width="400px" :show-close="true" :close-on-click-modal="false"
            :close-on-press-escape="false" custom-class="error-dialog" :append-to-body="true">
            <div class="error-content">
                <i class="iconfont icon-lbznwarning-full"></i>
                <span class="error-message">当前操作逻辑有误！</span>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { EventSourceUrl } from "@/utils/index";
export default {
    name: 'StageCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        stageCardSelectData: {
            type: Array,
            default: () => [],
        },
        selectStageCardSoure: {
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
                    this.getRealData(this.selectStageCardSoure);
                } else {
                    if (this.stageEventSource) {
                        this.stageEventSource.close();
                    }
                }
            },
            deep: true,
            immediate: true  // 添加此行，使 watcher 在组件创建时立即执行
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.stageTableData = null;
                }
            },
            deep: true,
            immediate: true
        },
        selectStageCardSoure: {
            handler(value) {
                this.stageparamItem = value.camera_name ? value.camera_name : null;
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            stageEventSource: null,
            stageparamItem: null,
            stageTableData: null,
            errorDialogVisible: false,
        }
    },
    mounted() {
    },
    methods: {
        //环节数据
        StageparamItemChange: _.debounce(function (value) {
            this.$emit('stageParams', {
                source_id: this.cardId,
                workflow_id: value.workflow_id,
                camera_ip: value.camera_ip,
                camera_name: value.camera_name,
                threshold_type: "Stage"
            });
            this.stageparamItem = value.camera_name;
        }, 300),
        //实时请求数据
        getRealData(value) {
            console.log("🚀 ~ getRealData ~ value:", value)
            let thresholdType = 'Stage';
            this.stageEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_speed_or_stage_workflow?workflow_id=` + value.workflow_id + `&camera_ip=` + value.camera_ip + `&threshold_type=` + thresholdType);
            let that = this;
            this.stageEventSource.onmessage = function (event) {
                let stageResult = JSON.parse(event.data);
                // let stageResult = [{
                //     "class": "C1",
                //     "name": "安装底板",
                //     "result": "NotDetected",
                //     "speed": null
                // },
                // {
                //     "class": "C2",
                //     "name": "放置说明书",
                //     "result": "NotDetected",
                //     "speed": null
                // },
                // {
                //     "class": "C3",
                //     "name": "放置吸口",
                //     "result": "NotDetected",
                //     "speed": null
                // },
                // {
                //     "class": "C4",
                //     "name": "放置小零件",
                //     "result": "NotDetected",
                //     "speed": null
                // },
                // {
                //     "class": "C5",
                //     "name": "防止圆口吸口",
                //     "result": "NotDetected",
                //     "speed": null
                // },
                // {
                //     "class": "C6",
                //     "name": "放置直吸口",
                //     "result": "NotDetected",
                //     "speed": null
                // },
                // {
                //     "class": "C7",
                //     "name": "放置管子",
                //     "result": "NotDetected",
                //     "speed": null
                // }]
                console.log("🚀 ~ getRealData ~ that.stageCardSelectData:", that.stageCardSelectData)
                const matchedItem = that.stageCardSelectData.find(item =>
                    item.workflow_id === value.workflow_id
                );
                console.log("🚀 ~ getRealData ~ matchedItem:", matchedItem)
                let classData = matchedItem.classes.classes;
                console.log("🚀 ~ getRealData ~ classData:", classData)
                let result = [];
                classData.forEach(item => {
                    let found = stageResult.find(element => element.class === item.class);
                    if (found) {
                        result.push({
                            "result": found.result,
                            "class": item.class,
                            "name": item.name,
                        });
                    }
                });
                console.log('result', result);
                let arr3 = result.map((item, index) => ({
                    "number": index + 1,
                    "name": item.name,
                    "percentage": 100,
                    "status": item.result,
                    "color": item.result == 'Qualified' ? "#3e951a" : item.result == null ? "#f6cd47" : '#e20505'
                }));
                arr3.forEach((item, index) => {
                    if (index > 0) {
                        console.log("🚀 ~ arr3.forEach ~ item:", item.status)
                        console.log("🚀 ~ arr3.forEach ~ arr3[index - 1]:", arr3[index - 1].status)
                    }
                    //排除第一个
                    if (item && index > 0 && item.status === 'Qualified' && arr3[index - 1].status === 'Unqualified') {
                        that.errorDialogVisible = true;
                        if (that.stageEventSource) {
                            that.stageEventSource.close();
                        }
                    }
                });
                // 打印结果
                that.stageTableData = arr3;
            };
            this.stageEventSource.onerror = function (event) {
                // if (that.stageEventSource) {
                //     that.stageEventSource.close();
                // }
                console.error('EventSource 错误:', event);
                // let errorMsg = `数据卡片 “${value.camera_name}” 没有找到数据源“${value.camera_ip}”，请删除该卡片并重新添加！`;
                // that.$message.warning(errorMsg);
            };
        },
        handleRemove() {
            this.$emit('remove');
        },
        //格式化进度条
        setItemText(name) {
            return `${name}`;
        },
    }
}
</script>
<style lang="scss">
.stageCardClass {
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
                        font-size: 12px !important;
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

.error-dialog {
    border-radius: 20px;

    .error-content {
        display: flex;
        align-items: center;
        padding-left: 20px;

        i {
            font-size: 36px;
            margin-right: 10px;
        }

        .error-message {
            color: #a53118;
            font-size: 20px;
        }
    }
}
</style>