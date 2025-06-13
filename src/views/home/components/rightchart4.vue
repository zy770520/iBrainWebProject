<template>
    <div class="right-chart4">
        <div class="right-chart4-title" :style="{ 'font-size': kFOne + 'px' }">
            <a class="colorText">
                <dv-decoration-12 :scanDur="0.5" :key="key"
                    :style="{ width: Math.round(kHOne / 10) + 'px', height: Math.round(kHOne / 10) + 'px', 'margin-right': Math.round(kHOne / 22.8) + 'px' }" />
                最近出料分档数据
            </a>
        </div>
        <div class="right-chart4-chart" :style="{
            'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px', 'margin-top': Math.round(kHOne / 40) + 'px',
            'padding-left': Math.round(kHOne / 10.4) + 'px',
        }">
            <div v-for="(item, index) in pitchData" :key="index"
                :style="{ 'margin-right': Math.round(kHOne / 22.8) + 'px' }">
                <dv-water-level-pond :config="{ data: [item.count] }" :style="{
            'width': Math.round(kHOne / 3.8) + 'px', 'height': Math.round(kHOne / 1.9) + 'px',
        }" />
                {{ item.name }}
            </div>
        </div>
    </div>
</template>

<script>
import { getDischargePort } from '@/api/home.js';
import { removeEmptyFields } from "../../../utils/index";

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
            lineTextStyle: 14,
            key: 0,
            pitchData: null
        }
    },
    beforeMount() {
        this.kWOne = Math.round(this.screenWidth * 0.2)
        this.kHOne = Math.round(this.screenHeight * 0.2645)
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
            this.kHOne = Math.round(this.screenHeight * 0.2645);
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
            let device_name = this.$route.query.device_name
            getDischargePort(removeEmptyFields({ device_name: device_name })).then(res => {
                this.pitchData = res
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
.right-chart4 {
    display: flex;
    flex-direction: column;

    .right-chart4-title {
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

    .right-chart4-chart {
        flex: 3;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        background: #041135;
        color: #ffffff;

        .dv-water-pond-level {
            svg {
                text {
                    // font-size: 12px;
                }
            }
        }
    }
}
</style>
