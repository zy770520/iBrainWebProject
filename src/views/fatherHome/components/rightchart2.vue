<template>
    <div class="right-chart2">
        <div class="right-chart2-title" :style="{ 'font-size': kFOne + 'px' }">
            <a class="colorText">
                主要检测产品汇总信息
                <dv-decoration-3 :dur="0.5"
                    :style="{ width: Math.round(kHOne / 1.9) + 'px', height: Math.round(kHOne / 11.4) + 'px', 'margin-left': Math.round(kHOne / 22.8) + 'px' }" />
            </a>
        </div>
        <div class="right-chart2-chart-content" :style="{
            'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px', 'margin-top': Math.round(kHOne / 40) + 'px', 'font-size': Math.round(kHOne / 16.6) + 'px',
        }">
            <div v-if="recentData" :style="{ 'padding': Math.round(kHOne / 16) + 'px', }">
                <a :title="recentData.id" :style="{
            'minWidth': Math.round(kWOne / 2.23) + 'px', 'maxWidth': Math.round(kWOne / 2.23) + 'px', 'margin-top': Math.round(kHOne / 22.8) + 'px', 'margin-right': Math.round(kHOne / 76) + 'px'
        }">产品编号：{{ 'LB_' + recentData.id }}</a>
                <a :title="recentData.name" :style="{
            'minWidth': Math.round(kWOne / 2.23) + 'px', 'maxWidth': Math.round(kWOne / 2.23) + 'px', 'margin-top': Math.round(kHOne / 22.8) + 'px'
        }">产品名称：{{ recentData.name }}</a>
                <a :title="recentData.model" :style="{
            'minWidth': Math.round(kWOne / 2.23) + 'px', 'maxWidth': Math.round(kWOne / 2.23) + 'px', 'margin-top': Math.round(kHOne / 22.8) + 'px', 'margin-right': Math.round(kHOne / 76) + 'px'
        }">产品型号：{{ recentData.model }}</a>
                <a :title="recentData.specification" :style="{
            'minWidth': Math.round(kWOne / 2.23) + 'px', 'maxWidth': Math.round(kWOne / 2.23) + 'px', 'margin-top': Math.round(kHOne / 22.8) + 'px'
        }">产品规格：{{ recentData.specification }}</a>
                <a :title="recentData.batch" :style="{
            'minWidth': Math.round(kWOne / 2.23) + 'px', 'maxWidth': Math.round(kWOne / 2.23) + 'px', 'margin-top': Math.round(kHOne / 22.8) + 'px', 'margin-right': Math.round(kHOne / 76) + 'px'
        }">批次：{{ recentData.batch }}</a>
                <a :title="recentData.time" :style="{
            'minWidth': Math.round(kWOne / 2.23) + 'px', 'maxWidth': Math.round(kWOne / 2.23) + 'px', 'margin-top': Math.round(kHOne / 22.8) + 'px'
        }">时间：{{ recentData.time }}</a>
                <img src="../../../assets/imgs/water.png" :style="{
            'minWidth': Math.round(kHOne / 2.28) + 'px', 'minHeight': Math.round(kHOne / 2.23) + 'px', 'margin-top': Math.round(kHOne / 11.78) + 'px',
        }" />
            </div>

        </div>
    </div>
</template>

<script>
import { getMainProductInfo } from '@/api/fatherHome.js';

export default {
    props: {
    },
    data() {
        return {
            // 获取浏览器可视区域高度（包含滚动条）、 window.innerHeight
            // 获取浏览器可视区域高度（不包含工具栏高度）、document.documentElement.clientHeight
            // 获取body的实际高度  (三个都是相同，兼容性不同的浏览器而设置的) document.body.clientHeight
            screenHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            screenWidth: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            chartInstance: null,
            allData: [],
            key: 0,
            // 高度
            kHOne: null,
            // 宽度
            kWOne: null,
            // 标题字体
            kFOne: null,
            // 定时器监控
            koiTime: null,
            // 局部刷新定时器 
            koiTimer: null,
            recentData: null,
        }
    },
    beforeMount() {
        this.kWOne = Math.round(this.screenWidth * 0.2)
        this.kHOne = Math.round(this.screenHeight * 0.224)
        this.kFOne = Math.round(this.screenWidth / 90)
    },
    mounted() {
        // 页面大小改变时触发
        window.addEventListener('resize', this.getScreenHeight, false);
        // 页面大小改变时触发
        window.addEventListener('resize', this.getScreenWidth, false);
        window.removeEventListener("resize", this.screenAdapter, false);
        // 鼠标移动时触发
        //window.addEventListener('mousemove',this.getHeight, false);
        this.resizeScreen();
        // 获取后端接口数据
        this.getData();
        // 执行数据局部刷新定时器
        //this.getDataTimer();
    },
    destroyed() {
        // 清除自适应定时器
        clearInterval(this.koiTime);
        this.koiTime = null;
        // 清除局部刷新定时器
        clearInterval(this.koiTimer);
        this.koiTimer = null;
        // 页面大小改变时触发销毁
        window.removeEventListener('resize', this.getScreenHeight, false);
        // 页面大小改变时触发销毁
        window.removeEventListener('resize', this.getScreenWidth, false);
        window.addEventListener("resize", this.screenAdapter, false);

    },
    methods: {
        resizeScreen() {
            this.koiTime = setInterval(() => {
                this.getScreenHeight();
                this.getScreenWidth();
            }, 200)
        },
        screenAdapter() {
            var _this = this
            _this.$nextTick(() => {
                _this.key++
            });
        },
        // 获取浏览器高度进行自适应
        getScreenHeight() {
            this.screenHeight = window.innerHeight || document.documentElement.innerHeight || document.body.clientHeight;
            // 四舍五入取整数
            this.kHOne = Math.round(this.screenHeight * 0.224);
            //console.log("高度->"+this.screenHeight +"-"+ this.kHOne);
        },
        // 字体大小根据宽度自适应
        getScreenWidth() {
            this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            this.kWOne = Math.round(this.screenWidth * 0.2);
            this.kFOne = Math.round(this.screenWidth / 90);
            //console.log("宽度->"+this.screenWidth);
        },
        getData() {
            getMainProductInfo().then(res => {
                this.recentData = res
            })
        },
        // 定时器
        getDataTimer() {
            let that = this
            this.koiTimer = setInterval(() => {
                // 执行刷新数据的方法
                // this.getData();
                // that.config = { ...that.config }
                // console.log("Hello World")
            }, 3000)
        },
    },
}
</script>

<style lang="scss">
.right-chart2 {
    display: flex;
    flex-direction: column;

    .right-chart2-title {
        flex: 1;
        font-weight: 900;

        .colorText {
            background: linear-gradient(-360deg, #0072ff, #00eaff 48.8525390625%, #01aaff);
            background-clip: text;
            color: transparent;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
        }
    }

    // .right-chart2-chart {
    // flex: 3;
    // display: flex;
    // flex-direction: column;
    // justify-content: flex-start;
    // align-items: center;
    // background: #041135;

    .right-chart2-chart-content {
        flex: 3;
        display: flex;
        background: #041135;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #ffffff;
        font-weight: 900;

        div {
            flex: 1;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;

            a {
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    // }
}
</style>
