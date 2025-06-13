<template>
    <el-link :class="size" v-bind="$attrs" v-on="$listeners" :underline="underline">
        <span v-if="isStatus" class="link-dot" :class="dotStyle"></span>
        <template v-if="text">{{ text }}</template>
        <slot v-else></slot>
    </el-link>
</template>

<script>
export default {
    name: 'iBrain-link',
    data() {
        return {
            text: '',
        }
    },
    props: {
        value: {
            type: [String, Number],
            default: 'N/A'
        },
        size: {
            type: String,
            default: 'small'  // 字号大小 默认small 12px  middle 13
        },
        underline: {
            type: Boolean, // 是否显示下划线
            default: false
        },
        isStatus: {
            type: Boolean, // 是否显示为状态样式
            default: false
        },
        statusList: {
            type: Array, // 状态集列表
            default: () => [
                { status: 'N', name: '新建', style: '' },
                { status: 'I', name: '审批中', style: 'primary' },
                { status: 'Y', name: '审批通过', style: 'sucess' },
                { status: 'R', name: '审批拒绝', style: 'danger' },
                { status: 'W', name: '已撤回', style: 'warning' },
                { status: 'B', name: '财务回退', style: 'danger' },
                { status: 'T', name: '已退回', style: 'danger' },
                { status: '', name: '审核作废', style: 'danger' },
            ]
        }
    },
    watch: {
        value() {
            this.init()
        }
    },
    computed: {
        curStatusIndex() {
            let index = this.statusList.findIndex(item => item.status == this.value)
            return Math.max(0, index)
        },
        curStatus() {
            return this.statusList[this.curStatusIndex]
        },
        dotStyle() {
            let style = ''
            switch (this.value) {
                case 'N':
                    style = ''
                    break
                case 'I':
                    style = 'primary'
                    break
                case 'Y':
                    style = 'sucess'
                    break
                case 'W':
                    style = 'warning'
                    break
                default:
                    style = 'danger'
                    break
            }
            return style
        }

    },
    methods: {
        init() {
            if (this.value == 'N/A') return

            if (this.isStatus) {
                this.text = this.curStatus.name
                return
            }
            this.text = this.value
        }
    },
    mounted() {
        this.$nextTick(() => this.init())
    }
}
</script>

<style lang="scss" scoped>
.el-link {
    color: #3056D3;
    font-size: 13px;

    &.small {
        font-size: 12px;
    }

    &:hover {
        color: #3056D3;
    }

    &.el-link--danger {
        color: #ff3a3a;
    }

    &+.el-link {
        margin-left: 10px;
    }

    &.is-disabled {

        &,
        &:focus,
        &:hover {
            color: #c0c4cc;
        }
    }

    .link-dot {
        height: 6px;
        width: 6px;
        border-radius: 6px;
        background: #d8dfe5;
        display: inline-block;
        vertical-align: middle;
        margin-right: 5px;

        &.sucess {
            background: #33a647;
        }

        &.primary {
            background: #0079fe;
        }

        &.danger {
            background: #cc0000;
        }

        &.warning {
            background: #fda413;
        }
    }
}
</style>
