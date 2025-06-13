<template>
    <div class="iBrain-steps-vertical">
        <div class="iBrain-steps-vertical-header">
            <div class="title">审批历史</div>
            <div class="tools">
                <el-tooltip effect="dark" :content="`${stepsProcess ? '收起' : '查看'}审批流程`" placement="top">
                    <div class="tools-icons" @click="changeSteps">
                        <i class="icon-ym icon-ym-options"></i>
                    </div>
                </el-tooltip>
                <el-tooltip effect="dark" content="关闭审批历史" placement="top">
                    <div class="tools-icons" @click="onClose">
                        <i class="icon-ym icon-ym-header-expand"></i>
                    </div>
                </el-tooltip>
            </div>
        </div>
        <div class="iBrain-steps-vertical-container">
            <iBrain-process-steps direction="vertical" title="processNode" description="name" :startNode="startNode"
                :startRemark="startRemark" :stepShowData="processHandleNodes"
                :certificateRollBack="certificateRollBack" />
        </div>
    </div>
</template>

<script>
// import iBrainProcessSteps from '@/iBrain-components/iBrain-process-steps'
// import process from '@/mixins/iBrain-process.js'
export default {
    name: 'iBrain-steps-vertical',
    components: {
        // iBrainProcessSteps
    },
    mixins: [
        // process
    ],
    data() {
        return {
            stepsProcess: false,
            historyProcess: true,
            rechecking: false
        }
    },
    props: {
        value: {
            type: Boolean,
            default: true
        },
        showSteps: {
            type: Boolean,
            default: false
        },
        startNode: {
            type: String,
            default: ''
        },
        startRemark: {
            type: String,
            default: ''
        },
        setting: {
            type: Object,
            default: () => { }
        }
    },
    watch: {
        value(val) {
            this.historyProcess = val
        },
        showSteps(val) {
            this.stepsProcess = val
        }
    },
    mounted() {
        this.historyProcess = this.value
        this.stepsProcess = this.showSteps
        this.init(this.setting)
    },
    methods: {
        init(data) {
            this.getProcessInfo(data)
        },
        onClose() {
            this.historyProcess = false
            this.$emit('input', this.historyProcess)
        },
        changeSteps() {
            this.stepsProcess = !this.stepsProcess
            this.$emit('changeSteps', this.stepsProcess)
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/styles/boxflex.scss';

.iBrain-steps-vertical {

    .iBrain-steps-vertical-container {
        padding: 10px 20px;
        background: #fff;
    }

    .iBrain-steps-vertical-header {
        @include dis_flex;

        .title {
            font-weight: 500;
            font-style: normal;
            font-size: 16px;
            line-height: 26px;
            @include boxflex;
        }

        .tools {
            .tools-icons {
                display: inline-block;
                padding: 5px;
                color: #178fd2;
                font-size: 12px;
                cursor: pointer;
            }
        }
    }
}
</style>