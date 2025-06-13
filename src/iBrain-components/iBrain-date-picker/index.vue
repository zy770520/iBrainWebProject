<template>
    <el-date-picker
        v-model="date"
        type="daterange"
        value-format="yyyy-MM-dd"
        range-separator="~"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        v-bind="$attrs"
        v-on="$listeners">
    </el-date-picker>
</template>

<script>
export default {
    name: 'iBrain-date-packer',
    data() {
        return {
            date: []
        }
    },
    props: {
        value: {
            type: Array,
            default: () => []
        }
    },
    watch: {
        value(val) {
            this.date = val
            this.$emit("changeValue", this.date)
        },
        date(val) {
            this.$emit('input', val)
        }
    },
    mounted() {
        this.date = this.value
    }
}
</script>

<style lang="scss" scoped>

</style>
