<template>
    <div class="iBrain-input-number">
        <div class="el-input el-input--small el-input-block"
             :class="[
                 disabled ? 'is-disabled' : '',
                 align
             ]"
             v-if="disabled || (isFake && !isFocus)" @click="clickFocus">
            <div class="el-input__inner">{{ innerValue }}</div>
        </div>
        <el-input v-else ref="numberInput" v-model="innerValue" @focus="onFocus" @blur="onBlur" @change="onChange"
            v-bind="$attrs" :class="[
                align
            ]" />
    </div>
</template>

<script>
export default {
    name: 'iBrain-input-number',
    data() {
        return {
            innerValue: '',
            innerValueOld: '',
            isFocus: false
        }
    },
    props: {
        type: {
            type: String,
            default: 'money' // money number
        },
        isFake: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        value: {
            type: [String, Number],
            default: ''
        },
        places: {
            type: [String, Number],
            default: 2
        },
        align: {
            type: String,
            default: ''
        },
        min: {
            type: [Number, String],
            default: ''
        }
    },
    computed: {
    },
    watch: {
        value() {
            this.innerValue = this.getFormatValue()
            // 外部值变动不会触发change事件  特殊场景自定义changValue事件
            this.$emit('changValue', this.innerValue)
        },
        innerValue(newVal, oldVal) {
            this.intFormatNumber(newVal)
        },
        places(value) {
            if (value) {
                this.places = value
                this.innerValue = this.getFormatValue()
            }
        }
    },
    methods: {
        formatMoney(number, places, symbol, thousand, decimal) {
            /**
             * number   {String|Number} 金额
             * places   {String} 小数位数
             * symbol   {String} 符号  如 $1000 默认空
             * thousand {String} 千位符号 默认 ','
             * decimal  {String} 小数点符号 默认 '.'
             */
            if (!number && number !== '0') return ''
            if (number === '--') return number
            number = (number + '').replace(/(%|,)/g, "")
            places = !isNaN(places = Math.abs(places)) ? places : 2;
            symbol = symbol !== undefined ? symbol : "";
            thousand = thousand || ",";
            decimal = decimal || ".";
            let negative = number < 0 ? "-" : "",
                i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
                j = i.length > 3 ? i.length % 3 : 0;
            return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
        },
        clickFocus() {
            if (this.disabled) return
            this.isFocus = true
            this.$nextTick(() => this.$refs['numberInput'].focus())
        },
        onFocus(event) {
            this.innerValueOld = this.innerValue
            this.innerValue = this.getRealValue()
            this.$emit('focus', event)
        },
        onBlur(event) {
            this.innerValue = this.getFormatValue()
            this.$emit('blur', event)
            this.isFocus = false
        },
        onChange(event) {
            this.$emit('input', this.getRealValue())
            this.$emit('change', event, this.innerValueOld)
        },
        getRealValue() {
            let value = this.innerValue.replace(/,/g, '')
            return !value && value !== '0' ? '' : value * 1
        },
        getFormatValue(val) {
            let value = val || this.value
            if (!isNaN(value) && this.min !== '' && value < this.min) {
                value = this.min + ''
            }
            return value.toString() ? this.formatMoney(value.toString(), this.places) : ''
        },
        intFormatNumber(val) {
            let number = val + ''
            if (this.places > 0 || number.indexOf('.') == -1) return
            this.innerValue = this.getFormatValue(val)
        }
    },
    mounted() {
        this.innerValue = this.getFormatValue()
    }
}
</script>

<style lang="scss" scoped>
.el-input {
    &.right {
        ::v-deep .el-input__inner {
            text-align: right;
        }
    }
}
</style>
