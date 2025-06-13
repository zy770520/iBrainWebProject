<template>
    <el-dialog ref="textDialog" :title="title" :visible.sync="showPopup" width="60%" @close="onClose"
        :close-on-click-modal="false" :close-on-press-escape="false" append-to-body>
        <el-input v-if="showInput" type="textarea" :rows="4" :placeholder="placeholder"
            :autosize="{ minRows: 2, maxRows: 10 }" :disabled="disabled" :readonly="readonly" v-model="textValue">
        </el-input>
        <span slot="footer" class="dialog-footer">
            <iBrain-button type="primary" @click="onConfirm">确 定</iBrain-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: 'iBrain-textarea-popup',
    data() {
        return {
            textValue: '',
            showPopup: false,
            showInput: false
        };
    },
    props: {
        value: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'false'
        },
        content: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        content(val) {
            this.textValue = val
        },
        value(val) {
            val && (this.textValue = this.content)
            this.showPopup = val
            this.resetInputShow()
        },
        showPopup(val) {
            this.$emit('input', val)
        },
        title(val) {
            this.title = val
        },
    },
    mounted() {

    },
    methods: {
        onClose() {
            this.showPopup = false
        },
        onConfirm() {
            if (this.textValue.length > 1300) {
                this.$message.warning(`${this.title}不能超过1300个字符，请确认！`)
            } else {
                this.showPopup = false
                this.$emit('confirm', this.textValue)
                this.$emit('update:content', this.textValue)
            }
        },
        resetInputShow() {
            this.showInput = false
            this.$nextTick(() => this.showInput = this.showPopup)
        }
    },
};
</script>

<style lang="scss" scoped>
::v-deep .el-input.is-disabled .el-input__inner,
::v-deep .el-textarea.is-disabled .el-textarea__inner {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #666;
    cursor: default
}
</style>
