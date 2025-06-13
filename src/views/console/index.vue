<template>
    <div>
        <component :is="currentTab" :key="currentTab">
        </component>
    </div>
</template>

<script>
// import console from './components/console.vue'
// import consoleMessage from './components/consoleMessage.vue'
import consoleMsgCard from './components/consoleMsgCard.vue'
// import consoleMsgCard from './components/viewer.vue'
export default {
    name: "Console",
    // components: { console },
    // components: { consoleMessage },
    components: { consoleMsgCard },
    props: {},
    data() {
        return {
            currentTab: null,
        }
    },
    mounted() {
        // this.currentTab = 'console';
        // this.currentTab = 'consoleMessage';
        this.currentTab = 'consoleMsgCard';
    }
};
</script>
<style lang="scss"></style>
