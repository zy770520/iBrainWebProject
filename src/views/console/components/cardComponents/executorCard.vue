<template>
    <div class="box box3">
        <div class="header">
            <a>执行统计</a>
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <div style="border: 1px solid #e7e7e7">
            <el-table :data="excuorTableData">
                <el-table-column v-for="column in excuorTableColumns" :key="column" :prop="column" :label="column">
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
import { EventSourceUrl } from "@/utils/index";

export default {
    name: 'ExecutorCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
        configId: {
            type: Number,
            default: () => 0,
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
                    this.getExcuorTableData();
                } else {
                    if (this.excuorEventSource) {
                        this.excuorEventSource.close();
                    }
                }
            },
            deep: true,
            immediate: true
        },
        isClearCardData: {
            handler(value) {
                if (value) {
                    this.excuorTableData = null;
                }
            },
            deep: true,
            immediate: true
        }
    },
    data() {
        return {
            excuorEventSource: null,
            excuorTableColumns: ["执行单元", "累计执行次数"],
            excuorTableData: null,
        }
    },
    methods: {
        //执行数据
        getExcuorTableData() {
            if (this.isCallEventSource) {
                this.excuorEventSource = new EventSource(`${EventSourceUrl}/execution/statistics_executor?config_id=` + this.configId);
                let that = this;
                this.excuorEventSource.onmessage = function (event) {
                    let messageResult = JSON.parse(event.data);
                    let arr = messageResult.map((item, index) => ({
                        "name": item.name + '(' + item.ident + ')',
                        "value": item.value,
                    }));
                    that.excuorTableData = arr.map((item, index) => ({
                        "执行单元": item.name,
                        "累计执行次数": item.value,
                    }));
                };
                this.excuorEventSource.onerror = function (event) {
                    if (that.excuorEventSource) {
                        that.excuorEventSource.close();
                    }
                    console.error('EventSource 错误:', event);
                };
            }
        },
        handleRemove() {
            this.$emit('remove');
        }
    }
}
</script>
<style lang="scss"></style>