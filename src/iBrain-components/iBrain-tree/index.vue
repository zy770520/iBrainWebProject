<template>
    <div class="iBrain-tree" v-if="visible">
        <div class="tree-select">
            <el-input placeholder="请输入" v-model="treeValue" v-if="showSearch"></el-input>
            <i class="el-icon-search"></i>
        </div>
        <div class="tree-scroll">
            <el-tree ref="tree" v-bind="$attrs" :data="treeList" :props="defaultProps" @node-click="nodeClick"
                :node-key="nodeKey" :filter-node-method="filterNode" :indent="10" :default-expand-all="defaultExpandAll"
                :expand-on-click-node="expandOnClickNode" highlight-current
                :default-expanded-keys="defaultExpandedKeys">
                <template slot-scope="{node}">
                    <el-tooltip :disabled="node.label && node.label.length >= 14 ? false : true" effect="dark"
                        :content="node.label" placement="left">
                        <span v-if="!treeValue" class="newWrap">{{ node.label }}</span>
                        <span v-if="treeValue" v-html="getLabel(node)" />
                    </el-tooltip>
                    <!-- <span class="el-tree-node__label" v-html="getLabel(node)"></span> -->
                </template>
            </el-tree>
        </div>
    </div>
</template>

<script>
export default {
    name: 'iBrain-tree',
    data() {
        return {
            visible: false,
            treeValue: '',
            containerResize: null,
            containerHeight: 400,
            treeList: []
        };
    },
    props: {
        treeData: {
            type: Array,
            default: () => []
        },
        nodeKey: {
            type: String,
            default: 'id'
        },
        showSearch: {
            type: Boolean,
            default: true
        },
        defaultExpandAll: {
            type: Boolean,
            default: true
        },
        expandOnClickNode: {
            type: Boolean,
            default: false
        },
        defaultExpandedKeys: {
            type: Array,
            default: () => []
        },
        defaultProps: {
            type: Object,
            default: () => {
                return {
                    value: 'itemId',
                    label: 'itemName',
                    children: 'children'
                }
            }
        },
        isSearchOpenChildrens: {
            type: Boolean,
            default: false
        },
    },
    watch: {
        treeValue(val) {
            this.$refs.tree.filter(val);
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
        this.init()
    },
    methods: {
        init() {
            this.visible = true
        },
        getLabel(node) {
            let value = this.treeValue
            if (!value) {
                return node.label
            }
            return node.label.replace(new RegExp(value, 'g'), `<font style='color:#0079fe'>${value}</font>`)
        },
        filterNode(value, data, node) {
            //     //节点过滤
            if (!value) return true
            if (this.isSearchOpenChildrens) {
                return this.filterNodeAndParent(value, data, node)
            } else {
                return data[this.defaultProps.label].indexOf(value) !== -1;
            }
        },

        // 递归检测父元素或自己是否符合条件
        filterNodeAndParent(value, data, node) {
            if (node.level === 1) {
                return data[this.defaultProps.label].indexOf(value) !== -1
            } else if (node.level !== 1) {
                // 判断自己是否符合条件
                if (data[this.defaultProps.label].indexOf(value) !== -1) {
                    return true
                } else { // 否则查找父级
                    return this.filterNodeAndParent(value, node.data, node.parent)
                }
            }
        },
        nodeClick(data, node, event) {
            this.$emit('nodeClick', data, node, event)
        },
    }
};
</script>

<style lang="scss" scoped>
@import '@/styles/boxflex.scss';

.iBrain-tree {
    @include dis_flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    overflow: hidden;

    .el-tree {
        margin-top: 10px;
        min-height: 200px;

        ::v-deep .el-tree-node__label {
            font-size: 13px;
        }

    }

    .tree-select {
        position: relative;

        .el-icon-search {
            position: absolute;
            right: 0;
            top: 0;
            opacity: .4;
            text-align: center;
            padding: 8px;
            pointer-events: none;
        }
    }

    .tree-scroll {
        @include boxflex;
        overflow-x: hidden;
        overflow-y: auto;
    }

    ::v-deep .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        padding-right: 8px;
    }
}
</style>
