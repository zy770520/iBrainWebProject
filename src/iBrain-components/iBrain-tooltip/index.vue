<template>
    <div class="iBrain-tooltip">
        <el-tooltip :disabled="disabled" :content="value" placement="top">
            <span>
                <slot></slot>
            </span>
        </el-tooltip>
    </div>
</template>

<script>
export default {
    name: 'iBrain-tooltip',
    data() {
        return {
            max: 0
        }
    },
    props: {
        value: {
            type: String,
            default: ''
        },
        size: {
            type: Number,
            default: 13
        }
    },
    computed: {
        len() {
            return this.value ? this.getValueLen(this.value) / 2 : 0
        },
        disabled() {
            return this.max > 0 && this.len <= this.max
        }
    },
    methods: {
        getValueLen(str) {
            // 计算占位 中文 2 英文 1
            if (str == null) return 0;
            if (typeof str != "string"){
                str += "";
            }
            return str.replace(/[^\x00-\xff]/g,"01").length;
        },
        init() {
            let clientWidth = this.$el.clientWidth
            let input = this.$el.querySelector('.el-input__inner')
            if (input) {
                var style = window.getComputedStyle(input)
                var paddingLeft = style.getPropertyValue("padding-left")
                var paddingRight = style.getPropertyValue("padding-right")
                let pl = paddingLeft.replace('px','') * 1
                let pr = paddingRight.replace('px','') * 1

                clientWidth = parseInt(input.clientWidth - pl - pr)
            }
            this.max = parseInt(clientWidth / this.size)
        }
    },
    mounted() {
        this.$nextTick(() => this.init())
    }
}
</script>

<style lang="scss" scoped>
    .iBrain-tooltip{
        position: relative;
    }
</style>
