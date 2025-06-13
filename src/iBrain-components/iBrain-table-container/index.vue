<template>
    <!-- :height="containerHeight" -->
    <div class="iBrain-table-container">
        <el-table ref="myTable" class="notTips" :data="tableData" :stripe="stripe" border tooltip-effect="dark"
            highlight-current-row v-bind="$attrs" element-loading-text="数据加载中"
            :header-cell-style="{ background: '#F6F9FD', color: '#787A7F' }" @select="handleSelectionChange"
            @row-dblclick="handelDoubleClick" @header-dragend="surverWidth" @sort-change="sortChange"
            @current-change="handleSelectionCurrentChange" :header-row-class-name="multiple ? 'multiple' : ''">
            <template v-if="showSelection">
                <el-table-column align="center" type="selection" width="50"></el-table-column>
            </template>
            <el-table-column align="center" label="序号" width="60" v-if="showIndex">
                <template slot-scope="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>

            <template v-if="isAutoColumns">
                <template v-for="item in columnsList">
                    <el-table-column v-if="!item.hidden" :key="item.label"
                        :align="item.isMoney ? 'right' : item.align ? item.align : ''" :label="item.label"
                        :min-width="item.width" :prop="item.prop"
                        :show-overflow-tooltip="!item.type || item.type == 'text'" :sortable="item.sortable">
                        <template slot-scope="scope">
                            <template v-if="(item.handle || item.isStatus) && scope.row[item.prop]">
                                <iBrain-link v-model="scope.row[item.prop]" :isStatus="item.isStatus" size="middle"
                                    @click.stop="onClickItemHandle(item, scope.row)"></iBrain-link>
                            </template>
                            <template v-else-if="item.calcHandle && typeof item.calcHandle === 'function'">
                                {{ item.calcHandle(scope.row, scope.$index) }}
                            </template>
                            <template v-else-if="item.fileStatus">
                                <a :style="{ color: scope.row.contains_attachment ? '#15b03e' : '#ff3a3a' }">
                                    {{ scope.row.contains_attachment ? '已上传' : '未上传' }}
                                </a>
                            </template>
                            <template v-else-if="item.configStatus">
                                <a
                                    :style="{ color: scope.row.config_state == 'NotConfigured' ? '#ff3a3a' : '#15b03e' }">
                                    {{ scope.row.config_state == 'NotConfigured' ? '未配置' : '已配置' }}
                                </a>
                            </template>
                            <template v-else>
                                <template v-if="item.handle && item.isMoney">
                                    <iBrain-link size="middle" v-model="scope.row[item.prop]"
                                        @click.stop="onClickItemHandle(item, scope.row)">{{
            formatMoney(scope.row[item.prop]) }}
                                    </iBrain-link>
                                </template>
                                <template v-else-if="item.isMoney">{{ formatMoney(scope.row[item.prop]) }}
                                </template>
                                <template v-else>{{ scope.row[item.prop] }}</template>
                            </template>
                        </template>
                    </el-table-column>
                </template>
            </template>

            <slot v-else></slot>
            <!-- 固定列 -->
            <slot v-if="$slots.operation" name="operation"></slot>
        </el-table>
    </div>

</template>

<script>
// import { toMoney } from '@/utils/iBrain-common'

