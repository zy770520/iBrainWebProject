<template>
    <div
        :style="{ padding: Math.round(kHTwo / 50) + 'px', 'paddingLeft': 0 + 'px', 'paddingTop': 0 + 'px', 'paddingRight': 0 + 'px' }">
        <div class="center-chart2" :style="{
            'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px',
            'padding-top': Math.round(kHOne / 11) + 'px',
            'padding-right': Math.round(kHOne / 6.5) + 'px',
            'padding-bottom': 0 + 'px',
            'padding-left': Math.round(kHOne / 6.5) + 'px',
        }">
            <!-- <i class="el-icon-circle-close delete-btn" @click="$emit('delete')" v-if="dialogVisible"></i> -->
            <div class="center-chart2-content-title">
                <dv-decoration-11 dur="0.5"
                    :style="{ width: Math.round(kHOne / 2) + 'px', height: Math.round(kHOne / 8) + 'px', 'font-size': Math.round(kHOne / 26) + 'px' }">功能导航</dv-decoration-11>
            </div>
            <div class="center-chart2-content-center">
                <div class="center-chart2-content-center1">
                    <router-link :style="{
            'font-size': Math.round(kHOne / 28) + 'px',
            'padding-top': Math.round(kHOne / 22) + 'px',
            'padding-right': Math.round(kHOne / 9) + 'px',
            'padding-bottom': Math.round(kHOne / 12) + 'px',
            'padding-left': Math.round(kHOne / 14.5) + 'px',
            'margin-bottom': Math.round(kHOne / 4.5) + 'px',
            'margin-top': Math.round(kHOne / 14) + 'px'
        }" :to="{ name: 'console', query: { device_name: $route.query.device_name } }">
                        <span>实时监控</span>
                        <dv-decoration-10 :style="{
            width: Math.round(kHOne / 2.5) + 'px',
            height: Math.round(kHOne / 133.4) + 'px',
            top: Math.round(kHOne / 5.8) + 'px',
            left: Math.round(kHOne / 3.39) + 'px'
        }" />
                    </router-link>

                    <router-link :style="{
            'font-size': Math.round(kHOne / 28) + 'px',
            'padding-top': Math.round(kHOne / 12) + 'px',
            'padding-right': Math.round(kHOne / 9) + 'px',
            'padding-bottom': Math.round(kHOne / 22) + 'px',
            'padding-left': Math.round(kHOne / 14.5) + 'px',
        }" to="/information/ProductInformation">
                        基础信息
                        <dv-decoration-10 :style="{
            width: Math.round(kHOne / 2.5) + 'px',
            height: Math.round(kHOne / 133.4) + 'px',
            bottom: Math.round(kHOne / 5.8) + 'px',
            left: Math.round(kHOne / 3.39) + 'px'
        }" />
                    </router-link>
                </div>
                <div class="center-chart2-content-center2" :style="{ 'margin-top': Math.round(kHOne / 4.56) + 'px', }">
                    <dv-decoration-9 :dur="2.5"
                        :style="{ width: Math.round(kHOne / 2.5) + 'px', height: Math.round(kHOne / 2.5) + 'px' }">
                        <img src="../../../assets/imgs/robotmsg.png"
                            :style="{ width: Math.round(kHOne / 10) + 'px', height: Math.round(kHOne / 10) + 'px' }">
                    </dv-decoration-9>
                    <a :style="{ width: Math.round(kHOne / 2.5) + 'px', height: Math.round(kHOne / 4) + 'px' }">
                        <span :style="{ 'font-size': Math.round(kHOne / 28) + 'px' }">{{ safeDay }}天</span>
                        <span :style="{ 'font-size': Math.round(kHOne / 28) + 'px' }">已安全运行</span>
                    </a>
                </div>
                <div class="center-chart2-content-center3">
                    <router-link :style="{
            'font-size': Math.round(kHOne / 28) + 'px',
            'padding-top': Math.round(kHOne / 22) + 'px',
            'padding-right': Math.round(kHOne / 14.5) + 'px',
            'padding-bottom': Math.round(kHOne / 12) + 'px',
            'padding-left': Math.round(kHOne / 9) + 'px',
            'margin-bottom': Math.round(kHOne / 4.5) + 'px',
            'margin-top': Math.round(kHOne / 14) + 'px'
        }" to="/information/ProductInformation">
                        设备信息
                        <dv-decoration-10 :style="{
            width: Math.round(kHOne / 2.5) + 'px',
            height: Math.round(kHOne / 133.4) + 'px',
            top: Math.round(kHOne / 5.8) + 'px',
            right: Math.round(kHOne / 3.39) + 'px'
        }" />
                    </router-link>
                    <router-link :style="{
            'font-size': Math.round(kHOne / 28) + 'px',
            'padding-top': Math.round(kHOne / 12) + 'px',
            'padding-right': Math.round(kHOne / 14.5) + 'px',
            'padding-bottom': Math.round(kHOne / 22) + 'px',
            'padding-left': Math.round(kHOne / 9) + 'px',
        }" to="/information/ProductInformation">
                        系统设置
                        <dv-decoration-10 :style="{
            width: Math.round(kHOne / 2.5) + 'px',
            height: Math.round(kHOne / 133.4) + 'px',
            bottom: Math.round(kHOne / 5.8) + 'px',
            right: Math.round(kHOne / 3.39) + 'px'
        }" />
                    </router-link>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import { getSafetyDays } from '@/api/home.js';
