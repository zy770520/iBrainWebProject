<template>
    <div
        :style="{ padding: Math.round(kHTwo / 50) + 'px', 'paddingLeft': 0 + 'px', 'paddingTop': 0 + 'px', 'paddingBottom': 0 + 'px', 'paddingRight': 0 + 'px' }">
        <div class="center-chart3" :style="{
            'minWidth': kWOne + 'px',
        }">
            <i class="el-icon-circle-close delete-btn" @click="$emit('delete')" v-if="dialogVisible"></i>
            <div class="center-chart3-title" :style="{ 'font-size': kFOne + 'px' }">
                <a class="colorText">
                    历史数据分析视图
                    <dv-decoration-6 :key="key"
                        :style="{ width: Math.round(kHOne / 1.2) + 'px', height: Math.round(kHOne / 11.4) + 'px', 'margin-left': Math.round(kHOne / 22.8) + 'px' }" />
                </a>
            </div>
            <div class="center-chart3-content" :style="{
            'minWidth': kWOne + 'px', 'minHeight': Math.round(kHOne / 1.04) + 'px', 'margin-top': Math.round(kHOne / 40) + 'px', 'padding-top': Math.round(kHOne / 9.2) + 'px'
        }">
                <Echart :style="{
            'width': 100 + '%',
            'minHeight': Math.round(kHOne / 1.04) + 'px',
        }" :historyData="historyData"></Echart>
            </div>
        </div>
    </div>

</template>

<script>
// import { getSignData } from "../../../api/ems/index";
import Echart from './echart.vue'
export default {
    components: { Echart },
    props: {
        historyData: {
            type: Object,
            default() {
                return {}
            }
        },
        kHFive: {
            require: true,
        },
        kHTwo: {
            require: true,
        },
        dialogVisible: {
            require: true,
        },
    },
    data() {
        return {
            // 获取浏览器可视区域高度（包含滚动条）、 window.innerHeight
            // 获取浏览器可视区域高度（不包含工具栏高度）、document.documentElement.clientHeight
            // 获取body的实际高度  (三个都是相同，兼容性不同的浏览器而设置的) document.body.clientHeight
            screenHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            screenWidth: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
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
        }
    },
    beforeMount() {
        this.kWOne = Math.round(this.screenWidth * 0.4)
        this.kHOne = Math.round(this.screenHeight * 0.25)
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
        window.removeEventListener("resize", this.screenAdapter, false);
    },
    methods: {
        resizeScreen() {
            this.koiTime = setInterval(() => {
                this.getScreenHeight();
                this.getScreenWidth();
                // this.screenAdapter();
            }, 2000)
        },
        screenAdapter() {
            // this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            // this.kWOne = Math.round(this.screenWidth * 0.4);
            // this.kFOne = Math.round(this.screenWidth / 90);
            // this.screenHeight = window.innerHeight || document.documentElement.innerHeight || document.body.clientHeight;
            // this.kHOne = Math.round(this.screenHeight * 0.25);
        },
        // 获取浏览器高度进行自适应
        getScreenHeight() {
            this.screenHeight = window.innerHeight || document.documentElement.innerHeight || document.body.clientHeight;
            // 四舍五入取整数
            this.kHOne = Math.round(this.screenHeight * 0.25);
        },
        // 字体大小根据宽度自适应
        getScreenWidth() {
            this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            this.kWOne = Math.round(this.screenWidth * 0.4);
            this.kFOne = Math.round(this.screenWidth / 90);
            //console.log("宽度->"+this.screenWidth);
        },
        getData() {
            // getSignData().then(res => {
            //   //console.log("ALLDATA->",JSON.stringify(res.data)) 
            //   const { config } = this;
            //   // 将数据赋值给DataV的胶囊柱图
            //   this.config.data = res.data;
            //   this.config = { ...this.config }
            // })
            // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
            //console.log("ALLDATA->",JSON.stringify(res.data))
            //console.log("ALLDATA->",JSON.stringify(this.allData))
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

<style lang="scss">
.center-chart3 {
    position: relative;

    .delete-btn {
        color: #FF0000;
        cursor: pointer;
        position: absolute;
        right: 15px;
        top: 5px;
        width: 20px;
        height: 20px;
        font-size: 20px;
    }

    .center-chart3-title {
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

    .center-chart3-content {
        flex: 3;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #041135;
    }


}
</style>
