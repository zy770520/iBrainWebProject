<template>
    <div options="options" ref="refChart" id="bottomRightChart" :style="{
        'width': 100 + '%',
        'minHeight': Math.round(kWOne / 1.44) + 'px',
    }"></div>
</template>
<script>
import { getStationRatio } from '@/api/home.js';
import { removeEmptyFields } from "../../../utils/index";
import * as echarts from "echarts";
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
            pieData: null
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
            this.lineTextStyle = Math.round(this.$refs.refChart.offsetWidth / 34);
            let adapterOption = {
                series: [
                    {
                        label: {
                            normal: {
                                textStyle: {
                                    fontSize: this.lineTextStyle,
                                }
                            }
                        },
                    }
                ]
            }
            var chartDom = document.getElementById('bottomRightChart');
            var myChart = echarts.init(chartDom, 'dark');
            myChart.setOption(adapterOption);
            myChart.resize();
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
            getStationRatio(removeEmptyFields({ device_name: device_name })).then(res => {
                // let arr = [
                //     {
                //         fail: 12,
                //         name: '上外观1'
                //     },
                //     {
                //         fail: 32,
                //         name: '上外观2'
                //     },
                //     {
                //         fail: 26,
                //         name: '下外观1'
                //     },
                //     {
                //         fail: 18,
                //         name: '下外观2'
                //     },
                //     {
                //         fail: 10,
                //         name: '上外观3'
                //     },
                //     {
                //         fail: 67,
                //         name: '下外观4'
                //     },
                // ]
                let arr4 = res.map(item => {
                    return {
                        value: item.fail, // 提取 fail 属性
                        name: item.name // 提取 name 属性
                    };
                });
                this.pieData = arr4
                this.getChartData()
            })
        },

        getChartData() {
            var chartDom = document.getElementById('bottomRightChart');
            var myChart = echarts.init(chartDom, 'dark');
            var option;
            const pieData = this.pieData

            const defaultPalette = [
                "rgba(141,208,129,1)",
                "rgba(52,114,248,0.8)",
                "rgba(52,114,248,0.6)",
                "rgba(52,114,248,0.3)",
                "rgba(141,208,129,1)",
                "rgba(52,114,248,0.8)",
                "rgba(52,114,248,0.6)",
                "rgba(52,114,248,0.3)",
                "rgba(141,208,129,1)",
                "rgba(52,114,248,0.8)",
                "rgba(52,114,248,0.6)",
                "rgba(52,114,248,0.3)",
            ];
            const radius = ['30%', '50%'];
            const pieOption = {
                backgroundColor: '#041135',
                tooltip: {
                    trigger: 'item'
                },
                series: [
                    {
                        type: 'pie',
                        id: 'distribution',
                        radius: radius,
                        label: {
                            show: true,
                            normal: {
                                // 各分区的提示内容
                                // params: 即下面传入的data数组,通过自定义函数，展示你想要的内容和格式
                                formatter: function (params) {
                                    return params.name + '\n\n' + params.percent + '%';
                                },
                                textStyle: {
                                    // 提示文字的样式
                                    color: '#ffffff',
                                    fontSize: this.lineTextStyle,
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                length: 20, // 指示线宽度
                                lineStyle: {
                                    color: '#ffffff' // 指示线颜色
                                }
                            }
                        },
                        universalTransition: true,
                        animationDurationUpdate: 1000,
                        data: pieData,
                        itemStyle: {
                            normal: {
                                color: function (colors) {
                                    var colorList = [
                                        "rgba(141,208,129,1)",
                                        "rgba(52,114,248,0.8)",
                                        "rgba(52,114,248,0.6)",
                                        "rgba(52,114,248,0.3)",
                                        "rgba(141,208,129,1)",
                                        "rgba(52,114,248,0.8)",
                                        "rgba(52,114,248,0.6)",
                                        "rgba(52,114,248,0.3)",
                                        "rgba(141,208,129,1)",
                                        "rgba(52,114,248,0.8)",
                                        "rgba(52,114,248,0.6)",
                                        "rgba(52,114,248,0.3)",
                                    ];
                                    var index = colors.dataIndex;
                                    if (colors.dataIndex >= colorList.length) {
                                        index = 3;
                                    }
                                    return colorList[index];
                                }
                            }
                        }
                    }
                ]
            };
            const parliamentOption = (function () {
                let sum = pieData.reduce(function (sum, cur) {
                    return sum + cur.value;
                }, 0);
                let angles = [];
                let startAngle = -Math.PI / 2;
                let curAngle = startAngle;
                pieData.forEach(function (item) {
                    angles.push(curAngle);
                    curAngle += (item.value / sum) * Math.PI * 2;
                });
                angles.push(startAngle + Math.PI * 2);
                function parliamentLayout(startAngle, endAngle, totalAngle, r0, r1, size) {
                    let rowsCount = Math.ceil((r1 - r0) / size);
                    let points = [];
                    let r = r0;
                    for (let i = 0; i < rowsCount; i++) {
                        // Recalculate size
                        let totalRingSeatsNumber = Math.round((totalAngle * r) / size);
                        let newSize = (totalAngle * r) / totalRingSeatsNumber;
                        for (
                            let k = Math.floor((startAngle * r) / newSize) * newSize;
                            k < Math.floor((endAngle * r) / newSize) * newSize - 1e-6;
                            k += newSize
                        ) {
                            let angle = k / r;
                            let x = Math.cos(angle) * r;
                            let y = Math.sin(angle) * r;
                            points.push([x, y]);
                        }
                        r += size;
                    }
                    return points;
                }
                return {
                    series: {
                        type: 'custom',
                        id: 'distribution',
                        data: pieData,
                        coordinateSystem: undefined,
                        universalTransition: true,
                        animationDurationUpdate: 1000,

                        renderItem: function (params, api) {
                            var idx = params.dataIndex;
                            var viewSize = Math.min(api.getWidth(), api.getHeight());
                            var r0 = ((parseFloat(radius[0]) / 100) * viewSize) / 2;
                            var r1 = ((parseFloat(radius[1]) / 100) * viewSize) / 2;
                            var cx = api.getWidth() * 0.5;
                            var cy = api.getHeight() * 0.5;
                            var size = viewSize / 50;
                            var points = parliamentLayout(
                                angles[idx],
                                angles[idx + 1],
                                Math.PI * 2,
                                r0,
                                r1,
                                size + 3
                            );
                            return {
                                type: 'group',
                                children: points.map(function (pt) {
                                    return {
                                        type: 'circle',
                                        autoBatch: true,
                                        shape: {
                                            cx: cx + pt[0],
                                            cy: cy + pt[1],
                                            r: size / 2
                                        },
                                        style: {
                                            fill: defaultPalette[idx % defaultPalette.length],
                                        },

                                    };
                                })
                            };
                        }
                    }
                };
            })();
            let currentOption = (option = pieOption);
            setInterval(function () {
                currentOption = currentOption === pieOption ? parliamentOption : pieOption;
                myChart.setOption(currentOption);
            }, 2000);

            option && myChart.setOption(option);

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