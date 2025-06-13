<template>
    <el-dropdown class="iBrain-dept-select" v-bind="$attrs" :trigger="trigger" @command="onCommand">
        <a class="iBrain-dept-select-title">
            {{ title }} <i class="el-icon-arrow-down"></i>
        </a>
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item in list" :key="item.DEPT_ID" :command="item">{{ item.DEPT_NAME }}</el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
</template>

<script>
export default {
    name: 'iBrain-dept-select',
    data() {
        return {
        }
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        list: {
            type: Array,
            default: () => []
        },
        trigger: {
            type: String,
            default: 'click'
        }
    },
    methods: {
        onCommand(item) {
            this.$emit('change', item)
        }
    }
}
</script>

<style scoped lang="scss">
    .iBrain-dept-select{
        color: inherit;
        font-size: inherit;
    }
    .iBrain-dept-select-title{
        color: inherit;
        font-size: inherit;
    }
</style>