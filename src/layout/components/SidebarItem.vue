<template>
    <div v-if="!item.hidden">
        <template
            v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren)">
            <router-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
                <el-menu-item :index="resolvePath(onlyOneChild.path)">
                    {{ onlyOneChild.meta.title }}
                </el-menu-item>
            </router-link>
        </template>

        <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
            <template slot="title">
                <Item v-if="item.meta" :title="item.meta.title" />
            </template>
            <SidebarItem v-for="child in item.children" :key="child.path" :item="child" :base-path="child.path" />
        </el-submenu>
    </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
export default {
    name: 'SidebarItem',
    components: { Item },
    props: {
        item: {
            type: Object,
            required: true
        },
        basePath: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            onlyOneChild: null
        }
    },
    methods: {
        hasOneShowingChild(children = [], parent) {
            const showingChildren = children.filter(item => {
                if (item.hidden) {
                    return false
                } else {
                    // 临时设置（如果只有一个显示的子项，将使用）
                    this.onlyOneChild = item
                    return true
                }
            })

            // 当只有一个子路由器时，默认情况下会显示子路由器
            if (showingChildren.length === 1) {
                return true
            }

            // 如果没有要显示的子路由器，则显示父路由器
            if (showingChildren.length === 0) {
                this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
                return true
            }

            return false
        },
        resolvePath(routePath) {
            debugger
            if (isExternal(routePath)) {
                return routePath
            }
            if (isExternal(this.basePath)) {
                return this.basePath
            }
            return path.resolve(this.basePath, routePath)
        },
    }
}
</script>
<style lang="scss" scoped>
a {
    text-decoration: none;
}

.router-link-active {
    text-decoration: none;
}
</style>
