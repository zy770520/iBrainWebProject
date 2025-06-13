<template>
    <div class="right-chart3">
        <div class="right-chart3-title" :style="{ 'font-size': kFOne + 'px' }">
            <a class="colorText">
                主要检测产品缺陷类型占比
                <dv-decoration-1 :dur="4"
                    :style="{ width: Math.round(kHOne / 2.5) + 'px', height: Math.round(kHOne / 11.4) + 'px', 'margin-left': Math.round(kHOne / 22.8) + 'px' }" />
            </a>
        </div>
        <div class="right-chart3-chart" :style="{
            'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px', 'margin-top': Math.round(kHOne / 40) + 'px'
        }">
            <dv-capsule-chart :config="config" :key="key" :style="{ width: kWOne + 'px', height: kHOne + 'px' }" />
        </div>
    </div>
</template>

<script>
import { getDefectStatistics } from '@/api/fatherHome.js';

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
                showValue: true,
                unit: "个",
                data: null
            }
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
            getDefectStatistics().then(res => {
                let arr3 = [
                    {
                        name: '合格数量',
                        value: res.qualified_count
                    },
                    {
                        name: '不合格数量',
                        value: res.unqualified_count
                    },
                    {
                        name: '尺寸不合格',
                        value: res.size_unqualified_count
                    },
                    {
                        name: '厚度不合格',
                        value: res.thickness_unqualified_count
                    },
                    {
                        name: '外观不合格',
                        value: res.exterior_unqualified_count
                    },
                ]
                this.config.data = arr3
                this.config = { ...this.config }
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
.right-chart3 {
    display: flex;
    flex-direction: column;

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

        .dv-capsule-chart {
            padding: 22px;
            font-weight: 900;

            .label-column {
                text-align: left;
            }

            .capsule-container {
                .capsule-item {
                    height: 20px;
                    box-shadow: none;
                    background: #1F3570;
                    border-radius: 0px;

                    .capsule-item-column {
                        height: 20px;
                        border-radius: 0px;
                        background: linear-gradient(90deg, #1F78FF 0%, #DB9B10 100%);
                    }
                }

            }
        }
    }
}
</style>
