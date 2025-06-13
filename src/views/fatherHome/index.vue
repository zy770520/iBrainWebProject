<!--  -->
<template>
    <div id="index">
        <!--  DataV-Loading加载动画 -->
        <dv-loading v-if="loading">Loading...</dv-loading>
        <!-- 总体布局-start -->
        <div v-else class="ibrain-body">
            <!-- 第一部分-头部-start -->
            <div class="header">
                <!-- 时间 -->
                <div class="localTime colorText"
                    :style="{ 'font-size': Math.round(this.screenWidth / 100) + 'px', 'letter-spacing': 2 + 'px' }">{{
            dateYear
        }}
                    {{ dateWeek }} {{ dateDay }}</div>
                <!-- 装饰10 -->
                <dv-decoration-10 class="dv-dec-10-left" />
                <!-- 装饰8 -->
                <dv-decoration-8 class="dv-dec-8-left" :color="decorationColor" />
                <!-- 标题 -->
                <span class="title font-bold colorText"
                    :style="{ 'font-size': Math.round(this.screenWidth / 60) + 'px' }">大模型视觉检测系统平台</span>
                <!-- 装饰8 -->
                <dv-decoration-8 class="dv-dec-8-right" :reverse="true" :color="decorationColor" />
                <!-- 装饰10 -->
                <dv-decoration-10 class="dv-dec-10-right" />
            </div>
            <!-- 第一部分-头部-end -->

            <!-- Element-UI Layout布局 -->
            <div class="layoutHome">
                <el-row>
                    <el-col :span="5">
                        <div :style="{ height: kHOne + 'px', padding: Math.round(kHTwo / 64) + 'px' }">
                            <leftchart1></leftchart1>
                        </div>
                        <div
                            :style="{ height: kHTwo + 'px', padding: Math.round(kHTwo / 64) + 'px', 'paddingTop': 0 + 'px' }">
                            <leftchart2></leftchart2>
                        </div>
                    </el-col>

                    <el-col :span="14">
                        <div
                            :style="{ height: kHThree + 'px', padding: Math.round(kHTwo / 64) + 'px', 'paddingLeft': 0 + 'px', 'paddingTop': Math.round(kHTwo / 110) + 'px' }">
                            <centerchart></centerchart>
                        </div>
                    </el-col>

                    <el-col :span="5">
                        <div
                            :style="{ height: kHFour + 'px', padding: Math.round(kHTwo / 64) + 'px', 'paddingLeft': 0 + 'px', }">
                            <rightchart1></rightchart1>
                        </div>
                        <div
                            :style="{ height: kHFive + 'px', padding: Math.round(kHTwo / 64) + 'px', 'paddingLeft': 0 + 'px', 'paddingTop': 0 + 'px', }">
                            <rightchart2></rightchart2>
                        </div>
                        <div
                            :style="{ height: kHSix + 'px', padding: Math.round(kHTwo / 64) + 'px', 'paddingLeft': 0 + 'px', 'paddingTop': 0 + 'px' }">
                            <rightchart3></rightchart3>
                        </div>
                        <div
                            :style="{ height: kHSeven + 'px', padding: Math.round(kHTwo / 64) + 'px', 'paddingLeft': 0 + 'px', 'paddingTop': 0 + 'px', 'paddingBottom': 0 + 'px', }">
                            <rightchart4></rightchart4>
                        </div>
                    </el-col>

                </el-row>
            </div>
            <!-- 总体布局end -->
        </div>
    </div>
</template>

<script>
import { formatTime } from '@/utils/validate.js';
import leftchart1 from "./components/leftchart1.vue";
import leftchart2 from "./components/leftchart2.vue";
import centerchart from "./components/centerchart.vue";
import rightchart1 from "./components/rightchart1.vue";
import rightchart2 from "./components/rightchart2.vue";
import rightchart3 from "./components/rightchart3.vue";
import rightchart4 from "./components/rightchart4.vue";

