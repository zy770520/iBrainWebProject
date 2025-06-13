<template>
    <section class="app-main">
        <div class="navBox">
            <Menu v-show="navShow"></Menu>
        </div>
        <router-view :key="key" />
    </section>
</template>

<script>
import Menu from '../../components/menu/menuCopy.vue'
// import Menu from '../../components/menu/javascript.vue'
export default {
    nmae: 'AppMain',
    components: { Menu },
    computed: {
        key() {
            return this.$route.path
        },
        navShow() {
            this.$store.state.applicationInfo.menuWorkFlowRefresh = false;
            let routes = ['/workflowConfig', '/softwareRegistration'];
            let showBol = false;
            routes.forEach(v => {
                if (this.$route.path.includes(v)) {
                    showBol = true;
                    return true;
                }
            })
            this.$nextTick(() => {
                this.$store.state.applicationInfo.menuWorkFlowRefresh = true;
            })
            return showBol
        }
    }
}
</script>

<style lang="scss" scoped>
.app-main {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.navBox {
    float: left;
    // min-height: calc(100vh - 70px);
    // max-height: calc(100vh - 70px);
    // overflow-y: auto;
}
</style>