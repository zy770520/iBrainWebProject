<template>
    <div class="left-chart1" v-if="checkNums != null">
        <div class="left-chart1-title" :style="{ 'font-size': kFOne + 'px' }">
            <a class="colorText">
                <dv-decoration-12 :scanDur="0.5" :key="key"
                    :style="{ width: Math.round(kHOne / 2.67) + 'px', height: Math.round(kHOne / 2.67) + 'px', 'margin-right': Math.round(kHOne / 6.15) + 'px' }" />
                在检种类数量
            </a>
        </div>
        <div class="left-chart1-chart" :style="{
        'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px', 'margin-top': Math.round(kHOne / 8.8) + 'px',
        'font-size': Math.round(kHOne / 2) + 'px'
    }">
            <a :style="{
        'padding-top': Math.round(kHOne / 8) + 'px',
        'padding-right': Math.round(kHOne / 4) + 'px',
        'padding-bottom': Math.round(kHOne / 8) + 'px',
        'padding-left': Math.round(kHOne / 4) + 'px',
    }">
                {{ checkNums[0] }}
            </a>
            <a :style="{
        'padding-top': Math.round(kHOne / 8) + 'px',
        'padding-right': Math.round(kHOne / 4) + 'px',
        'padding-bottom': Math.round(kHOne / 8) + 'px',
        'padding-left': Math.round(kHOne / 4) + 'px',
    }">
                {{ checkNums[1] }}
            </a>
            <a :style="{
        'padding-top': Math.round(kHOne / 8) + 'px',
        'padding-right': Math.round(kHOne / 4) + 'px',
        'padding-bottom': Math.round(kHOne / 8) + 'px',
        'padding-left': Math.round(kHOne / 4) + 'px',
    }">
                {{ checkNums[2] }}
            </a>
            <a :style="{
        'padding-top': Math.round(kHOne / 8) + 'px',
        'padding-right': Math.round(kHOne / 4) + 'px',
        'padding-bottom': Math.round(kHOne / 8) + 'px',
        'padding-left': Math.round(kHOne / 4) + 'px',
    }">
                {{ checkNums[3] }}
            </a>
            <a :style="{
        'padding-top': Math.round(kHOne / 8) + 'px',
        'padding-right': Math.round(kHOne / 4) + 'px',
        'padding-bottom': Math.round(kHOne / 8) + 'px',
        'padding-left': Math.round(kHOne / 4) + 'px',
    }">
                {{ checkNums[4] }}
            </a>
        </div>
    </div>
</template>

<script>
import { getCheckProductsCount } from '@/api/fatherHome.js';

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
            checkNums: null,
        }
    },
    beforeMount() {
        this.kWOne = Math.round(this.screenWidth * 0.155)
        this.kHOne = Math.round(this.screenHeight * 0.06)
        this.kFOne = Math.round(this.screenWidth / 90)
    },
    mounted() {
        // 页面大小改变时触发
        window.addEventListener('resize', this.getScreenHeight, false);
        // 页面大小改变时触发
        window.addEventListener('resize', this.getScreenWidth, false);
        window.addEventListener("resize", this.screenAdapter, false);

        // 鼠标移动时触发
        //window.addEventListener('mousemove',this.getHeight, false);
        this.resizeScreen();
        // 获取后端接口数据
        this.getData();
        // 执行数据局部刷新定时器
        this.getDataTimer();
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
        window.removeEventListener("resize", this.screenAdapter, false);
    },
    methods: {
        resizeScreen() {
            this.koiTime = setInterval(() => {
                this.getScreenHeight();
                this.getScreenWidth();
                // this.screenAdapter();
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
            this.kHOne = Math.round(this.screenHeight * 0.06);
            //console.log("高度->"+this.screenHeight +"-"+ this.kHOne);
        },
        // 字体大小根据宽度自适应
        getScreenWidth() {
            this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            this.kWOne = Math.round(this.screenWidth * 0.155);
            this.kFOne = Math.round(this.screenWidth / 90);
            //console.log("宽度->"+this.screenWidth);
        },
        getData() {
            getCheckProductsCount().then(res => {
                const str = String(res);
                let newStr = str.length >= 5 ? str : new Array(5 - str.length + 1).join('0') + str;
                this.checkNums = newStr
            })
        },
        // 定时器
        getDataTimer() {
            this.koiTimer = setInterval(() => {
                // 执行刷新数据的方法
                this.getData();
                // console.log("Hello World")
            }, 60000 * 10)
        },
    },
}
</script>

<style lang="scss" scoped>
.left-chart1 {
    display: flex;
    flex-direction: column;

    .left-chart1-title {
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

    .left-chart1-chart {
        flex: 3;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background: #041135;

        a {
            color: #7de3f9;
            font-weight: 900;
            background-image: url("../../../assets/imgs/fang.png");
            background-size: 100% 100%;
            background-position: center;
            display: flex;
            justify-content: center;
            align-items: center;
        }

    }
}
</style>
