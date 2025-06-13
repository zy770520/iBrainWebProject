<template>
    <div class="center-chart" :style="{
        'minHeight': kHOne + 'px',
        'padding-top': Math.round(kHOne / 13.45) + 'px',
        'padding-right': Math.round(kHOne / 168.3) + 'px',
        'padding-bottom': 0 + 'px',
        'padding-left': Math.round(kHOne / 19.2) + 'px',
        // 'padding-left': Math.round(kHOne / 15.2) + 'px',
    }">
        <div class="center-chart-content-title">
            <dv-decoration-11 dur="0.5" :key="key"
                :style="{ 'width': Math.round(kHOne / 4.7) + 'px', 'height': Math.round(kHOne / 18.8) + 'px', 'font-size': Math.round(kHOne / 62) + 'px', }">设备集中监控</dv-decoration-11>
        </div>
        <div class="center-chart-content-center" :style="{
        'width': 100 + '%',
        'height': Math.round(kHOne / 1.16) + 'px',
        'maxHeight': Math.round(kHOne / 1.16) + 'px',
        // 'gap': 10 + 'px',
        'padding-top': Math.round(kHOne / 18.36) + 'px',
        'padding-right': 0 + 'px',
        // 'padding-bottom': Math.round(kHOne / 20.2) + 'px',
        'padding-left': 0 + 'px',
    }">
            <div v-for="(item, index) in insterData" :key="index" :style="{
        // 'minWidth': Math.round(kHOne / 4.16) + 'px',
        'padding-right': Math.round(kHOne / 15.5) + 'px',
        'font-size': Math.round(kHOne / 72.14) + 'px',
        'margin-bottom': Math.round(kHOne / 50.5) + 'px',
    }">

                <div class="center-chart-content-center-child" :key="index" :style="{
        'padding-top': Math.round(kHOne / 84.2) + 'px',
        'padding-right': Math.round(kHOne / 40.4) + 'px',
        'padding-bottom': Math.round(kHOne / 59.4) + 'px',
        'padding-left': Math.round(kHOne / 42.1) + 'px',
    }" @click="intoHomeChild(item.name)">
                    <img src="../../../assets/imgs/inster.png" :style="{
        'maxWidth': Math.round(kHOne / 6.08) + 'px',
        'maxHeight': Math.round(kHOne / 7.71) + 'px',
        'margin-bottom': Math.round(kHOne / 77.7) + 'px'
    }" />
                    <a :title="item.id" :style="{
        'minWidth': Math.round(kHOne / 8.07) + 'px', 'maxWidth': Math.round(kHOne / 8.07) + 'px',
    }">设备编号：{{ item.number }}</a>
                    <a
                        :style="{ 'color': item.status == 'Running' ? '#0fae25' : item.status == 'Fault' ? '#c7171a' : '#e6e63b' }">运行状态：{{
        item.status == 'Running' ? '运行中' : item.status == 'Fault' ? '故障' : '空闲'
    }}</a>
                    <a :title="item.product ? item.product.product_name : ''" :style="{
        'minWidth': Math.round(kHOne / 8.07) + 'px', 'maxWidth': Math.round(kHOne / 8.07) + 'px',
    }">检测产品：{{ item.product ? item.product.product_name : '暂无产品' }}</a>
                    <a style="color: aqua;">更多>></a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getDevicesMonitor } from '@/api/fatherHome.js';

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
            insterData: null,
        }
    },
    beforeMount() {
        this.kWOne = Math.round(this.screenWidth * 0.4)
        this.kHOne = Math.round(this.screenHeight * 0.935)
        this.kFOne = Math.round(this.screenWidth / 80)
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
            var _this = this
            _this.$nextTick(() => {
                _this.key++
            });
        },
        // 获取浏览器高度进行自适应
        getScreenHeight() {
            this.screenHeight = window.innerHeight || document.documentElement.innerHeight || document.body.clientHeight;
            // 四舍五入取整数
            this.kHOne = Math.round(this.screenHeight * 0.935);
        },
        // 字体大小根据宽度自适应
        getScreenWidth() {
            this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            this.kWOne = Math.round(this.screenWidth * 0.4);
            this.kFOne = Math.round(this.screenWidth / 80);
            //console.log("宽度->"+this.screenWidth);
        },
        getData() {
            getDevicesMonitor().then(res => {
                res.push(

                    {
                        name: "good",
                        number: 'LB_02',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_03',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_04',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_05',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_06',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_07',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_08',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_09',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_10',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_11',
                        status: 'Idle',
                        product: null
                    },
                    {
                        name: "good",
                        number: 'LB_12',
                        status: 'Idle',
                        product: null
                    },
                )
                // let arr = [
                //     {
                //         name: res[0].name,
                //         number: res[0].number,
                //         status: res[0].status,
                //         product: res[0].product
                //     },
                //     {
                //         name: res.length > 1 ? res[1].name : res[0].name,
                //         number: res.length > 1 ? res[1].number : res[0].number,
                //         status: res.length > 1 ? res[1].status : res[0].status,
                //         product: res.length > 1 ? res[1].product : res[0].product,
                //     },

                // ]
                this.insterData = res
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
        intoHomeChild(name) {
            this.$router.push({ path: '/home', query: { device_name: name } })
        }
    },
}
</script>

<style lang="scss">
a {
    cursor: pointer;
    text-decoration: none;
}

.router-link-active {
    text-decoration: none;
}

.center-chart {
    background-image: url("../../../assets/imgs/robotbag.png");
    background-size: 100% 100%;
    background-position: center;
    display: flex;
    flex-direction: column;

    .center-chart-content-title {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        .dv-decoration-11 {
            color: #74E6F3;
            font-weight: 900;
            letter-spacing: 5px;
        }
    }

    .center-chart-content-center {
        // display: flex;
        // flex-direction: row;
        // flex-wrap: wrap;
        // justify-content: flex-start;
        overflow-y: auto;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(3, 1fr);
        cursor: pointer;

        .center-chart-content-center-child {

            background-image: url("../../../assets/imgs/instrument.png");
            background-size: 100% 100%;
            background-position: center;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            color: #ffffff;
            font-weight: 900;
            position: relative;

            a {
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;

                &:nth-child(5) {
                    position: absolute;
                    right: 2%;
                    bottom: 2%;
                }
            }

            &:hover {
                box-shadow: 0 0 20px rgb(15 112 242 / 50%);
            }
        }
    }


}
</style>