import { removeEmptyFields } from "../../../utils/index";
export default {
    props: {
        kHFour: {
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
            safeDay: null
        }
    },
    beforeMount() {
        this.kWOne = Math.round(this.screenWidth * 0.4)
        this.kHOne = Math.round(this.screenHeight * 0.4)
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
            this.kHOne = Math.round(this.screenHeight * 0.4);
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
            getSafetyDays(removeEmptyFields({ device_name: device_name })).then(res => {
                this.safeDay = res
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
a {
    cursor: pointer;
    text-decoration: none;
}

.router-link-active {
    text-decoration: none;
}

.center-chart2 {
    background-image: url("../../../assets/imgs/robotbag.png");
    background-size: 100% 100%;
    background-position: center;
    display: flex;
    flex-direction: column;
    position: relative;

    .delete-btn {
        color: #FF0000;
        cursor: pointer;
        position: absolute;
        right: 15px;
        top: 25px;
        width: 20px;
        height: 20px;
        font-size: 20px;
    }

    .center-chart2-content-title {
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

    .center-chart2-content-center {
        display: flex;
        flex-direction: row;
        justify-content: space-around;

        .center-chart2-content-center1 {

            a {

                display: flex;
                flex-direction: column;
                color: #B6DFFF;
                font-weight: 500;
                position: relative;

                &:nth-child(1) {
                    background-image: url("../../../assets/imgs/robot1.png");
                    background-size: 100% 100%;
                    background-position: center;
                }

                &:nth-child(2) {
                    background-image: url("../../../assets/imgs/robot2.png");
                    background-size: 100% 100%;
                    background-position: center;
                }

                .dv-decoration-10 {
                    position: absolute;
                }
            }
        }

        .center-chart2-content-center2 {
            a {
                background-image: url("../../../assets/imgs/robotbootom.png");
                background-size: 100% 100%;
                background-position: center;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: #B6DFFF;
                font-weight: 900;

                span {
                    flex: 2;
                    display: flex;
                    justify-content: center;

                    &:nth-child(1) {
                        align-items: flex-end;
                    }

                    &:nth-child(2) {
                        align-items: center;
                    }
                }
            }
        }

        .center-chart2-content-center3 {
            a {

                display: flex;
                flex-direction: column;
                color: #B6DFFF;
                font-weight: 500;
                position: relative;

                &:nth-child(1) {
                    background-image: url("../../../assets/imgs/robot3.png");
                    background-size: 100% 100%;
                    background-position: center;
                }

                &:nth-child(2) {
                    background-image: url("../../../assets/imgs/robot4.png");
                    background-size: 100% 100%;
                    background-position: center;
                }

                .dv-decoration-10 {
                    position: absolute;
                }
            }
        }
    }


}
</style>
