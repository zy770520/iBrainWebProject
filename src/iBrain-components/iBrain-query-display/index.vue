<template>
    <div class="iBrain-query-display" v-if="menulist.length > 0">
        <el-tabs v-model="editableTabsValue" type="card" closable @edit="handleTabsEdit">
            <el-tab-pane :key="item.productId" v-for="(item, index) in menulist" :label="item.productName"
                :name="item.productId">
                <component :is="item.url.substr(item.url.indexOf('/') + 1, item.url.length)" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
// import ProductInformation from '@/views/information/ProductInformation/home.vue'
// import Console from '@/views/console/index.vue'
export default {
    components: {
        // ProductInformation 
    },
    prop: {
    },
    data() {
        return {
            menulist: [],
            editableTabsValue: '1',
            tabIndex: 2
        }
    },
    watch: {
    },
    methods: {
        handleTabsEdit(targetName, action) {
            if (action === 'remove') {
                let tabs = this.menulist;
                let activeName = this.editableTabsValue;
                if (activeName === targetName) {
                    tabs.forEach((tab, index) => {
                        if (tab.productId === targetName) {
                            let nextTab = tabs[index + 1] || tabs[index - 1];
                            if (nextTab) {
                                activeName = nextTab.productId;
                            }
                        }
                    });
                }
                this.editableTabsValue = activeName;
                this.menulist = tabs.filter(tab => tab.productId !== targetName);
            }
        }
    },
    mounted() {
    }

}
</script>

<style lang="css" scoped>
.iBrain-query-display {
    color: #333333;
}

>>>.el-tabs__item.is-active {
    color: rgb(48, 86, 211) !important;
}
</style>
