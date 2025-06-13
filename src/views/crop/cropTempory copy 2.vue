<template>
    <div class="main">
        <div v-if="isPlay" class="cut">
            <a>暂未开始试运行!</a>
        </div>
        <div v-else class="cut">
            <div v-if="flowItemInfo.type == 'camera'""  style=" width: 100%; height: 100%; overflow: hidden;">
                <img ref="image" id="cropimage" :src="imgUrl" alt="" class="iframeClass" :key="imgUrl"
                    style="width: 100%;  height: 100%; object-fit: scale-down;" />
            </div>
            <div v-else style=" width: 100%; height: 100%; overflow: hidden;">
                <img :src="imgUrl" style="height: 100%; width: 100%; object-fit: scale-down" :key="imgUrl" />
            </div>
            <div class="menuBtn" v-if="flowItemInfo.type == 'threshold' && type == 'Quality' && isStartTrialRuning">
                <div class="item item-r">
                    <i v-if="!showMenuBtn" class="el-icon-arrow-left" @click="showRunningResult"></i>
                    <i v-else class="el-icon-arrow-right" @click="showMenuBtn = !showMenuBtn"></i>
                </div>
                <div v-if="showMenuBtn && form.algorithm_type == 'Ai'" class="cont">
                    <div class="cont-txt" v-for="(item, index) in trialRunningResultList" :key="index">
                        <p>
                            <a>{{ item.class }}面积：</a>
                            <a>{{ item.area }}</a>
                        </p>
                        <p>
                            <a>{{ item.class }}数量：</a>
                            <a>{{ item.count }}</a>
                        </p>
                        <p>
                            <a>{{ item.class }}长：</a>
                            <a>{{ item.length }}</a>
                        </p>
                        <p>
                            <a>{{ item.class }}宽：</a>
                            <a>{{ item.width }}</a>
                        </p>
                        <p>
                            <a>{{ item.class }}长宽比：</a>
                            <a>{{ item.ratio }}</a>
                        </p>
                    </div>
                </div>
                <div v-if="showMenuBtn && form.algorithm_type == 'Size' && isStartTrialRuning" class="cont">
                    <div class="cont-txt" v-for="(item, index) in vpptrialRunningResultList" :key="index">
                        <p>
                            <a>{{ item.name }}：{{ item.value }}</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="cropIconClass">
            <!-- <p v-if="cameraRect.rect" style="
          flex: 1;
          display: flex;
          justify-content: space-around;
          padding-left: 10px;
        ">
        <span> x:{{ cameraRect.rect.x }} </span>
        <span> y:{{ cameraRect.rect.y }} </span>
        <span> width:{{ cameraRect.rect.width }} </span>
        <span> height:{{ cameraRect.rect.height }} </span>
      </p> -->
            <p class="tips">若要调整参数，需停止试运行！</p>
            <el-tooltip effect="dark" content="试运行" placement="bottom">
                <el-button :disabled="isDisabled" v-if="isPlay && flowItemInfo.type == 'camera' && !isCut"
                    @click="handlePlay">
                    <i class="el-icon-video-play" style="color: #000000"></i>
                </el-button>
                <el-button :disabled="isDisabled" v-if="isPlay && flowItemInfo.type == 'threshold'"
                    @click="handleExuPlay">
                    <i class="el-icon-video-play" style="color: #000000"></i>
                </el-button>
                <el-button :disabled="isDisabled" v-if="isPause && flowItemInfo.type == 'camera' && !isCut"
                    @click="handlePause">
                    <i class="el-icon-video-pause" style="color: #000000"></i>
                </el-button>
                <el-button :disabled="isDisabled" v-if="isPause && flowItemInfo.type == 'threshold'"
                    @click="handleExuPause">
                    <i class="el-icon-video-pause" style="color: #000000"></i>
                </el-button>
            </el-tooltip>
            <!-- && isPause -->
            <el-tooltip v-if="flowItemInfo.type == 'camera' && isPause && !isCut" effect="dark" content="显示相机检测区域"
                placement="bottom">
                <i class="iconfont icon-lbzncaijian1" style="color: #000000" @click="handleCamera"></i>
            </el-tooltip>
            <el-button class="comBtn" v-if="flowItemInfo.type == 'camera' && isCut"
                @click="handleCancelCamera">取消</el-button>
            <el-button class="comBtn"
                v-if="flowItemInfo.type == 'camera' && (isCut && !cameraRect.rect) || (isCut && isRectChanged())"
                @click="handleConfirmCamera">
                确定
            </el-button>
            <el-button class="comBtn" v-if="flowItemInfo.type == 'camera' && isCut && originalRect && !isRectChanged()"
                @click="handleRestoreCamera">
                复原
            </el-button>
            <el-tooltip effect="dark" content="保存图片" placement="bottom">
                <i class="iconfont icon-lbznbaocuntupian" style="color: #000000" @click="handleImgSave"></i>
            </el-tooltip>
        </div>
    </div>
