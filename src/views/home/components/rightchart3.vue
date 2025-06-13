<template>
    <div :style="{ padding: Math.round(kHTwo / 50) + 'px', 'paddingTop': 0 + 'px', 'paddingBottom': 0 + 'px', }">
        <div class="right-chart3">
            <i class="el-icon-circle-close delete-btn" @click="$emit('delete')" v-if="dialogVisible"></i>
            <div class="right-chart3-title" :style="{ 'font-size': kFOne + 'px' }">
                <a class="colorText">
                    <dv-decoration-12 :scanDur="0.5" :key="key"
                        :style="{ width: Math.round(kHOne / 10) + 'px', height: Math.round(kHOne / 10) + 'px', 'margin-right': Math.round(kHOne / 22.8) + 'px' }" />
                    最近产品检测项目占比(不合格)
                </a>
            </div>
            <div class="right-chart3-chart" :style="{
        'minWidth': Math.round(kWOne - 10) + 'px', 'minHeight': kHOne + 'px', 'margin-top': Math.round(kHOne / 40) + 'px'
    }">
                <Chart :style="{
        'width': 100 + '%',
        'minHeight': Math.round(kWOne / 1.44) + 'px',
    }"></Chart>
                <!-- <div options="options" ref="refChart" id="bottomRightChart" :style="{
            'minWidth': Math.round(kHOne * 1.44) + 'px',
            'minHeight': Math.round(kWOne / 1.44) + 'px',
        }"></div> -->
            </div>
        </div>
    </div>

</template>

<script>
// import { getSignData } from "../../../api/ems/index";
import * as echarts from "echarts";
import Chart from './chart1.vue'

export default {
    props: {
        kHEight: {
            require: true,
        },
        kHTwo: {
            require: true,
        },
        dialogVisible: {
            require: true,
        },
    },
    components: { Chart },
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
        this.screenAdapter();
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
            // this.kHOne = Math.round(this.screenHeight * 0.2645);
            // this.lineTextStyle = Math.round(this.$refs.refChart.offsetWidth / 34);
            // let adapterOption = {
            //     series: [
            //         {
            //             label: {
            //                 normal: {
            //                     textStyle: {
            //                         fontSize: this.lineTextStyle,
            //                     }
            //                 }
            //             },
            //         }
            //     ]
            // }
            // var chartDom = document.getElementById('bottomRightChart');
            // var myChart = echarts.init(chartDom, 'dark');
            // myChart.setOption(adapterOption);
            // myChart.resize();
            // var _this = this
            // _this.$nextTick(() => {
            //     _this.key++
            // });
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
.right-chart3 {
    display: flex;
    flex-direction: column;
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

    .right-chart3-title {
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

    .right-chart3-chart {
        flex: 3;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        background: #041135;
    }
}
</style>
