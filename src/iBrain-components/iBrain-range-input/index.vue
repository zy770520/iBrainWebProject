<template>
    <div class="iBrain-range-input" :class="[
        isFocus ? 'focus' : ''
    ]">
        <el-input v-model="startValue" :placeholder="placeholder" :disabled="disabled" :readonly="readonly"
            @focus="onFocus" @blur="onBlur" />
        <div class="iBrain-range-input--interval">~</div>
        <el-input v-model="endValue" :placeholder="placeholder" :disabled="disabled" :readonly="readonly"
            @focus="onFocus" @blur="onBlur" />
        <div class="iBrain-range-input--icon" v-if="clearable">
            <i class="el-icon-circle-close" v-if="inputValue.length > 0" @click="clearValue" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'iBrain-range-input',
    data() {
        return {
            isFocus: false,
            inputValue: [],
            startValue: '',
            endValue: ''
        }
    },
    props: {
        value: {
            type: Array,
            default: () => []
        },
        placeholder: {
            type: String,
            default: '请输入'
        },
        disabled: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        },
        clearable: {
            type: Boolean,
            default: true
        }
    },
    watch: {
        startValue(val) {
            this.changeInputValue()
        },
        endValue(val) {
            this.changeInputValue()
        },
        value() {
            this.init()
        }
    },
    methods: {
        init() {
            if (this.value && this.value instanceof Array) {
                this.inputValue = this.value
            } else {
                this.inputValue = []
            }
            this.startValue = this.inputValue[0] || ''
            this.endValue = this.inputValue[1] || ''
        },
        changeInputValue() {
            this.inputValue = [this.startValue, this.endValue]
            this.$emit('input', this.inputValue)
            this.$emit('change', this.inputValue, this.startValue, this.endValue)
        },
        onFocus() {
            this.isFocus = true
        },
        onBlur() {
            this.isFocus = false
        },
        clearValue() {
            this.startValue = ''
            this.endValue = ''
            this.changeInputValue()
        }
    },
    mounted() {
        this.init()
    }
}
</script>

<style lang="scss" scoped>
@import '@/styles/boxflex.scss';

.iBrain-range-input {
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    line-height: 30px;
    border-radius: 2px;
    border: 1px solid #dcdfe6;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    @include dis_flex;

    &:hover {
        border-color: #c0c4cc;
    }

    &.focus {
        border-color: #2f54eb;
    }

    ::v-deep .el-input {
        height: 100%;
        box-sizing: border-box;
        @include boxflex;

        .el-input__inner {
            border: 0;
            height: 30px;
            line-height: 30px;
            outline: none;
            display: block;
        }
    }

    .iBrain-range-input--interval {
        font-size: 12px;
        width: 16px;
        text-align: center;
    }

    .iBrain-range-input--icon {
        width: 30px;
        text-align: center;

        .el-icon-circle-close {
            color: #c0c4cc;

            &:hover {
                color: #909399;
            }
        }
    }
}
</style>