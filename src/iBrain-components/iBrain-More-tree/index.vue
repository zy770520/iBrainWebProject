<template>
    <div>
        <el-select ref="select" v-model="defeultOrgName" style="width:100%">
            <el-option :value="treeList">
                <el-tree ref='tree' :data="treeList" show-checkbox node-key="ORG_ID" :props="defaultProps"
                    @node-click="handleRowClick" @check="handleCheckChange" :check-strictly="false" default-expand-all>
                    <div class="treenode" slot-scope="{node,data}">
                        <template>
                            <span class="tree-left">{{ data.COM_NAME }}</span>
                            <slot name="item" v-bind:item="data"></slot>
                        </template>
                    </div>
                </el-tree>
            </el-option>
        </el-select>
    </div>
</template>

<script>

export default {
    name: 'iBrain-tree',
    data() {
        return {
            defeultOrgName: '',
            showTree: false,
            checkoutArea: [],
            checkoutNameArea: [],
            checkedKeys: [],
            checkedNodes: [],
            checkoutKeyData: [],
            checkoutNodeData: [],
        };
    },
    props: {
        currentOrgName: {
            type: String,
            default: false
        },
        areaOrgList: {
            type: String,
            default: false
        },
        treeData: {
            type: Array,
            default: () => []
        },
        defaultProps: {
            type: Object,
            default: () => {
                return {
                    value: 'ORG_CODE',
                    label: 'COM_NAME',
                    children: 'list'
                }
            }
        },
    },
    watch: {
        currentOrgName(val) {
            this.defeultOrgName = val
            this.checkoutNameArea = val.split(',')
        },
        areaOrgList: {
            handler(val) {
                let that = this
                if (val != '') {
                    this.$nextTick(() => {
                        that.checkoutArea = val.split(',').map(item => { return parseInt(item) })
                        that.$refs.tree.setCheckedKeys(val.split(','));
                    })
                } else {
                    this.$nextTick(() => {
                        that.$refs.tree.setCheckedKeys([])
                    });
                }
            },
            deep: true,
            immediate: true
        },
        treeData: {
            handler(val) {
                this.treeList = val
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
    },
    methods: {
        init() {
        },
        // 点击行即可让复选框勾选
        handleRowClick(data, node) {
            node.checked = !(node.checked)
            if (this.checkoutKeyData.includes(data.ORG_ID)) {
                this.checkedKeys.remove(data.ORG_ID)
                this.checkedNodes.remove(data.COM_NAME)
                this.checkoutKeyData.remove(data.ORG_ID)
                this.checkoutNodeData.remove(data.COM_NAME)
            } else {
                this.checkedKeys.push(data.ORG_ID)
                this.checkedNodes.push(data.COM_NAME)
                this.checkoutKeyData = this.checkedKeys.concat(this.checkoutArea)
                this.checkoutNodeData = this.checkedNodes.concat(this.checkoutNameArea)
            }
            this.defeultOrgName = this.checkoutNodeData.toString()
            this.$emit('selectOrgId', this.checkoutKeyData)
        },
        // 点击复选框勾选
        handleCheckChange(data, checkData) {
            this.$emit('selectOrgId', checkData.checkedKeys)
            this.checkoutKeyData = checkData.checkedKeys
            this.checkoutNodeData = checkData.checkedNodes.map(item => { return item.COM_NAME })
            this.defeultOrgName = checkData.checkedNodes.map(item => { return item.COM_NAME }).toString()
        },

    }
};
</script>

<style lang="scss" scoped>
@import '@/styles/boxflex.scss';

// .el-tree {
//     // height: 330px;
// }

.el-dropdown {
    width: 100%;
}

.el-dropdown-menu {
    padding: 10px;
    left: 872px !important;
}

.el-dropdown-menu--small .el-dropdown-menu__item {
    padding: 0px;
    font-size: 12px;
}

::v-deep .el-input.is-disabled .el-input__inner {
    background-color: #ffffff !important;

}

::v-deep .el-input--small .el-input__inner {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.el-select-dropdown__item {
    height: 100% !important;
    padding: 0 10px;
}

.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
    background: #ffffff;
}

.popper__arrow {
    left: 25px !important;
}

.down {
    position: absolute;
    height: 100%;
    right: 5px;
    top: 10px;
    text-align: center;
    color: #c0c4cc;
    transition: all 0.3s;
    pointer-events: none;
}

.treenode {
    display: contents;

    span {
        display: inline-block;

    }

    .tree-left {
        flex: 1;
        margin-right: 10px;
    }

    .sucess {
        color: #33a647;
    }

    .primary {
        color: #0079fe;
    }

    .danger {
        color: #cc0000;
    }
}
</style>
