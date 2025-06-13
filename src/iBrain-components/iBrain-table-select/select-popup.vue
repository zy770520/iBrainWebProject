<template>
    <!-- 表数据查询筛选弹窗 -->
    <span v-if="visible">
        <el-dialog v-if="showSelectDialog" class="iBrain-table-popup-dialog" :title="title"
            :visible.sync="showSelectDialog" :close-on-click-modal="false" append-to-body lock-scroll :width="width"
            height="100%" @close="onClose()">
            <el-form class="iBrain-table-popup-form" @submit.native.prevent :label-width="(labelWidth || '100px')"
                v-if="queryData.length">
                <el-row>
                    <el-col :span="(item.collspan || 8)" v-for="item in queryData" :key="item.prop">
                        <el-form-item :label="item.label">
                            <iBrain-select v-if="item.querySelect" v-model="params[item.prop]"
                                :options="item.querySelect" :valueKey="item.valueKey" :labelKey="item.labelKey"
                                @clear="onSelectClear(item)" clearable />
                            <el-date-picker style="width:100%" v-else-if="item.queryDatePicker"
                                v-model="params[item.prop]" :type="item.queryDateType"
                                :value-format="item.queryDateFormat" placeholder="请选择"
                                @keydown.native="byEnterKey($event)" clearable />
                            <el-input v-else v-model="params[item.prop]" placeholder="请输入" clearable
                                @keydown.native="onEnter($event)" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="buttonSpan" :offset="btOffset" class="group">
                        <iBrain-botton type="primary" @ButtonClick="init()">
                            {{ $t("common.search") }}
                        </iBrain-botton>
                        <iBrain-botton @ButtonClick="onReset()">重置</iBrain-botton>
                    </el-col>
                </el-row>
            </el-form>
            <div class="box">
                <iBrain-table-container ref="myTable" :tableData="tableList" :columns="columns"
                    :selectList="tableSelectList" :showIndex="showIndex" :multiple="multiple" v-loading="listLoading"
                    @changeSelect="changeSelect" @onConfirm="onSubmit">
                    <template slot="operation" v-if="$slots.operation">
                        <slot name="operation"></slot>
                    </template>
                </iBrain-table-container>
            </div>

            <PaginationXJ :total="total" :page.sync="pageNum" :limit.sync="pageSize" @pagination="init" />
            <span slot="footer" class="dialog-footer">
                <iBrain-botton type="primary" @ButtonClick="onSubmit()">
                    {{ $t("common.confirmButton") }}
                </iBrain-botton>
                <iBrain-botton @ButtonClick="onClose()">
                    {{ $t("common.cancelButton") }}
                </iBrain-botton>
            </span>
        </el-dialog>
    </span>
</template>
<script>
export default {
    name: 'iBrain-table-popup',
    components: {
    },
    data() {
        return {
            visible: false,
            showSelectDialog: false,
            params: {},
            pageNum: '1',
            pageSize: '10',
            total: 0,
            listLoading: false,
            queryData: [],
            tableList: [],
            tableSelectList: []
        };
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        value: {
            type: Boolean,
            default: false
        },
        extendParames: {
            type: Object, // 查询条件以外的参数
            default: () => { }
        },
        getDataFun: {
            type: [Boolean, Function], // 查询接口调用函数 必传
            default: () => false
        },
        columns: {
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
        multiple: {
            type: Boolean,
            default: false
        },
        showIndex: {
            type: Boolean,
            default: false
        },
        showSummary: {
            type: Boolean,
            default: false
        },
        labelWidth: {
            type: String,
            default: ''
        },
        buttonSpan: {
            type: Number,
            default: 8
        },
        width: {
            type: String,
            default: '60%'
        },
    },
    watch: {
        value(val) {
            this.showSelectDialog = val
            this.init()
        },
        showSelectDialog(val) {
            this.$emit('input', val)
        }
    },
    computed: {
        $table() {
            return this.$refs["myTable"]
        },
        btOffset() {
            // let len = this.queryData.length
            // let rem = (len + 1) % 3
            // return rem == 1 ? 16 : rem == 2 ? 8 : 0
            let collspan = 0
            this.queryData.forEach((item) => {
                collspan += Number(item.collspan || 8)
                if (collspan > 24) {
                    collspan = item.collspan || 8
                }
            })
            if (collspan > (24 - this.buttonSpan)) {
                return (24 - this.buttonSpan)
            } else {
                return (24 - this.buttonSpan) - collspan
            }
        }
    },
    mounted() {
        // 无效参数停止渲染组件
        if (!this.getDataFun || typeof this.getDataFun != 'function') return

        this.initParams()
        this.init()
    },
    methods: {
        // 初始化数据
        init() {
            this.listLoading = true;
            this.tableList = [];
            let params = Object.assign({
                pageNum: this.pageNum,
                pageSize: this.pageSize
            }, this.params)

            // 调用查询函数
            this.getDataFun(params, this, this.extendParames).then(() => {
                this.listLoading = false;
                console.log(this.tableList);
            }).catch(() => {
                this.listLoading = false;
            })
        },
        initParams() {
            // 列数据内 获取查询条件
            this.queryData = this.columns.filter(item => {
                item.isQuery && this.$set(this.params, [item.prop], '')
                return item.isQuery
            })
            this.$nextTick(() => this.visible = true)
        },
        onSelectClear(item) {
            this.params[item.prop] = ''
        },
        // 回车按键
        onEnter(e) {
            if (e.keyCode == 13) {
                this.pageNum = '1';
                this.total = 0;
                this.init();
            }
        },
        // 重置
        onReset() {
            this.initParams();
            this.init();
        },
        changeSelect(val) {
            this.tableSelectList = val;
        },
        // 确认
        onSubmit() {
            this.$emit("change", this.tableSelectList);
            this.showSelectDialog = false;
            this.onClose();
        },
        // 返回
        onClose() {
            this.initParams();
            this.tableList = [];
            this.listLoading = false;
            this.showSelectDialog = false;
        },
    },
};
</script>

<style lang="scss">
@import '@/styles/boxflex.scss';

.iBrain-table-popup-dialog {
    .el-dialog__body {
        padding: 0 10px;
        // overflow: auto;
        // overflow-x: hidden;
        border: none;
        height: 400px;
        max-height: 60vh;
        @include dis_flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        overflow: hidden;
    }

    .box {
        height: 100%;
        overflow: auto;
        overflow-x: hidden;
        padding-bottom: 1px;
    }

    .el-dialog__footer {
        border: none;
    }

    .el-pagination {
        margin-top: 5px !important;
    }
}

.iBrain-table-popup-form {
    margin-left: 10px;
    margin-top: 10px;
    padding-right: 0 !important;

    .el-col {
        padding-bottom: 18px;
    }

    .el-form-item--small.el-form-item {
        margin-bottom: 0;
    }

    .group {
        padding-left: 100px;
    }
}
</style>
