<template>
    <div class="iBrain-input-imitate">
        <div class="iBrain-input-imitate-inner" :class="{ 'disabled': disabled }" @click.stop="onClick">{{ value }}</div>
    </div>
</template>

<script>
export default {
    name: 'iBrain-input-imitate',
    data() {
        return {
        }
    },
    props: {
        value: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    mounted() {
    },
    methods: {
        onClick(event) {
            this.$emit('click', event)
        }
    }
}
</script>

<style lang="scss" scoped>
.iBrain-input-imitate {
    position: relative;
    font-size: 14px;
    width: 100%;
    font-size: 12px;

    .iBrain-input-imitate-inner {
        background-color: #fff;
        border-radius: 2px;
        border: 1px solid #dcdfe6;
        box-sizing: border-box;
        color: #606266;
        font-size: inherit;
        height: 28px;
        line-height: 28px;
        outline: none;
        padding: 0 15px;
        transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        &.disabled {
            padding: 0;
            border: 0;
            background-color: transparent;
        }
    }
}
</style>
