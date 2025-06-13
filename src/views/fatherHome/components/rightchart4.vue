<template>
    <div class="right-chart4">
        <div class="right-chart4-title" :style="{ 'font-size': kFOne + 'px' }">
            <a class="colorText">
                主要检测产品检出缺陷排名
                <dv-decoration-3 :dur="0.5"
                    :style="{ width: Math.round(kHOne / 2.5) + 'px', height: Math.round(kHOne / 11.4) + 'px', 'margin-left': Math.round(kHOne / 22.8) + 'px' }" />
            </a>
        </div>
        <div class="right-chart4-chart" :style="{
            'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px', 'margin-top': Math.round(kHOne / 40) + 'px'
        }">
            <dv-scroll-board :config="config" :key="key"
                :style="{ 'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px', }" />
        </div>
    </div>
</template>

<script>
import { getDefectsRanking } from '@/api/fatherHome.js';

export default {
    props: {

    },
    watch: {
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
            config: {
                header: ['<span style="color:#7de3f9;font-weight:900;font-size: 12px;">缺陷名称</span>', '<span style="color:#7de3f9;font-weight:900;font-size: 12px;">缺陷数量</span>', '<span style="color:#7de3f9;font-weight:900;font-size: 12px;">排名</span>'],
                data: null,
                // [
                //     ['划痕', '5226', '1'],
                //     ['划痕', '5226', '2'],
                //     ['划痕', '5226', '3'],
                //     ['划痕', '5226', '4'],
                //     ['划痕', '5226', '5'],
                //     ['划痕', '5226', '6'],
                //     ['划痕', '5226', '7'],
                //     ['划痕', '5226', '8'],
                //     ['划痕', '5226', '9'],
                //     ['划痕', '5226', '10'],
                //     ['划痕', '5226', '11'],
                //     ['划痕', '5226', '12'],
                //     ['划痕', '5226', '13'],
                //     ['划痕', '5226', '14'],
                //     ['划痕', '5226', '15'],
                //     ['划痕', '5226', '16'],
                //     ['划痕', '5226', '17'],
                //     ['划痕', '5226', '18'],
                //     ['划痕', '5226', '19'],
                //     ['划痕', '5226', '20'],

                // ],

                rowNum: 4,
                headerBGC: '#1c3663',
                oddRowBGC: '#000E19',
                evenRowBGC: '#142749',
                align: ['center'],
                headerHeight: '40',
                hoverPause: true
            }
        }
    },
    beforeMount() {
        this.kWOne = Math.round(this.screenWidth * 0.155)
        this.kHOne = Math.round(this.screenHeight * 0.237)
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
            this.kHOne = Math.round(this.screenHeight * 0.237);
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
            getDefectsRanking().then(res => {
                let arr1 = res.map((item, index) => {
                    return [
                        item.defect_name,
                        item.defect_count.toString(),
                        (index + 1).toString()];
                });
                this.config.data = arr1
                this.config = { ...this.config }
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
        justify-content: center;
        align-items: center;
        background: #041135;


    }
}
</style>
