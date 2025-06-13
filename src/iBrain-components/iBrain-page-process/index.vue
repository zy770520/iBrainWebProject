<template>
    <div>
        1
        <!-- <processInformation
            :processHandleNodes="processHandleNodes"
            :processHandlePerson="processHandlePerson"
            :startRemark="''"
            :startNode="PERSON_NAME"
            :status="STATUS"
            :certificateRollBack="certificateRollBack" /> -->
    </div>
</template>

<script>
// import processInformation from "@/views/iBrain-process-form/process-information-steps"
// import addFrom from '@/mixins/addFrom.js'
export default {
    name: 'process-common',
    components: {
        // processInformation
    },
    mixins:[],
    data() {
        return {
            // visible: false,
            processHandleNodes: [],
            processHandlePerson:[]
        }
    },
    props: {
        params: {
            type: Object,
            default: () => {}
        },
        PERSON_NAME: {
            type: String,
            default: ''
        },
        STATUS: {
            type: String,
            default: ''
        },
        WF_INSTID: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        ORG_ID: {
            type: [String, Number],
            default: '',
        },
        DEPT_ID: {
            type: [String, Number],
            default: '',
        },
        TYPE_ID: {
            type: String,
            default: '',
        },
        HEADER_ID: {
            type: [String, Number],
            default: '',
        },
    },
    watch: {
        STATUS (val) {
            this.init()
        },
        WF_INSTID (val) {
            this.init()
        }
    },
    methods: {
        init() {
            // if (!this.disabled) return
            this.$nextTick(() => {
                this.getProcessInfo({
                    ORG_ID: this.ORG_ID,
                    DEPT_ID: this.DEPT_ID,
                    TYPE_ID: this.TYPE_ID,
                    HEADER_ID: this.HEADER_ID,
                    // PERSON_NAME: this.PERSON_NAME,
                    STATUS: this.STATUS,
                    WF_INSTID: this.WF_INSTID,
                })
                this.visible = true
            })
        }
    },
    mounted() {
        this.init()
    }
}
</script>

<style lang="scss" scoped>
</style>
