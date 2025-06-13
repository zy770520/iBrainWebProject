<template>
    <Chart :historyData="historyData" :style="{
        'width': 100 + '%',
        'minHeight': Math.round(kHOne / 1.04) + 'px',
    }" />
</template>

<script>
import Chart from './chart.vue'
export default {
    props: {
        historyData: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            screenHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            // 高度
            kHOne: null,
            koiTime: null
        };
    },
    components: {
        Chart,
    },
    beforeMount() {
        this.kHOne = Math.round(this.screenHeight * 0.25)
    },
    mounted() {
        window.addEventListener('resize', this.getScreenHeight, false);
    },
    methods: {
        resizeScreen() {
            this.koiTime = setInterval(() => {
                this.getScreenHeight();
            }, 2000)
        },
        getScreenHeight() {
            this.screenHeight = window.innerHeight || document.documentElement.innerHeight || document.body.clientHeight;
            // 四舍五入取整数
            this.kHOne = Math.round(this.screenHeight * 0.25);
        },
    },
    destroyed() {
        clearInterval(this.koiTime);
        this.koiTime = null;
        window.removeEventListener('resize', this.getScreenHeight, false);
    },
};
</script>

<style lang="scss" scoped></style>