<template>
    <div class="iBrain-steps-horizontal" v-if="showProcess">
        <div class="iBrain-steps-horizontal-container">
            <div class="iBrain-steps-horizontal-title">
                <div class="title">审批流程</div>
                <div class="tips">审批流程中若出现同一审批人，该人员只会审批一次，不会重复审批。</div>
                <div class="close"><iBrain-link @click="onClose">收起审批流程</iBrain-link></div>
            </div>

            <iBrain-process-steps direction="horizontal" description="name" title="processNode" :startNode="startNode"
                :status="status" :stepShowData="processHandleNodes" :processHandlePerson="processHandlePerson"
                :certificateRollBack="certificateRollBack || {}" @rechecking="(e) => { rechecking = e }" />
        </div>
    </div>
</template>

<script>
// import iBrainProcessSteps from '@/iBrain-components/iBrain-process-steps'
// import addFrom from '@/mixins/addFrom.js'
export default {
    name: 'iBrain-steps-horizontal',
    components: {
        // iBrainProcessSteps
    },
    mixins: [

    ],
    data() {
        return {
            showProcess: false,
            rechecking: false

        };
    },
    props: {
        value: {
            type: Boolean,
            default: true
        },
        startNode: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            default: 'N'
        },
        setting: {
            type: Object,
            default: () => { }
        }
    },
    watch: {
        value(val) {
            this.showProcess = val
        }
    },
    mounted() {
        this.showProcess = this.value
        this.init(this.setting)
    },
    methods: {
        init(data) {
            data.SUBMIT_ORG_ID && (data.orgId = data.SUBMIT_ORG_ID)
            this.getProcessInfo(data)
        },
        onClose() {
            this.showProcess = false
            this.$emit('input', this.showProcess)
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/styles/boxflex.scss';

.iBrain-steps-horizontal {
    padding: 10px 10px 0;

    .iBrain-steps-horizontal-container {
        padding: 10px 20px;
        background: #fff;
    }

    .iBrain-steps-horizontal-title {
        width: 100%;
        line-height: 24px;
        padding-bottom: 10px;
        @include dis_flex;

        .title {
            width: 200px;
        }

        .tips {
            text-align: center;
            @include boxflex;
        }

        .close {
            width: 200px;
            text-align: right;
        }
    }
}
</style>