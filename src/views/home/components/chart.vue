<template>
    <div options="options" id="bottomLeftChart" :style="{
        'width': 100 + '%',
        'minHeight': Math.round(kHOne / 0.95) + 'px',
    }"></div>
</template>

<script>
import tdTheme from '../theme.json' // 引入默认主题
import * as echarts from "echarts";
export default {
    components: {
    },
    props: {
        historyData: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
            lineTextStyle: 11,
            koiTime: null,
            screenHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            kHOne: null,
            options: {},
            chart: null,
        }
    },
    watch: {
        historyData: {
            handler(newData) {
                this.options = {
                    tooltip: {
                        trigger: "axis",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        axisPointer: {
                            type: "shadow",
                            label: {
                                show: true,
                                backgroundColor: "#7B7DDC"
                            }
                        }
                    },
                    legend: {
                        data: ["合格", "不合格", "不合格占比"],
                        textStyle: {
                            color: "#ffffff"
                        },
                        top: "0%"
                    },
                    grid: {
                        width: "88%",
                        left: '5%',
                        right: '5%',
                        top: '13%',
                    },
                    xAxis: {
                        data: newData.category,
                        axisLine: {
                            lineStyle: {
                                color: "#ffffff"
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                fontSize: this.lineTextStyle,
                            }
                        },
                        axisTick: {
                            show: false
                        },
                    },
                    yAxis: [
                        {
                            splitLine: { show: false },
                            axisLine: {
                                lineStyle: {
                                    color: "#ffffff"
                                }
                            },

                            axisLabel: {
                                formatter: "{value}"
                            }
                        },
                        {
                            splitLine: { show: false },
                            axisLine: {
                                lineStyle: {
                                    color: "#ffffff"
                                }
                            },
                            axisLabel: {
                                formatter: "{value} %"
                            }
                        }
                    ],
                    series: [
                        {
                            name: "不合格占比",
                            type: "line",
                            smooth: true,
                            showAllSymbol: true,
                            symbol: "emptyCircle",
                            symbolSize: 8,
                            yAxisIndex: 1,
                            itemStyle: {
                                normal: {
                                    color: "#F02FC2"
                                }
                            },
                            data: newData.percentData
                        },
                        {
                            name: "合格",
                            type: "bar",
                            barWidth: 10,
                            itemStyle: {
                                normal: {
                                    barBorderRadius: 5,
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: "#956FD4" },
                                        { offset: 1, color: "#3EACE5" }
                                    ])
                                }
                            },
                            data: newData.passData
                        },
                        {
                            name: "不合格",
                            type: "bar",
                            barGap: "-100%",
                            barWidth: 10,
                            itemStyle: {
                                normal: {
                                    barBorderRadius: 5,
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: "rgba(156,107,211,0.8)" },
                                        { offset: 0.2, color: "rgba(156,107,211,0.5)" },
                                        { offset: 1, color: "rgba(156,107,211,0.2)" }
                                    ])
                                }
                            },
                            z: -12,
                            data: newData.failData
                        }
                    ]
                }
                var chartDom = document.getElementById("bottomLeftChart");
                this.chart = echarts.init(chartDom);
                this.options && this.chart.setOption(this.options);
            },
            immediate: false,
            deep: true
        },
    },
    methods: {
        screenAdapter() {
            this.lineTextStyle = Math.round(this.screenHeight * 0.25 / 30);
            let adapterOption = {
                xAxis:
                {
                    axisLabel: {
                        textStyle: {
                            fontSize: this.lineTextStyle,
                        }
                    }
                },
                yAxis: [
                    {
                        splitLine: { show: false },
                        axisLine: {
                            lineStyle: {
                                color: "#ffffff"
                            }
                        },

                        axisLabel: {
                            formatter: "{value}"
                        }
                    },
                    {
                        splitLine: { show: false },
                        axisLine: {
                            lineStyle: {
                                color: "#ffffff"
                            }
                        },
                        axisLabel: {
                            formatter: "{value} %"
                        }
                    }
                ],
            }
            var chartDom = document.getElementById('bottomLeftChart');
            var myChart = echarts.init(chartDom);
            myChart.setOption(adapterOption);
            myChart.resize();

        },
        resizeScreen() {
            this.koiTime = setInterval(() => {
                this.getScreenHeight();
            }, 2000)
        },
        getScreenHeight() {
            this.screenHeight = window.innerHeight || document.documentElement.innerHeight || document.body.clientHeight;
            // 四舍五入取整数
            this.kHOne = Math.round(this.screenHeight * 0.25);
        },
    },
    mounted() {
        // 初始化echart
        this.options = {
            tooltip: {
                trigger: "axis",
                backgroundColor: "rgba(255,255,255,0.8)",
                axisPointer: {
                    type: "shadow",
                    label: {
                        show: true,
                        backgroundColor: "#7B7DDC"
                    }
                }
            },
            legend: {
                data: ["合格", "不合格", "不合格占比"],
                textStyle: {
                    color: "#ffffff"
                },
                top: "0%"
            },
            grid: {
                width: "88%",
                left: '5%',
                right: '5%',
                top: '13%',
            },
            xAxis: {
                data: this.historyData.category,
                axisLine: {
                    lineStyle: {
                        color: "#ffffff"
                    }
                },
                axisLabel: {
                    textStyle: {
                        fontSize: this.lineTextStyle,
                    }
                },
                axisTick: {
                    show: false
                },
            },
            yAxis: [
                {
                    splitLine: { show: false },
                    axisLine: {
                        lineStyle: {
                            color: "#ffffff"
                        }
                    },

                    axisLabel: {
                        formatter: "{value}"
                    }
                },
                {
                    splitLine: { show: false },
                    axisLine: {
                        lineStyle: {
                            color: "#ffffff"
                        }
                    },
                    axisLabel: {
                        formatter: "{value} %"
                    }
                }
            ],
            series: [
                {
                    name: "不合格占比",
                    type: "line",
                    smooth: true,
                    showAllSymbol: true,
                    symbol: "emptyCircle",
                    symbolSize: 8,
                    yAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            color: "#F02FC2"
                        }
                    },
                    data: this.historyData.percentData
                },
                {
                    name: "合格",
                    type: "bar",
                    barWidth: 10,
                    itemStyle: {
                        normal: {
                            barBorderRadius: 5,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: "#956FD4" },
                                { offset: 1, color: "#3EACE5" }
                            ])
                        }
                    },
                    data: this.historyData.passData
                },
                {
                    name: "不合格",
                    type: "bar",
                    barGap: "-100%",
                    barWidth: 10,
                    itemStyle: {
                        normal: {
                            barBorderRadius: 5,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: "rgba(156,107,211,0.8)" },
                                { offset: 0.2, color: "rgba(156,107,211,0.5)" },
                                { offset: 1, color: "rgba(156,107,211,0.2)" }
                            ])
                        }
                    },
                    z: -12,
                    data: this.historyData.failData
                }
            ]
        }
        var chartDom = document.getElementById("bottomLeftChart");
        this.chart = echarts.init(chartDom);
        this.options && this.chart.setOption(this.options);
        this.screenAdapter();
        window.addEventListener("resize", this.screenAdapter, false);
        this.resizeScreen();
    },
    beforeDestroy() {
        this.chart.dispose()
        this.chart = null
        this.kHOne = Math.round(this.screenHeight * 0.25)
    },
    destroyed() {
        clearInterval(this.koiTime);
        this.koiTime = null;
        window.removeEventListener("resize", this.screenAdapter, false);
    },
}
</script>
