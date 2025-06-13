<template>
    <section class="iBrain-section-info">
        <div class="iBrain-section-info-main">
            <div class="iBrain-section-info-head" v-if="headList.length">
                <span v-for="(item, index) in headList" :key="index" v-show="item.name" :style="item.style">
                    <template v-if="item.list && !disabled">
                        {{ item.name }}:<iBrain-dept-select :list="item.list" :title="item.value"
                            @change="$emit('changeDept', $event)" />
                    </template>
                    <template v-else>
                        {{ item.name }}:
                        <template v-if="item.isMoney">{{ (item.value) }}</template>
                        <template v-else>{{ item.value }}</template>
                    </template>
                </span>
            </div>
            <slot v-if="!tabList.length"></slot>
            <el-tabs v-model="activeName" :class="{ hideNavTabs: tabList.length == 1 }" v-else>
                <el-tab-pane v-for="item in tabList" :key="item.name" :name="item.name" :label="item.label">
                    <slot :name="item.name"></slot>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="iBrain-section-info-footer" v-if="$slots.footer">
            <span class="text" v-if="$slots.text">
                <slot name="text"></slot>
            </span>
            <span class="text" v-else></span>
            <slot name="footer"></slot>
        </div>
    </section>
</template>

<script>
// import { toMoney } from '@/utils/iBrain-common'
export default {
    name: 'iBrain-section-info',
    data() {
        return {
            // toMoney,
            activeName: '',
        }
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        isEdit: {
            type: Boolean,
            default: false,
        },
        tabList: {
            type: Array,
            default: () => [],
        },
        headList: {
            type: Array,
            default: () => [],
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        value(val) {
            this.activeName = val
        },
        headList: {
            handler(val) {
                // console.log('iBrain-section-info watch headList', val);
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        initTabValue() {
            if (!this.tabList.length) return
            if (this.value) {
                this.activeName = this.value
                return
            }
            this.activeName = this.tabList[0].name
        },
    },
    mounted() {
        this.initTabValue()
    },
}
</script>

<style lang="scss" scoped>
@import '@/styles/boxflex.scss';

.iBrain-section-info {
    background-color: #fff;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    @include dis_flex;
    height: 100%;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;

    &,
    * {
        box-sizing: border-box;
    }

    .iBrain-section-info-main {
        width: 100%;
        overflow: hidden;
        overflow-y: scroll;
        @include boxflex;
    }

    .iBrain-section-info-head {
        background-color: #fff;
        padding: 0 20px;
        height: 48px;
        font-size: 12px;
        line-height: 1.2;
        color: #adb2b9;
        @include dis_flex;
        @include align-items;

        span {
            padding: 0 5px;

            &+span {
                border-left: 1px solid #adb2b9;
            }

            &:first-child {
                padding-left: 0;
            }
        }
    }

    .el-tabs {
        width: 100%;

        &.hideNavTabs {
            ::v-deep .el-tabs__header {
                display: none;
            }
        }

        ::v-deep .el-tabs__header {
            padding: 0 20px;
            margin: 0;
            background-color: #fff;
        }

        ::v-deep .el-tabs__nav {
            margin-left: 10px !important;
        }

        ::v-deep .el-tabs__content {
            padding: 0;
        }
    }

    .iBrain-section-group {
        height: 48px;
        @include dis_flex;
        @include align-items;
    }

    .iBrain-section-info-footer {
        background: #fff;
        padding: 14px 20px;
        @include dis_flex;
        @include justify(flex-end);

        .text {
            color: #33a647;
            @include boxflex;
        }
    }

    ::v-deep .el-table {
        th.el-table__cell.required>div::before {
            display: inline-block;
            content: "*";
            width: 8px;
            height: 8px;
            line-height: 8px;
            border-radius: 0;
            background: transparent;
            color: #E55558;
            margin-right: 4px;
            vertical-align: middle;
        }
    }

    ::v-deep .el-form-item {
        margin: 0;

        .el-input-number {
            width: 100% !important;
            margin: 0 !important;
        }
    }

    ::v-deep .el-date-editor {
        width: 100% !important;
        height: 30px;

        .el-input__inner {
            width: 100%;
        }
    }

    ::v-deep .el-col.el-col-6 {
        height: 70px;
    }
}
</style>