export default {
    name: 'iBrain-table-container',
    data() {
        return {
            selections: [],
            columnsList: [],
            model: {},
            sortOrder: '',
            tableRadio: '',
            containerResize: null,
            containerHeight: 462
        }
    },
    watch: {
        columns: {
            handler(val, oldval) {
                this.columnsList = val
                this.$nextTick(() => this.myTable && this.myTable.doLayout())
            },
            immediate: false,
            deep: true
        },
        tableRadio: {
            handler() {
                this.myTable.doLayout()
            },
            immediate: false,
            deep: true
        },
        selectList(val) {
            this.selections = val
        }
    },
    props: {
        columns: {
            type: Array,
            default: () => [],
        },
        isAutoColumns: {
            type: Boolean,
            default: true,
        },
        tableData: {
            type: Array,
            default: () => [],
        },
        selectList: {
            type: Array,
            default: () => [],
        },
        showSelection: {
            type: Boolean,
            default: true,
        },
        showIndex: {
            type: Boolean,
            default: false,
        },
        headerCellStyle: {
            type: [Object, Function],
            default: () => { },
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        stripe: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        myTable() {
            return this.$refs.myTable
        }
    },
    methods: {
        // 这个方法用来动态设置 height
        getAutoHeight() {
            let el = document.querySelector("#tableData"),
                elParent = el.parentNode,
                pt = this.getStyle(elParent, "paddingTop"),
                pb = this.getStyle(elParent, "paddingBottom");
            // 一定要使用 nextTick 来改变height 不然不会起作用
            this.$nextTick(() => {
                this.height = elParent.clientHeight - (pt + pb) + "px";
            });
        },
        // 获取样式 我们需要减掉 padding-top， padding-bottom的值
        getStyle(obj, attr) {
            // 兼容IE浏览器
            let result = obj.currentStyle
                ? obj.currentStyle[attr].replace("px", "")
                : document.defaultView
                    .getComputedStyle(obj, null)[attr].replace("px", "");
            return Number(result);
        },
        // 金额格式
        formatMoney(cellValue) {
            if (cellValue === 0) {
                return 0
            }
            if (!cellValue) {
                return ''
            } else {
                return cellValue
            }
        },
        onClickItemHandle(columns, row) {
            if (!columns.handle) return

            if (typeof columns.handle === 'function') {
                return columns.handle(columns, row)
            }

            if (typeof columns.handle === 'string' && columns.handle.includes('http')) {
                return window.location.href = columns.handle
            }
        },
        handleSelectionChange(selection, row) {
            if (selection.length > 1 && !this.multiple) {
                const del_row = selection.shift()
                this.$refs.myTable.toggleRowSelection(del_row, false)
            }
            this.selections = selection;
            this.$emit('changeSelect', selection[0])
        },
        handleSelectionCurrentChange(val) {
            console.log("🚀 ~ handleSelectionCurrentChange ~ val:", val)
            this.$emit('currentSelect', val)
        },
        // 对比对象相等
        objectValueEqual(a, b) {
            var aProps = Object.getOwnPropertyNames(a)
            var bProps = Object.getOwnPropertyNames(b)

            if (aProps.length != bProps.length) {
                return false
            }

            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i]

                if (a[propName] !== b[propName]) {
                    return false
                }
            }

            return true
        },
        // 选中表格行
        handelTableClick(row, column, event) {
            if (event.target.localName == 'input') return
            if (!this.showSelection) return
            let curIndex = this.selections.findIndex(item => {
                return this.objectValueEqual(item, row)
            })
            if (!this.multiple) {
                if (curIndex == -1) {
                    this.setRadioSelect(row)
                    this.clearSelection()
                } else {
                    this.tableRadio = ''
                }
            }
            this.$emit('changeSelect', row)
            this.myTable.toggleRowSelection(row)
        },
        setRadioSelect(row) {
            let index = this.tableData.findIndex(item => {
                return this.objectValueEqual(item, row)
            })
            this.tableRadio = index > -1 ? index : ''
        },
        getCurrentRow(row, index) {
            this.clearSelection()
            this.myTable.toggleRowSelection(row)
        },
        // 双击选择
        handelDoubleClick(row, column, event) {
            if (event.target.localName == 'input') return
            this.clearSelection()
            this.myTable.toggleRowSelection(row, true)
            this.$emit('onConfirm')
        },
        clearSelection() {
            this.myTable.clearSelection();
        },
        // selectRow(row) {
        //     console.log(row, this.tableData[0]);
        //     this.myTable.toggleRowSelection(row, true)
        //     // this.tableData.map(item => {
        //     //     console.log(this.objectValueEqual(item, row));
        //     //     if (this.objectValueEqual(item, row)){
        //     //         this.myTable.toggleRowSelection(row, true)
        //     //     }
        //     // })
        // },
        sortChange(column, prop, order) {
            this.sortOrder = order
        },
        deleteRow(index, rows) {
            rows.splice(index, 1)
        },
        onDeleteRows() {
            this.selections.forEach(item => {
                let index = this.tableData.findIndex(row => row == item)
                this.deleteRow(index, this.tableData)
            })
        },
        // 表头拖动事件
        surverWidth(newWidth, oldWidth, column, event) {
            this.columnsList = this.columnsList.map(v => {
                if (v.prop === column.property) v.width = newWidth
                return v
            })
        },
        removeEventResize() {
            if (!this.containerResize) return
            this.containerResize.unobserve(this.$el);
            this.containerResize = null;
        },
        addEventResize() {
            this.removeEventResize()
            this.containerResize = new ResizeObserver((entries, b) => {
                for (let entry of entries) {
                    if (b === this.containerResize) {
                        this.containerHeight = Math.max(entry.contentRect.height, 100)
                        this.myTable.doLayout()
                    }
                }
                // console.log(this.containerHeight, '------表格高度')
            })
            this.containerResize.observe(this.$el)
        },
    },
    beforeDestroy() {
        this.removeEventResize()
    },
    mounted() {
        this.columnsList = this.columns
        this.$nextTick(() => {
            this.$nextTick(() => this.addEventResize())
        })
    },
}
</script>

<style lang="scss">
.iBrain-table-container {
    position: relative;
    width: 100%;
    max-height: calc(100vh - 340px);
    overflow-y: auto;

    .el-table {
        width: 100%;
        font-size: 16px;

        .el-radio__label {
            display: none;
        }

        .el-radio__inner {
            box-shadow: none;

            &::after {
                height: 3px;
                left: 2px;
                top: 3px;
                width: 7px;
            }
        }

        .el-table__fixed-right-patch {
            z-index: 2;
        }

        .el-table__header-wrapper {

            .el-table__header {
                .has-gutter {
                    tr {
                        th {
                            .cell {
                                .el-checkbox {
                                    display: none;
                                }
                            }
                        }
                    }
                }
            }
        }

        .el-table__cell.is-center {
            .cell {
                .el-button {
                    font-size: 14px;
                }
            }
        }
    }

    .el-form-item {
        margin: 0;

        .el-form-item__error {
            position: static;
            margin-top: 4px;
        }
    }

    td .cell,
    th .cell {

        .el-checkbox {

            .el-radio__input.is-checked .el-radio__inner,
            .el-checkbox__input.is-indeterminate .el-checkbox__inner,
            .el-checkbox__input.is-checked .el-checkbox__inner {
                background-color: #178fd2;
                border-color: #178fd2;

                .el-checkbox__original {
                    pointer-events: none;
                }
            }
        }
    }

    tr {
        td.el-table-column--selection {
            .el-checkbox {
                pointer-events: none;
            }
        }

        th.el-table-column--selection {
            .el-checkbox {
                display: none;
            }
        }

        &.multiple {
            th.el-table-column--selection {
                .el-checkbox {
                    display: block;
                }
            }
        }
    }
}
</style>
