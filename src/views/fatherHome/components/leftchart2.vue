<template>
    <div class="left-chart2">
        <div class="left-chart2-title" :style="{ 'font-size': kFOne + 'px' }">
            <a class="colorText">
                设备信息
                <dv-decoration-3 :dur="0.5"
                    :style="{ width: Math.round(kHOne / 4.8) + 'px', height: Math.round(kHOne / 28.2) + 'px', 'margin-left': Math.round(kHOne / 56.5) + 'px' }" />
            </a>
        </div>
        <div class="left-chart2-chart" :style="{
            'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px', 'margin-top': Math.round(kHOne / 69) + 'px'
        }">
            <dv-scroll-board :config="config" :key="key"
                :style="{ 'minWidth': kWOne + 'px', 'minHeight': kHOne + 'px', }" />
        </div>
    </div>
</template>

<script>
import { getAllDevice } from '@/api/fatherHome.js';
export default {
    props: {
        // productData: {
        //     type: Array,
        //     default() {
        //         return {}
        //     }
        // }
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
                header: ['<span style="color:#7de3f9;font-weight:900;font-size: 12px;">设备编号</span>', '<span style="color:#7de3f9;font-weight:900;font-size: 12px;">使用率</span>', '<span style="color:#7de3f9;font-weight:900;font-size: 12px;">设备状态</span>', '<span style="color:#7de3f9;font-weight:900;font-size: 12px;">距离维保时间</span>'],
                data: null,
                // [
                //     ['LBZN2829292829', '70%', '<span style="color:#06c854;">在线</span>', '20天'],
                //     ['LBZN2829292829', '70%', '<span style="color:#06c854;">在线</span>', '20天'],
                //     ['LBZN2829292829', '70%', '<span style="color:#06c854;">在线</span>', '20天'],
                //     ['LBZN2829292829', '70%', '<span style="color:#06c854;">在线</span>', '20天'],
                //     ['LBZN2829292829', '70%', '<span style="color:#06c854;">在线</span>', '20天'],
                //     ['LBZN2829292829', '70%', '<span style="color:#06c854;">在线</span>', '20天'],
                //     ['LBZN2829292829', '70%', '<span style="color:#06c854;">在线</span>', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],
                //     ['LBZN2829292829', '70%', '离线', '20天'],

                // ],

                rowNum: 15,
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
        this.kHOne = Math.round(this.screenHeight * 0.775)
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
        // this.getDataTimer();
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
            this.kHOne = Math.round(this.screenHeight * 0.775);
            //console.log("高度->"+this.screenHeight +"-"+ this.kHOne);
        },
        // 字体大小根据宽度自适应
        getScreenWidth() {
            this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            this.kWOne = Math.round(this.screenWidth * 0.155);
            this.kFOne = Math.round(this.screenWidth / 90);
        },
        getData() {
            getAllDevice().then(res => {
                res.push(

                    {
                        "distance_to_maintenance_time": "34",
                        "id": 2,
                        "number": "LB_02",
                        "status": "Online",
                        "usage": "0"
                    },
                    {
                        "distance_to_maintenance_time": "45",
                        "id": 3,
                        "number": "LB_03",
                        "status": "Online",
                        "usage": "56.7"
                    },
                    {
                        "distance_to_maintenance_time": null,
                        "id": 4,
                        "number": "LB_04",
                        "status": "Online",
                        "usage": "23"
                    },
                    {
                        "distance_to_maintenance_time": null,
                        "id": 5,
                        "number": "LB_05",
                        "status": "Online",
                        "usage": "16"
                    },
                    {
                        "distance_to_maintenance_time": "12",
                        "id": 6,
                        "number": "LB_06",
                        "status": "Online",
                        "usage": "10"
                    },
                    {
                        "distance_to_maintenance_time": "15",
                        "id": 7,
                        "number": "LB_07",
                        "status": "Online",
                        "usage": "26.7"
                    },
                    {
                        "distance_to_maintenance_time": null,
                        "id": 8,
                        "number": "LB_08",
                        "status": "Online",
                        "usage": "33"
                    },
                    {
                        "distance_to_maintenance_time": null,
                        "id": 9,
                        "number": "LB_09",
                        "status": "Online",
                        "usage": "15"
                    },
                    {
                        "distance_to_maintenance_time": "14",
                        "id": 10,
                        "number": "LB_10",
                        "status": "Online",
                        "usage": "0"
                    },
                    {
                        "distance_to_maintenance_time": "5",
                        "id": 11,
                        "number": "LB_11",
                        "status": "Online",
                        "usage": "22.7"
                    },
                    {
                        "distance_to_maintenance_time": null,
                        "id": 12,
                        "number": "LB_12",
                        "status": "Online",
                        "usage": "3"
                    },
                )

                let arr1 = res.map(item => {
                    return [
                        item.number,
                        item.usage + '%',
                        item.status === "Online" ? '<span style="color:#06c854;">' + '在线' + '</span>' : '<span style="color:#FF0000;">' + '离线' + '</span>',
                        item.distance_to_maintenance_time === null ? '-' : item.distance_to_maintenance_time,
                    ];
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
.left-chart2 {
    display: flex;
    flex-direction: column;

    .left-chart2-title {
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

    .left-chart2-chart {
        flex: 3;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #041135;
    }
}
</style>