export default {
    name: 'index',
    components: {
        leftchart1,
        leftchart2,
        centerchart,
        rightchart1,
        rightchart2,
        rightchart3,
        rightchart4,
    },
    data() {
        return {
            loading: true,
            // 装饰8颜色
            decorationColor: ['#568aea', '#000000'],
            // 时间
            timer: null,
            // 适应浏览器
            koiTime: null,
            // 定时跳转页面
            koiTimer: null,
            dateDay: null,
            dateYear: null,
            dateWeek: null,
            weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            // 获取浏览器可视区域高度（包含滚动条）、
            // 获取浏览器可视区域高度（不包含工具栏高度）、
            // 获取body的实际高度  (三个都是相同，兼容性不同的浏览器而设置的)
            screenHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            screenWidth: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            kHOne: null,//200
            kHTwo: null,//500
            kHThree: null,//300
            kHFour: null,//500
            kHFive: null,//450
            kHSix: null,//300
            kHSeven: null,//400
            kHEight: null,//400
        }
    },
    created() {

    },
    mounted() {
        // 页面大小改变时触发
        window.addEventListener('resize', this.getScreenHeight, false);
        // 页面大小改变时触发
        window.addEventListener('resize', this.getScreenWidth, false);
        // 鼠标移动时触发
        //window.addEventListener('mousemove',this.getHeight, false);
        this.timeInterval();
        this.cancelLoading();
        this.resizeScreen();
        // 执行数据局部刷新定时器
        this.getData()
    },
    beforeDestroy() {
        clearInterval(this.timer)
        this.timer = null;
        clearInterval(this.koiTime);
        this.koiTime = null;
        clearInterval(this.koiTimer);
        this.koiTimer = null;
        // 页面大小改变时触发
        window.removeEventListener('resize', this.getScreenHeight, false);
        // 页面大小改变时触发
        window.removeEventListener('resize', this.getScreenWidth, false);
    },
    watch: {
        screenWidth: function (news, old) {
            if (news <= 1200) {
                this.$notify({
                    title: '浏览器高度提示',
                    dangerouslyUseHTMLString: true,
                    message: '<strong style= "color: teal">浏览器宽度<1200px将不再进行自适应</strong>',
                    type: 'warning',
                    position: 'bottom-right',
                    duration: 2000
                });
            }
        },
        screenHeight: function (news, old) {
            if (news <= 700) {
                this.$notify({
                    title: '浏览器宽度提示',
                    dangerouslyUseHTMLString: true,
                    message: '<strong style= "color: teal">浏览器高度<700px将不再进行自适应</strong>',
                    type: 'warning',
                    position: 'bottom-right',
                    duration: 2000
                });
            }
        }
    },
    methods: {
        timeInterval() {
            this.timer = setInterval(() => {
                this.dateDay = formatTime(new Date(), 'HH: mm: ss')
                this.dateYear = formatTime(new Date(), 'yyyy/MM/dd')
                this.dateWeek = this.weekday[new Date().getDay()]
            }, 1000)
        },
        cancelLoading() {
            setTimeout(() => {
                this.loading = false
            }, 500)
        },
        resizeScreen() {
            this.koiTime = setInterval(() => {
                this.getScreenHeight();
                this.getScreenWidth();
            }, 200)
        },
        // 获取浏览器高度进行自适应
        getScreenHeight() {
            this.screenHeight = window.innerHeight || document.documentElement.innerHeight || document.body.clientHeight;
            // 四舍五入取整数
            this.kHOne = Math.round(this.screenHeight * 0.12);
            this.kHTwo = Math.round(this.screenHeight * 0.815);
            this.kHThree = Math.round(this.screenHeight * 0.95);
            this.kHFour = Math.round(this.screenHeight * 0.12);
            this.kHFive = Math.round(this.screenHeight * 0.271);
            this.kHSix = Math.round(this.screenHeight * 0.271);
            this.kHSeven = Math.round(this.screenHeight * 0.271);
        },
        // 字体大小根据宽度自适应
        getScreenWidth() {
            this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        },

        getData() {




        },
        // 定时器
        getDataTimer() {
            this.koiTimer = setInterval(() => {
                // 执行刷新数据的方法
                this.getData();
            }, 5000)
        },
    }
}
</script>

