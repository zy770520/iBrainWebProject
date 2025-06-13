<template>
    <iBrain-module title="附件信息" v-show="visible">
        <iBrain-upLoad-table @changeFile="changeFile" @fileShow="fileShow" ref="uploadTable" v-bind="$attrs"
            :baseURL="baseURL" :disabled="disabled" :params="params">
        </iBrain-upLoad-table>
    </iBrain-module>
</template>

<script>
const baseURL = ''

export default {
    name: 'iBrain-page-files',
    components: {
    },
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        params: {
            //参数
            type: Object,
            default: () => { },
        },
    },
    data() {
        return {
            DOC_COUNT: '',
            baseURL: baseURL,
            fileLength: '',
            visible: false
        }
    },
    computed: {
        A_flag() {
            return this.$route.query['flag'] || ''
        },
        noUploadFile() {
            return this.A_flag ? (this.DOC_COUNT > 0 ? true : false) : true
        }
    },
    watch: {
    },
    methods: {
        changeFile(len, list) {
            this.DOC_COUNT = len.toString();
            this.$emit('changeSetting', {
                DOC_COUNT: this.DOC_COUNT
            })
        },
        async init() {
            let vm = this
            this.visible = this.noUploadFile
            await this.$nextTick(() => {
                vm.visible && vm.$refs['uploadTable'].init()
            })
        },
        saveFiles() {
            this.$refs['uploadTable'].saveFilesHandle()
        },
        fileShow(flag) {
            this.visible = flag;
        }
    },
    mounted() {
        this.init()
    }
}
</script>

<style lang="scss" scoped></style>