</template>
<script>
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { setCameraRoi } from "@/api/workflowConfig";
import {
    startTrialRuningStation,
    stopTrialRuningStation,
    startTrialRuning,
    stopTrialRuning,
    saveImage,
} from "@/api/workflowConfig";
import { EventSourceUrl } from "../../utils/index";

export default {
    name: "test",
    components: {
    },
    props: {
        cameraArea: {
            require: true,
        },
    },
    data() {
        return {
            eventSource: null,
            showMenuBtn: false,
            trialRunningResultList: [],
            vpptrialRunningResultList: [],
            type: "",
            flowItemInfo: {},
            cropState: false,
            comFlow: {},
            form: {
                rect: null,
            },
            isCut: false,
            imgUrl: "",
            ws: null,
            modelSrc: "",
            previews: {},
            crap: false,
            model: false,
            isPlay: true,
            isPause: false,
            isStartTrialRuning: false,
            initialZoomMovement: { x: 0, y: 0 },
            show: true,
            fixed: false,
            fixedNumber: [1, 1],
            originImgScaleValue: "scale(1)",
            myCropper: null,
            afterImg: "",
            ScaleX: 1,
            ScaleY: 1,
            fixed: false,
            fixedBox: false,
            inputRotate: 0,
            isDisabled: false,
            autoCropWidth: 300,
            autoCropHeight: 300,
            originalRect: null,
            cameraRect: {
                rect: null,
            },
        };
    },
    mounted() {
    },
    watch: {
        "comFlow.state": {
            handler(newVal, oldVal) {
                if (newVal == 1) {
                    this.cropState = true;
                } else {
                    this.cropState = false;
                }
            },
            deep: true,
        },
    },
    beforeDestroy() {
        this.myCropper = null;
        if (this.isPause) {
            if (this.flowItemInfo.type == "camera") {
                this.handlePause();
            }
            if (this.flowItemInfo.type == "threshold") {
                this.handleExuPause();
            }
        }
    },
    methods: {
        init(form, comFlow, flowItemInfo, type) {
            this.isPlay = false;
            this.isPause = false;
            if (this.isPause) {
                this.handlePause();
            } else {
                this.isPlay = true;
                this.isPause = false;
            }
            this.imgUrl = "";
            this.form = form;
            this.cameraRect = form;
            this.comFlow = comFlow;
            this.flowItemInfo = flowItemInfo;
            this.type = type;
        },
        //实时监测数据展开收起
        showRunningResult() {
            this.showMenuBtn = !this.showMenuBtn;
        },
        //查看实时检测数据
        qualityTrialRunningResult() {
            if (this.form.algorithm_type == "Ai") {
                //TODO AI实时监测检测
                this.eventSource = new EventSource(
                    "http://localhost:3000/config/quality_trial_running_result"
                );
                let that = this;
                this.eventSource.onmessage = function (event) {
                    let obj = {
                        C1: "裂纹",
                        C2: "磕边",
                        C3: "砂眼",
                        C4: "划痕",
                        C5: "刀痕",
                        C6: "脏污",
                    };
                    let trialRunningResult = JSON.parse(event.data);
                    let resTrialRunningResult = trialRunningResult.map((item) => {
                        let className = item.class;
                        let mappedClass = obj[className];
                        return {
                            class: mappedClass,
                            area: item.area,
                            count: item.count,
                            length: item.length,
                            width: item.width,
                            ratio: item.ratio,
                        };
                    });
                    that.trialRunningResultList = resTrialRunningResult;
                };

                this.eventSource.onerror = function (event) {
                    console.error("Error:", event);
                };
            }
            if (this.form.algorithm_type == "Size") {
                //TODO 尺寸实时监测检测
                this.eventSource = new EventSource(
                    "http://localhost:3000/config/vpp_trial_running_result?algorithm_id=" + this.form.algorithm_id
                );
                let that = this;
                this.eventSource.onmessage = function (event) {
                    let vppTrialRunningResult = JSON.parse(event.data);
                    let resVppTrialRunningResult = vppTrialRunningResult.map(item => {
                        let newItem = { ...item };
                        if (typeof item.value === 'string' && !isNaN(item.value)) {
                            newItem.value = Number(item.value);
                        } else if (item.value === true) {
                            newItem.value = '开启';
                        } else if (item.value === false) {
                            newItem.value = '关闭';
                        }
                        return newItem;
                    });
                    that.vpptrialRunningResultList = resVppTrialRunningResult;
                };

                this.eventSource.onerror = function (event) {
                    console.error("Error:", event);
                };
            }
        },
        //在正式光源里寻找对应值
        lookForBrightness(id, arr) {
            let brightness = 0;
            arr.forEach((item, index) => {
                if (item.light_id) {
                    if (item.light_id == id) {
                        brightness = item.brightness;
                    }
                } else {
                    if (item.id == id) {
                        brightness = item.brightness;
                    }
                }
            });
            return brightness;
        },
        //开启相机试运行
        handlePlay() {
            return new Promise((resolve, reject) => {
                this.isDisabled = true;
                if (this.form.camera_type == "Station") {
                    this.startTrialRuningStation();
                } else if (this.form.camera_type == "Camera") {
                    let addr = `ws://localhost:3000/hardware/trial_running_camera?ip=${this.form._camera.ip}&exposure_time=${this.form.exposure_time}&gain=${this.form.gain}`;
                    this.ws = new WebSocket(addr);

                    this.ws.onopen = (event) => {
                        this.isPause = true;
                        this.isPlay = false;
                        this.$message.success("相机试运行已开启！");
                        this.isDisabled = false;
                        this.setupCropper();
                        resolve(event);
                    };

                    this.ws.onerror = (event) => {
                        this.$message.warning("相机试运行启动失败!");
                        reject(event);
                    };
                } else {
                    reject(new Error('无法启动'));
                }
            });
        },
        //停止相机试运行
        handlePause() {
            return new Promise((resolve, reject) => {
                this.isDisabled = true;
                if (this.form.camera_type == "Station" && this.isPause) {
                    this.stopTrialRuningStation();
                } else if (this.form.camera_type == "Camera" && this.isPause) {
                    this.ws.close();
                    this.$message.success("相机试运行已关闭！");
                    this.isPause = false;
                    this.isPlay = true;
                    this.isDisabled = false;
                    if (this.cameraRect.rect) {
                        setTimeout(() => {
                            let saveCameraInfo = {
                                ip: this.form._camera.ip,
                                rect: this.cameraRect ? this.cameraRect.rect : this.form.rect
                            };
                            //可供vpp使用的裁剪坐标
                            setCameraRoi(saveCameraInfo).then(res => {
                                this.form.rect = { ...res };
                            });
                        }, 2000);
                    }
                    resolve();
                } else {
                    reject(new Error('无法暂停'));
                }
            });
        },
        //启动工位试运行
        startTrialRuningStation(showSuccessMessage = true) {
            let lights = [];

            if (this.form.lights && this.form._camera.light) {
                this.form._camera.light.forEach((e) => {
                    lights.push({
                        id: e.id,
                        slot: e.slot,
                        brightness: this.lookForBrightness(e.id, this.form.lights),
                    });
                });
            }
            let startinfo = {
                ctlr_id: this.form._camera.controller_id,
                camera_ip: this.form._camera.ip,
                camera_slot: this.form._camera.slot,
                camera_exposure_time: this.form.exposure_time,
                camera_gain: this.form.gain,
                camera_area: this.form._camera.camera_area,
                lights: lights,
            };

            if (this.form["rect"]) {
                startinfo["camera_area"] = this.cameraRect.rect;
            }
            startTrialRuningStation(JSON.stringify(startinfo)).then((res) => {
                if (showSuccessMessage) {
                    this.$message.success("工位试运行已开启！");
                    this.setupCropper();
                }
                this.isPause = true;
                this.isPlay = false;
            }).finally((res) => {
                this.isDisabled = false;
            });
        },
        //停止工位试运行
        stopTrialRuningStation() {
            if (this.isPause) {
                stopTrialRuningStation().then((res) => {
                    this.$message.success("工位试运行已关闭！");
                    this.isPause = false;
                    this.isPlay = true;
                    if (this.cameraRect.rect) {
                        setTimeout(() => {
                            let saveCameraInfo = {
                                ip: this.form._camera.ip,
                                rect: this.cameraRect.rect
                            };
                            //可供vpp使用的裁剪坐标
                            setCameraRoi(saveCameraInfo).then(res => {
                                this.form.rect = { ...res };
                            });
                        }, 2000);
                    }
                }).finally((res) => {
                    this.isDisabled = false;
                });
            }
        },
        //AI阈值试运行开始
        handleExuPlay() {
            if (this.isCut) {
                this.myCropper.destroy();
            }
            this.isCut = false;
            this.isDisabled = true;
            if (this.form.algorithm_type == "Ai") {
                this.startTrialRuning("Ai");
                this.imgUrl = `http://localhost:3000/view?ip=${this.form._camera.ip}`;
            }

            if (this.form.algorithm_type == "Size") {
                this.startTrialRuning("Size");
                this.imgUrl = `http://localhost:3000/view?ip=${this.form._camera.ip}`;
            }
        },
        //AI阈值试运行暂停
        handleExuPause() {
            this.isDisabled = true;
            // 连接关闭时的处理
            this.stopTrialRuning();
        },
        //启动AI阈值试运行
        startTrialRuning(type) {
            let threshold_type = this.form.classes.type;
            if (threshold_type == 'Speed' || threshold_type == 'Stage') {
                this.$message.warning('监控阈值试运行暂未开放!')
            } else {
                let lights = [];
                if (this.form["lights"] && this.form["_camera"]) {
                    this.form._camera.light.forEach((e) => {
                        lights.push({
                            id: e.id,
                            slot: e.slot,
                            brightness: this.lookForBrightness(e.id, this.form.lights),
                        });
                    });
                }
                let startinfo = {
                    ctlr_id: this.form._camera.controller_id,
                    camera_ip: this.form._camera.ip,
                    camera_slot: this.form._camera.slot,
                    camera_exposure_time: this.form.exposure_time,
                    camera_gain: this.form.gain,
                    model_path: this.form.model_path,
                    lights: lights,
                    classes: this.form.classes,
                    type: this.type,
                };
                if (type == "Size") {
                    startinfo["algorithm_id"] = this.form.algorithm_id;
                }
                if (this.form["min_area"]) {
                    startinfo["min_area"] = this.form.min_area;
                }
                if (this.form["rect"]) {
                    startinfo["camera_rect"] = this.cameraRect.rect;
                }
                startTrialRuning(JSON.stringify(startinfo)).then((res) => {
                    this.$message.success("阈值试运行已开启！");
                    this.isPause = true;
                    this.isPlay = false;
                    this.isStartTrialRuning = true;
                    this.qualityTrialRunningResult();
                }).finally((res) => {
                    this.isDisabled = false;
                });
            }
        },
        //停止阈值试运行
        stopTrialRuning() {
            if (this.isPause) {
                stopTrialRuning({ algorithm_type: this.form.algorithm_type }).then((res) => {
                    this.$message.success("阈值试运行已关闭！");
                    this.isPause = false;
                    this.isPlay = true;
                    this.isStartTrialRuning = false;
                    this.showMenuBtn = false;
                    if (this.eventSource) {
                        this.eventSource.close();
                    }
                }).finally((res) => {
                    this.isDisabled = false;
                });
            }
        },
        //显示相机检测区域
        handleCamera: _.debounce(function () {
            if (!this.isPlay && this.flowItemInfo.type == 'camera') {
                this.originalRect = this.cameraRect.rect ? { ...this.cameraRect.rect } : null;
            }
            if (this.myCropper) {
                // 确保裁剪框数据被设置
                const imageData = this.myCropper.getImageData();
                if (imageData) {
                    this.myCropper.setCropBoxData({
                        left: 0,
                        top: 0,
                        width: imageData.width,
                        height: imageData.height
                    });
                    this.myCropper.crop(); // 确保裁剪框被更新
                    this.isCut = true;
                } else {
                    console.error("Image data is not available.");
                }
            }
        }, 500),
        //提取公共的 Cropper 设置逻辑
        setupCropper() {
            // this.imgUrl = `${EventSourceUrl}/view?ip=${this.form._camera.ip}`;
            let _this = this;
            this.$nextTick(() => {
                this.$refs.image.src = `${EventSourceUrl}/view?ip=${this.form._camera.ip}`;
                this.myCropper = new Cropper(this.$refs.image, {
                    viewMode: 1,
                    dragMode: "move",
                    preview: ".before",
                    background: true,
                    autoCropArea: 1,
                    zoomOnWheel: true,
                    info: true,
                    autoCrop: false, // 关闭自动显示裁剪框
                    ready: () => {
                        _this.myCropper.setCropBoxData({
                            left: 0,
                            top: 0,
                            width: _this.myCropper.getImageData().width,
                            height: _this.myCropper.getImageData().height
                        });
                        _this.getCameraArea('origin');
                    },
                    cropend: (event) => {
                        _this.getCameraArea('change');
                        _this.isRectChanged();
                    },
                    crop: (event) => {
                        // _this.getCameraArea();
                        // _this.isRectChanged();
                    },
                });
            });
            // }
        },
        //获取相机检测区域坐标参数
        getCameraArea(value) {
            var data = this.myCropper.getData();
            var { x, y, width, height } = data || {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            };

            let cameraArea = {
                x: Math.max(0, parseInt(x)),
                y: Math.max(0, parseInt(y)),
                width: parseInt(width),
                height: parseInt(height),
            };
            // console.log("🚀 ~ getCameraArea ~ cameraArea:", cameraArea)
            if (value == 'change') {
                // console.log('----change----');
                this.cameraRect.rect = cameraArea;
            } else {
                // console.log('----非change----');
                if (!this.originalRect) {
                    this.originalRect = cameraArea;
                }
            }
        },
        // 判断矩形框是否被改变
        isRectChanged() {
            // console.log('this.originalRect', this.originalRect);
            // console.log('this.cameraRect.rect', this.cameraRect.rect);
            // 如果没有原始矩形框信息，认为改变
            if (!this.originalRect) return true;

            // 比较两个矩形框是否相同
            return this.cameraRect.rect && this.originalRect &&
                (this.cameraRect.rect.width !== this.originalRect.width ||
                    this.cameraRect.rect.height !== this.originalRect.height);
        },
        // 取消操作
        handleCancelCamera() {
            if (this.myCropper) {
                // 隐藏裁剪框
                this.myCropper.clear();
                this.isCut = false;
            }
        },

        // 复原操作
        handleRestoreCamera() {
            // 仅在图像已经是小图且矩形框未改变时生效
            if (this.isCut) {
                // 停止当前试运行
                this.handlePause();
                this.cameraRect.rect = null; // 清空矩形框
                this.originalRect = null; // 清空矩形框
                // 关闭裁剪
                this.isCut = false;
            }
        },

        // 确定/完成操作
        handleConfirmCamera() {
            // console.log('this.cameraRect.rect', this.cameraRect.rect);
            // console.log('this.originalRect', this.originalRect);
            // console.log('this.isRectChanged()', this.isRectChanged());
            // 场景1：图像未被裁减过
            if (!this.isCut) {
                this.isCut = false;
                return;
            }

            // 场景2：图像已经是小图，但矩形框未被拖动
            if (this.isCut && !this.isRectChanged()) {
                this.isCut = false;
                return;
            }

            // 场景3：图像已经是小图，矩形框已被拖动
            if ((this.isCut && !this.originalRect) || (this.isCut && this.isRectChanged())) {
                // 停止当前试运行
                this.handlePause();
            }

            // 关闭裁剪
            if (this.myCropper) {
                this.isCut = false;
            }
        },
        //还原图片
        handleBackCamera() {
            this.isCut = false;
            this.form["rect"] = null;
        },
        // 刷新图片
        refreshImages() {
            // 获取所有图片元素
            const images = document.querySelectorAll('.iframeClass');
            images.forEach((img, index) => {
                const currentUrl = this.imgUrl;
                // 直接更新图片的src属性
                img.src = currentUrl;
            });
        },
        //保存图片
        handleImgSave() {
            saveImage({
                ip: this.form._camera.ip,
                config_id: this.form.work_configuration_id,
            }).then((res) => {
                this.$message.success("保存图片成功");
            });
        },
        startCrop() {
            // start
            this.crap = true;
            this.$refs.cropper.startCrop();
        },
        stopCrop() {
            //  stop
            this.crap = false;
            this.$refs.cropper.stopCrop();
        },

        refreshCrop() {
            // clear
            this.$refs.cropper.refresh();
        },
        changeScale(num) {
            num = num || 1;
            this.$refs.cropper.changeScale(num);
        },
        rotateLeft() {
            this.$refs.cropper.rotateLeft();
        },
        rotateRight() {
            this.$refs.cropper.rotateRight();
        },
        finish(type) {
            // 输出
            if (type === "blob") {
                this.$refs.cropper.getCropBlob((data) => {
                    var img = window.URL.createObjectURL(data);
                    this.model = true;
                    this.modelSrc = img;
                });
            } else {
                this.$refs.cropper.getCropData((data) => {
                    this.model = true;
                    this.modelSrc = data;
                });
            }
        },
        // 实时预览函数
        realTime(data) {
            this.previews = data;
            // 原始尺寸
            const originalWidth = parseInt(data.img.width.match(/\d+/)[0], 10); // 从 "1626px" 提取数字
            const originalHeight = parseInt(data.img.height.match(/\d+/)[0], 10); // 从 "1236px" 提取数字

            // 提取 transform 属性中的 scale 值
            const transformStr = data.img.transform;
            const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
            const scaleValue = parseFloat(scaleMatch[1]); // 将提取的缩放比例字符串转换为数字

            // 计算缩放后的尺寸
            const scaledWidth = Math.round(originalWidth * scaleValue);
            const scaledHeight = Math.round(originalHeight * scaleValue);

            // 输出结果
            console.log(`缩放后图片的宽高 : ${scaledWidth}px, ${scaledHeight}px`);
            console.log(
                "基于原始尺寸图片下裁图框的宽高",
                Math.round(
                    parseInt(data.img.width.match(/\d+/)[0], 10) /
                    (scaledWidth / this.$refs.cropper.cropW)
                ),
                Math.round(
                    parseInt(data.img.height.match(/\d+/)[0], 10) /
                    (scaledHeight / this.$refs.cropper.cropH)
                )
            );
            console.log("图片基于容器的偏移值", this.$refs.cropper.getImgAxis());
            console.log("截图框基于容器的偏移值", this.$refs.cropper.getCropAxis());

            // var ratio = Number(data.img.transform.substring(6, 11));
            //获取截图框基于容器的坐标点
            var crop_position = this.$refs.cropper.getCropAxis();

            //获取图片基于容器的坐标点
            var img_position = this.$refs.cropper.getImgAxis();
            //计算截图框基于图片的坐标
            let x = crop_position.x1 - img_position.x1;
            let y = crop_position.y1 - img_position.y1;
            console.log("截图框基于图片的坐标", x, y);

            //计算裁图框在原始尺寸图片下的坐标值
            let newx = Math.round(
                x * (parseInt(data.img.width.match(/\d+/)[0], 10) / scaledWidth)
            );
            let newy = Math.round(
                y * (parseInt(data.img.height.match(/\d+/)[0], 10) / scaledHeight)
            );
            let newWidth = Math.round(
                parseInt(data.img.width.match(/\d+/)[0], 10) /
                (scaledWidth / this.$refs.cropper.cropW)
            );
            let newHeight = Math.round(
                parseInt(data.img.height.match(/\d+/)[0], 10) /
                (scaledHeight / this.$refs.cropper.cropH)
            );
            console.log("截图框在原始尺寸图片下的坐标", newx, newy);
            // let cameraArea = {
            //   origin_x: newx,
            //   origin_y: newy,
            //   x_length: newWidth,
            //   y_length: newHeight,
            // };
            let cameraArea = {
                x: newx,
                y: newy,
                width: newWidth,
                height: newHeight,
            };
            this.cameraRect.rect = cameraArea;
        },

        finish2(type) {
            this.$refs.cropper2.getCropData((data) => {
                this.model = true;
                this.modelSrc = data;
            });
        },
        finish3(type) {
            this.$refs.cropper3.getCropData((data) => {
                this.model = true;
                this.modelSrc = data;
            });
        },
        down(type) {
            // event.preventDefault()
            var aLink = document.createElement("a");
            aLink.download = "demo";
            // 输出
            if (type === "blob") {
                this.$refs.cropper.getCropBlob((data) => {
                    this.downImg = window.URL.createObjectURL(data);
                    aLink.href = window.URL.createObjectURL(data);
                    aLink.click();
                });
            } else {
                this.$refs.cropper.getCropData((data) => {
                    this.downImg = data;
                    aLink.href = data;
                    aLink.click();
                });
            }
        },
        uploadImg(e, num) {
            //上传图片
            var file = e.target.files[0];
            if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
                alert("图片类型必须是.gif,jpeg,jpg,png,bmp中的一种");
                return false;
            }
            var reader = new FileReader();
            reader.onload = (e) => {
                let data;
                if (typeof e.target.result === "object") {
                    // 把Array Buffer转化为blob 如果是base64不需要
                    data = window.URL.createObjectURL(new Blob([e.target.result]));
                } else {
                    data = e.target.result;
                }
                if (num === 1) {
                    this.imgUrl = data;
                } else if (num === 2) {
                    this.example2.img = data;
                }
            };
            // 转化为base64
            // reader.readAsDataURL(file)
            // 转化为blob
            reader.readAsArrayBuffer(file);
        },
    },
};
</script>
<style lang="scss">
.main {
    width: 100%;
    height: 100%;

    .cut {
        width: 96%;
        margin: 10px auto 10px auto;
        height: calc(100% - 52px);
        // border-radius: 9px;
        background: #f6f9fd;
        text-align: center;
        background-color: #dedede;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;

        .cropper-bg {
            background-image: url("../../assets/imgs/cropimg.png") !important;
        }

        a {
            color: #c98c36;
            font-weight: 900;
            font-size: 18px;
        }

        .menuBtn {
            position: absolute;
            top: 0;
            right: 0;
            height: 100%;
            min-width: 41.24px;
            background-color: rgba(255, 255, 255, 0.5);
            box-shadow: -3px 0px 5px 2px rgba(0, 0, 0, 0.09);
            border-radius: 5px 0 0 5px;
            display: flex;
            justify-content: center;

            .item-r {
                text-align: right;

                i {
                    font-size: 20px;
                    font-weight: 900;
                }
            }

            .item {
                display: flex;
                align-items: center;
                color: #f4ac45;
                font-size: 14px;
                text-align: left;
                font-family: PingFangSC-regular;
                cursor: pointer;
            }

            .cont {
                width: 160px;
                height: 100%;
                overflow-y: auto;

                .cont-txt {
                    font-size: 16px;
                    text-align: left;
                    font-family: PingFangSC-regular;
                    padding-left: 5px;
                    color: #000000;
                }
            }
        }
    }
}

.cropIconClass {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;

    .comBtn {
        margin-right: 5px;
        background-color: rgba(0, 0, 0, 1);
        color: rgba(255, 255, 255, 1);
        font-size: 12px;
        text-align: center;
        padding: 4px 8px !important;
        border-radius: 6px;
        cursor: pointer;

        &:first-child {
            background-color: #ffffff;
            color: #000000;
            border-color: #000000 !important;
        }

        &:last-child {
            margin-right: 0px;
        }

        &:active {
            color: #ffffff !important;
            background-color: #000000 !important;
        }

        &:hover {
            color: #ffffff !important;
            background-color: #000000 !important;
        }

        &:focus {
            background-color: #000000 !important;
        }
    }

    .el-button {
        border: none;
        padding: 0 12px 0px 0px;

        &:active {
            color: #000000;
            background-color: #ffffff;
        }

        &:hover {
            color: #000000;
            background-color: #ffffff;
        }

        &:focus {
            background-color: #ffffff;
        }
    }

    .tips {
        font-size: 14px;
        padding: 0 5px;
        color: #ea3322;
    }

    i {
        font-size: 22px;
        color: #066df3;
        cursor: pointer;
        margin-right: 2%;
    }
}
</style>