<style lang="scss" scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    list-style-type: none;
    outline: none;
}

html {
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
}

// 让所有斜体不倾斜
em,
i {
    font-style: normal;
}

// 去掉列表前面的小点
li {
    list-style: none;
}

// 图片没有边框 去掉图片dice的空白缝隙
img {
    border: 0; //ie6
    vertical-align: middle;
}

//button 按钮变小手
button {
    cursor: pointer
}

// 取消a标签连接下划线
a {
    color: #343440;
    text-decoration: none;
}

a:hover {
    color: #343440;
}

//浮动
.float-r {
    float: right;
}

//浮动
.float-l {
    float: left;
}

// 字体加粗
.font-bold {
    font-weight: bold;
}

//文章一行显示，多余省略号显示
.title-item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

// 方块背景颜色
.bg-color-black {
    background-color: rgba(19, 25, 47, 0.6);
}

// 常用颜色
.colorBlack {
    color: black !important;
}

.colorGrass {
    color: #32cea0;
}

.colorRed {
    color: red;
}

.colorYellow {
    color: yellow;
}

.colorLightBlue {
    color: turquoise;
}


.colorText {
    // height: 32px;
    font-weight: 900;
    letter-spacing: 2px;
    color: #00CFFF;
    // background: linear-gradient(92deg, #0072ff, #00eaff 48.8525390625%, #01aaff);
    // background-clip: text;
    // color: transparent;
}

.colorBlue {
    color: blue;
}

.colorTomato {
    color: tomato;
}

.colorDeepskyblue {
    color: deepskyblue !important;

    &:hover {
        color: lightsalmon !important;
    }
}

.colorDarkturquoise {
    color: darkturquoise;
}

.colorLightsalmon {
    color: lightsalmon;
}

.colorGold {
    color: gold;
}

.colorLightsteelblue {
    color: lightsteelblue;
}

.colorSienna {
    color: sienna;
}

.colorDarkorchid {
    color: darkorchid;
}

.colorLightpink {
    color: lightpink;
}

.colorHotpink {
    color: hotpink;
}

// 设置默认背景图片
#index {
    width: 100%;
    height: 100%;
    // 图片缩放自适应
    background: url("../../assets/imgs/screenBg.png") center center no-repeat;
    background-size: 100% 100%;
    position: fixed;
    overflow: hidden;

    // 总体布局
    .ibrain-body {

        // 头部布局
        .header {

            // DataV边框10宽度左侧和高度设置
            .dv-dec-10-left {
                width: 25%;
                margin-top: 0.5%;
                margin-left: 0.2%;
                height: 8px;
                float: left;
            }

            // DataV边框10宽度右侧和高度设置
            .dv-dec-10-right {
                width: 25%;
                margin-top: 0.5%;
                margin-left: 0.2%;
                height: 8px;
                float: right;
                // 边框翻转
                transform: rotateY(180deg);
            }

            // DataV边框8左侧宽度和高度设置
            .dv-dec-8-left {
                width: 18%;
                height: 6%;
                margin-top: 0.7%;
                position: absolute;
                left: 23%;
            }

            // DataV边框8宽度右侧和高度设置
            .dv-dec-8-right {
                width: 18%;
                height: 6%;
                margin-top: 0.7%;
                position: absolute;
                right: 20.5%;
            }

            // 标题自定义修改
            .title {
                position: absolute;
                left: 41.75%;
                margin-top: 0.8%;
            }

            // 当前时间css
            .localTime {
                position: absolute;
                right: 1%;
                top: 2%;
            }

            // 首页字体css
            .homePage {
                position: absolute;
                left: 1%;
                top: 2.2%;
            }

        }

        .layoutHome {
            position: absolute;
            min-width: 1000px;
            min-height: 600px;
            top: 5.5%;
            width: 100%;
            height: 100%;

            .dv-border-box-12 {
                // display: none;
            }
        }
    }
}
</style>
