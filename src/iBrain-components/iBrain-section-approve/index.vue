<template>
    <section class="iBrain-section-approve">
        <div class="iBrain-section-approve-head" v-if="headList.length">
            <span v-for="(item, index) in headList" :key="index" v-show="item.name" :style="item.style">
                {{ item.name }}：
                <template v-if="item.isMoney">{{ (item.value) }}</template>
                <template v-else>{{ item.value }}</template>
            </span>
        </div>
        <iBrain-steps-horizontal v-model="showSteps" :setting="setting" :startNode="startNode"
            :status="status"></iBrain-steps-horizontal>

        <el-container class="iBrain-section-approve-container">
            <el-main class="iBrain-section-approve-main">
                <div class="scroll">
                    <el-tooltip effect="dark" content="展开审批历史" placement="top" v-if="!showVertical">
                        <div class="history-icons" @click="showVertical = true">
                            <i class="icon-ym icon-ym-header-collapse1"></i>
                        </div>
                    </el-tooltip>
                    <slot></slot>
                </div>
            </el-main>

            <el-aside class="iBrain-section-approve-aside" width="25%" v-if="showVertical" :style="{
                paddingBottom: params.approvaled ? '40px' : '142px'
            }">
                <div class="scroll">
                    <iBrain-steps-vertical v-model="showVertical" :showSteps="showSteps" :setting="setting"
                        :startNode="startNode" :status="status" @changeSteps="changeSteps"></iBrain-steps-vertical>
                </div>
            </el-aside>
        </el-container>
    </section>
</template>

<script>
// import { toMoney } from '@/utils/iBrain-common';
export default {
    name: 'iBrain-section-approve',
    components: {
    },
    data() {
        return {
            // toMoney,
            showSteps: false,
            showVertical: true
        }
    },
    props: {
        value: {
            type: String,
            default: ''
        },
        headList: {
            type: Array,
            default: () => []
        },
        params: {
            type: Object,
            default: () => { }
        },
        setting: {
            type: Object,
            default: () => { }
        },
        startName: {
            type: String,
            default: 'PERSON_NAME' // 审批流查询字段名
        },
        statusName: {
            type: String,
            default: 'STATUS' // 审批状态字段名
        },
    },
    computed: {
        startNode() {
            return this.setting[this.startName] || this.$store.state.user.userPerson ? [0].personName : ''
        },
        status() {
            return this.setting[this.statusName] || 'N'
        }
    },
    watch: {
        value(val) {
            this.activeName = val
        },
        headList: {
            handler(val) {
                // console.log('iBrain-section-approve watch headList', val);
            },
            deep: true,
            immediate: true
        },
        showVertical(val) {
            this.$emit('examineShow', val)
        }
    },
    methods: {
        changeSteps(val) {
            this.showSteps = val
        }
    },
    mounted() {
    }
}
</script>

<style lang="scss">
@import '@/assets/scss/base.scss';
</style>
<style lang="scss" scoped>
@import '@/styles/boxflex.scss';

.iBrain-section-approve {
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

    .iBrain-section-approve-head {
        background-color: #fff;
        padding: 0 20px;
        height: 48px;
        font-size: 12px;
        color: #adb2b9;
        @include dis_flex;
        @include align-items;

        span {
            padding: 0 5px;
            border-right: 1px solid #adb2b9;

            &.first {
                font-size: 14px;
                margin-right: 5px;
                color: #2c3e50;
                border-right: 0;
            }

            &:first-child {
                padding-left: 0;
            }

            &:last-child {
                border-right: 0;
            }
        }
    }

    .iBrain-section-approve-container {
        margin-top: 10px;
        width: 100%;
        overflow: hidden;
        @include boxflex;
    }

    .iBrain-section-approve-main {
        position: relative;
        padding: 0;
        margin: 0 10px;
        height: 100%;
        background-color: #fff;

        .history-icons {
            float: right;
            padding: 5px;
            color: #178fd2;
            font-size: 12px;
            background-color: #fff;
            z-index: 10;
            cursor: pointer;
        }

        .scroll {
            height: 100%;
            overflow: hidden;
            overflow-y: auto;
            padding-bottom: 10px;
        }

        ::v-deep .iBrain-module {
            padding: 0;
            margin: 0 10px;

            .iBrain-module-title {
                border: 0;
            }
        }
    }

    .iBrain-section-approve-aside {
        height: 100%;
        overflow: hidden;
        padding: 10px;
        background-color: #fff;

        .scroll {
            height: 100%;
            overflow: hidden;
            overflow-y: auto;
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

        .el-input__inner {
            width: 100%;
        }
    }

    ::v-deep .el-col.el-col-6 {
        height: 70px;
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
}
</style>
