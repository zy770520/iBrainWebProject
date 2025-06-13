<template>
    <div :style="{ padding: Math.round(kHTwo / 50) + 'px', 'paddingLeft': 0 + 'px', 'paddingRight': 0 + 'px' }">
        <div class="center-chart1" :style="{
        'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px',
    }">
            <i class="el-icon-circle-close delete-btn" @click="$emit('delete')" v-if="dialogVisible"></i>
            <div class="center-chart1-content" v-for="(item, index) in robotData" :key="index">
                <a :style="{ 'font-size': kFOne + 'px' }">{{ item.date }}</a>
                <a :style="{
        'font-size': kTwo + 'px',
        'color': item.status == 'Normal' ? '#8DD081' : item.status == 'Repair' ? '#D01E0D' : '#DB9B10'
    }">{{ item.status == 'Normal' ? '启用' : item.status == 'Repair' ? '维修' : '空闲' }}</a>
                <dv-percent-pond :key="key" :config="{
        value: item.percent,
        colors: item.status == 'Normal' ? ['#2178FC', '#8DD081'] : item.status == 'Repair' ? ['#2178FC', '#FF0000'] : ['#2178FC', '#DB9B10'],
    }" class="hidden-text"
                    :style="{ 'minWidth': kEWOne + 'px', 'minHeight': kEHOne + 'px', 'margin-top': Math.round(kEHOne / 2) + 'px' }" />
            </div>
        </div>
    </div>
</template>

<script>
import { getDailyStatus } from '@/api/home.js';
import { removeEmptyFields } from "../../../utils/index";
export default {
    props: {
        kHThree: {
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
            kTwo: null,
            // 定时器监控
            koiTime: null,
            // 局部刷新定时器 
            koiTimer: null,
            kEWOne: null,
            kEHOne: null,
            robotData: null,
            // robotData: [
            //     {
            //         date: '6/11',
            //         status: 'start',
            //         percent: 20
            //     },
            //     {
            //         date: '6/12',
            //         status: 'end',
            //         percent: 0
            //     },
            //     {
            //         date: '6/13',
            //         status: 'start',
            //         percent: 60
            //     },
            //     {
            //         date: '6/14',
            //         status: 'free',
            //         percent: 0
            //     },
            //     {
            //         date: '6/15',
            //         status: 'start',
            //         percent: 56
            //     },
            //     {
            //         date: '6/16',
            //         status: 'free',
            //         percent: 0
            //     },
            //     {
            //         date: '6/17',
            //         status: 'start',
            //         percent: 37
            //     },
            //     {
            //         date: '6/18',
            //         status: 'start',
            //         percent: 18
            //     },
            //     {
            //         date: '6/19',
            //         status: 'end',
            //         percent: 0
            //     },
            // ]
        }
    },
    beforeMount() {
        this.kWOne = Math.round(this.screenWidth * 0.4)
        this.kHOne = Math.round(this.screenHeight * 0.16)
        this.kFOne = Math.round(this.screenWidth / 80)
        this.kTwo = Math.round(this.screenWidth / 100)
        this.kEWOne = Math.round(this.screenHeight * 0.06);
        this.kEHOne = Math.round(this.screenHeight * 0.025);
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
            this.kHOne = Math.round(this.screenHeight * 0.16);
            this.kEWOne = Math.round(this.screenHeight * 0.06);
            this.kEHOne = Math.round(this.screenHeight * 0.025);
        },
        // 字体大小根据宽度自适应
        getScreenWidth() {
            this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            this.kWOne = Math.round(this.screenWidth * 0.4);
            this.kFOne = Math.round(this.screenWidth / 80);
            this.kTwo = Math.round(this.screenWidth / 100)
            //console.log("宽度->"+this.screenWidth);
        },
        getData() {
            let device_name = this.$route.query.device_name
            getDailyStatus(removeEmptyFields({ device_name: device_name })).then(res => {
                this.robotData = res
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

<style lang="scss">
.center-chart1 {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    background: #041135;
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

    .center-chart1-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        a {
            &:nth-child(1) {
                color: #ffffff;
                font-weight: 900;
            }
        }

        .hidden-text {

            text {
                display: none;
            }
        }
    }


}
</style>
