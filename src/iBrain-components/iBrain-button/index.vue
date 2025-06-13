<template>
    <el-button v-bind="$attrs" @click.prevent="onClick" :disabled="disabled" :loading="loading" :class="[
        onlyIcon ? 'onlyIcon' : ''
    ]">
        <slot></slot>
    </el-button>
</template>

<script>
export default {
    name: 'iBrain-button',
    props: {
        onlyIcon: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        toIndex: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        onClick(event) {
            if (this.disabled || this.loading) return

            if (
                this.toIndex &&
                this.$route.query.row
            ) {
                // 组件重构 此逻辑由原组件复制 暂不清楚具体功能
                if (this.$route.query.accessToken) {
                    this.$bus.$emit('backDoor', false)
                } else {
                    let view = this.$route
                    this.$store.dispatch('tabsBar/delRoute', view)
                    this.$router.push('/index')
                }
            } else {
                this.$emit('click', event)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.el-button {
    display: inline-block;
    text-align: center;
    font-family: PingFangSC;
    color: #2c3e50;
    border-color: #d8dfe5;
    background: #fff;

    &+ ::v-deep span {
        .iBrain-botton {
            margin-left: 10px;
        }
    }

    &.el-button--small {
        height: 32px;
        padding: 5px 18px;
        font-size: 14px;
        border-radius: 5px;
        line-height: 20px;
    }

    &.onlyIcon {
        padding: 5px;
        min-width: 40px;

        ::v-deep img {
            vertical-align: middle;
            margin-top: -3px;
        }
    }

    &.el-button--default {
        color: rgb(48, 86, 211) !important;
        background: #EDF3FE;
        border-radius: 4px;
        border-color: #EDF3FE;

        &:hover {
            border-color: rgb(48, 86, 211);
            border-radius: 5px;
        }
    }

    &.el-button--primary {
        // background: rgb(48, 86, 211);
        // border-color: rgb(48, 86, 211);
        background: linear-gradient(172deg, #28A4FE 0%, #3056D3 100%);
        color: #fff;

        &:hover {
            background: linear-gradient(172deg, #4aabf1 0%, #4566d1 100%);
        }
    }

    &.el-button--success {
        background: #33a647;
        border-color: #33a647;
        color: #fff;
    }

    &.el-button--danger {
        background: #cc0000;
        border-color: #cc0000;
        color: #fff;

        &:hover {
            background: #ef3b3b;
            border-color: #ef3b3b;
        }
    }

    &.el-button--info {
        font-weight: bold;
        padding: 4px 10px;
        margin: 0px 10px;
        font-size: 13px;
        border-radius: 4px;
        background: #ffeed5;
        color: #ea6b11;
        border: none;
    }

    &.el-button--warning {

        font-weight: bold;
        padding: 4px 10px;
        margin: 0px 10px;
        font-size: 13px;
        border-radius: 4px;
        background: #fce3e3;
        color: #f90f0f;
        border: none;
    }

    &.is-disabled,
    &.is-disabled:hover,
    &.is-disabled:focus,
    &.is-disabled:active {
        background: #ebf1f5;
        border-color: #dcdfe6; //#ebf1f5;
        color: #2c3e50;
        opacity: 0.5;
    }
}
</style>
