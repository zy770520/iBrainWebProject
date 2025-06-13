<template>
  <!-- 动态试运行、在最后一张图像上裁剪 -->
  <div class="main">
    <div v-if="isStartRun" class="cut">
      <a class="cut-txt">暂未开始试运行!</a>
    </div>
    <div v-else class="cut viewer-container">
      <div v-if="isCut" style="width: 100%; height: 100%; overflow: hidden;">
        <img ref="image" id="cropimage" :src="imgUrl" alt="" class="iframeClass" :key="imgUrl"
          style="width: 100%;  height: 100%; object-fit: scale-down;" />
      </div>
      <div v-else ref="viewer" style="width: 100%; height: 100%; overflow: hidden; position: relative;" tabindex="-1">
        <img ref="imageRef" id="runImg" :src="imgUrl" class="pixel-perfect" crossorigin="anonymous"
          style="height: 100%; width: 100%; object-fit: scale-down" :key="imgUrl" @mousemove="handleMouseMove"
          @load="onImageLoad" />
        <canvas ref="canvasRef" class="pixel-canvas" width="1" height="1"></canvas>
        <div v-show="showPixelInfo" class="pixel-value-tooltip" :style="tooltipStyle">
          <template v-if="isGrayscaleImage">
            灰度值: {{ pixelValues.gray }}
          </template>
          <template v-else>
            RGB: ({{ pixelValues.r }}, {{ pixelValues.g }}, {{ pixelValues.b }})
          </template>
        </div>
      </div>
      <div v-if="flowItemInfo.type == 'threshold' && type == 'Quality' && isStartTrialRuning" class="menuBtn">
        <div class="item item-r">
          <i v-if="!showMenuBtn" class="el-icon-arrow-left" @click="showRunningResult"></i>
          <i v-else class="el-icon-arrow-right" @click="showMenuBtn = !showMenuBtn"></i>
        </div>
        <div v-if="showMenuBtn && form.algorithm_type == 'Ai'" class="cont">
          <div class="cont-txt" v-for="(item, index) in trialRunningResultList" :key="index">
            <p>
              <a>{{ item.class }}面积：</a>
              <a>{{ item.area.toFixed(3) }}</a>
            </p>
            <p>
              <a>{{ item.class }}数量：</a>
              <a>{{ item.count.toFixed(3) }}</a>
            </p>
            <p>
              <a>{{ item.class }}长：</a>
              <a>{{ item.length.toFixed(3) }}</a>
            </p>
            <p>
              <a>{{ item.class }}宽：</a>
              <a>{{ item.width }}</a>
            </p>
            <p>
              <a>{{ item.class }}长宽比：</a>
              <a>{{ item.ratio.toFixed(3) }}</a>
            </p>
          </div>
        </div>
        <div class="cont" v-if="showMenuBtn && form.algorithm_type == 'Size' && isStartTrialRuning">
          <div class="cont-txt" v-for="(item, index) in vpptrialRunningResultList" :key="index">
            <p>
              <a :style="{ color: item.result === 'Unqualified' ? '#ea3323' : '#000000' }">{{ item.name }}：{{
                item.value.toFixed(3)
                }}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="cropIconClass">
      <el-tooltip v-if="isPlay && flowItemInfo.type == 'camera' && !isCut && type == 'Quality' &&
        form.camera_type == 'Station' && form.offset !== null" effect="dark" content="动态试运行" placement="bottom">
        <i :disabled="isDisabled" class="iconfont icon-lbznzhuangtai-shiyunhang" @click="handleDynamicPlay"></i>
      </el-tooltip>
      <el-tooltip effect="dark" content="静态试运行" placement="bottom">
        <el-button :disabled="isDisabled" v-if="isPlay && flowItemInfo.type == 'camera' && !isCut" @click="handlePlay">
          <i class="el-icon-video-play" style="color: #000000"></i>
        </el-button>
        <el-button :disabled="isDisabled" v-if="isPlay && flowItemInfo.type == 'threshold'" @click="handleExuPlay">
          <i class="el-icon-video-play" style="color: #000000"></i>
        </el-button>
        <el-button :disabled="isDisabled" v-if="isPause && flowItemInfo.type == 'camera' && !isCut"
          @click="handlePause">
          <i class='iconfont icon-lbzntingzhi1' style="color: #000000"></i>
        </el-button>
        <el-button :disabled="isDisabled" v-if="isPause && flowItemInfo.type == 'threshold'" @click="handleExuPause">
          <i class='iconfont icon-lbzntingzhi1' style="color: #000000"></i>
        </el-button>
      </el-tooltip>
      <el-tooltip v-if="isPause" effect="dark" content="全屏显示" placement="bottom">
        <i class="iconfont icon-lbznquanpinganniu" style="color: #000000" @click="handleFullScreen"></i>
      </el-tooltip>
      <el-tooltip v-if="flowItemInfo.type == 'camera' && isPause && !isCut" effect="dark" content="显示相机检测区域"
        placement="bottom">
        <i class="iconfont icon-lbzncaijian1" style="color: #000000" @click="handleCamera"></i>
      </el-tooltip>
      <el-button class="comBtn" v-if="flowItemInfo.type == 'camera' && isCut" @click="handleCancelCamera">取消</el-button>
      <el-button class="comBtn"
        v-if="flowItemInfo.type == 'camera' && (isCut && !cameraRect.rect) || (isCut && isRectChanged())"
        @click="handleConfirmCamera">
        确定
      </el-button>
      <el-button class="comBtn" v-if="flowItemInfo.type == 'camera' && isCut && !isRectChanged()"
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
import Viewer from 'viewerjs';
import {
  startTrialRuningStation,
  stopTrialRuningStation,
  startTrialRuning,
  stopTrialRuning,
  startDynamicTrialRuning,
  stopDynamicTrialRuning,
  saveImage,
  setCameraRoi,
  getLastDisplay
} from "@/api/workflowConfig";
import { WebSocketBaseUrl, EventSourceUrl } from "../../utils/index";

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
      viewer: null,
      canvas: null,
      context: null,
      mousePosition: { x: 0, y: 0 },
      pixelValues: {
        r: 0,
        g: 0,
        b: 0,
        gray: 0
      },
      imageLoaded: false,
      showPixelInfo: false,
      isGrayscaleImage: false,
      tooltipStyle: {
        left: '0px',
        top: '0px'
      },
      // 跨域状态标志
      // hasCORSIssue: false,
      // 最后一次参数更新的时间戳，用于防止短时间内多次刷新
      lastParamUpdateTime: 0,
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
      isStartRun: true,
      isStartTrialRuning: false,
      isStartDynamicRun: false,
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
      prev_rect: null,
      originalImageWidth: 0,
      originalImageHeight: 0,
    }
  },
  mounted() {
    // 添加事件总线监听器，监听相机参数更新事件
    this.$baseEventBus.$on("cameraParamUpdated", this.refreshImageAfterParamChange);
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
    imgUrl(newVal) {
      if (newVal && this.viewer && !this.isCut) {
        this.$nextTick(() => {
          this.viewer.destroy();

          const viewerOptions = {
            inline: false,
            navbar: false,
            title: false,
            click: false,
            toggleOnDblClick: false,
            toggleOnTouch: false,
            // 设置背景为static，这样点击背景不会关闭预览
            backdrop: 'static',
            // 确保显示关闭按钮
            button: true,
            // 可选：禁用ESC键关闭预览
            keyboard: false,
            toolbar: {
              zoomIn: true,
              zoomOut: true,
              reset: true
            },
            viewed() {
              const viewerCanvasImg = document.querySelector('.viewer-canvas img');
              if (viewerCanvasImg) {
                viewerCanvasImg.style.imageRendering = 'pixelated';
              }
            }
          };

          this.viewer = new Viewer(this.$refs.viewer, viewerOptions);

          const image = this.$refs.viewer.querySelector('img');
          if (image) {
            image.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            };
          }

          // 确保在图像URL变化时，重新初始化Canvas，更新像素值显示
          this.imageLoaded = false; // 重置图像加载状态
          // 下一帧再初始化Canvas，确保DOM已更新
          this.$nextTick(() => {
            if (this.$refs.imageRef && this.$refs.imageRef.complete) {
              this.initCanvas();
            }
          });
        });
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
    //全屏显示图像
    handleFullScreen() {
      if (this.viewer) {
        this.viewer.destroy();
      }

      this.$nextTick(() => {
        const viewerOptions = {
          inline: false,
          navbar: false,
          title: false,
          // 设置背景为static，这样点击背景不会关闭预览
          backdrop: 'static',
          // 确保显示关闭按钮
          button: true,
          // 可选：禁用ESC键关闭预览
          keyboard: false,
          toolbar: {
            zoomIn: true,
            zoomOut: true,
            reset: true,
          },
          viewed() {
            const viewerCanvasImg = document.querySelector('.viewer-canvas img');
            if (viewerCanvasImg) {
              viewerCanvasImg.style.imageRendering = 'pixelated';
            }
          },
          // 添加关闭前的回调
          hide() {
            // 在隐藏前将焦点转移到预览按钮或其他元素
            setTimeout(() => {
              // 将焦点转移到按钮或组件外的元素
              const focusableElement = document.querySelector('.cropIconClass i.icon-lbznquanpinganniu');
              if (focusableElement) {
                focusableElement.focus();
              } else {
                document.body.focus();
              }
            }, 50);
          },
          hidden() {
            // 预览完全隐藏后执行的回调
            // 在这里可以做额外的cleanup工作
          }
        };

        // 初始化viewer并加入参数控制
        this.viewer = new Viewer(this.$refs.viewer, viewerOptions);

        // 添加自定义标记来阻止默认的aria-hidden行为
        const viewerElement = this.viewer.viewer;
        if (viewerElement) {
          viewerElement.setAttribute('data-prevent-aria-hidden', 'true');
        }

        // 添加事件监听器来纠正aria-hidden问题
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' &&
              mutation.attributeName === 'aria-hidden' &&
              mutation.target.getAttribute('aria-hidden') === 'true') {
              // 当aria-hidden被设置为true时,检查内部是否有焦点元素
              if (document.activeElement && mutation.target.contains(document.activeElement)) {
                // 如果有,将焦点移出并移除aria-hidden
                document.body.focus();
                mutation.target.removeAttribute('aria-hidden');
              }
            }
          });
        });

        if (viewerElement) {
          observer.observe(viewerElement, { attributes: true });

          // 保存observer以便后续清理
          this.viewer._observer = observer;
        }

        this.viewer.show();
      });
    },
    //初始化图片预览功能
    initViewer() {
      // 使用Vue挂载后的DOM引用初始化viewer，但不启用自动预览
      this.$nextTick(() => {
        if (this.viewer) {
          this.viewer.destroy();
        }

        const viewerOptions = {
          inline: false,
          navbar: false,
          title: false,
          // 重要：禁用点击图片触发预览
          click: false,
          // 禁用双击触发预览
          toggleOnDblClick: false,
          // 禁用移动设备上的触摸事件预览触发
          toggleOnTouch: false,
          // 设置背景为static，这样点击背景不会关闭预览
          backdrop: 'static',
          // 确保显示关闭按钮
          button: true,
          // 可选：禁用ESC键关闭预览
          keyboard: false,
          toolbar: {
            zoomIn: true,
            zoomOut: true,
            reset: true,
          },
          viewed() {
            // 添加自定义CSS到viewer生成的元素
            const viewerCanvasImg = document.querySelector('.viewer-canvas img');
            if (viewerCanvasImg) {
              viewerCanvasImg.style.imageRendering = 'pixelated';
            }
          }
        };

        // 初始化viewer时使用容器作为第一个参数，而不是直接使用图片
        this.viewer = new Viewer(this.$refs.viewer, viewerOptions);

        // 移除图片上的任何可能的点击事件监听器
        const image = this.$refs.viewer.querySelector('img');
        if (image) {
          image.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          };
        }
      });
    },
    // 添加新的图片加载处理函数
    onImageLoad() {
      console.log('图片加载完成');
      // 确保图片完全加载后才初始化Canvas
      this.$nextTick(() => {
        this.initCanvas();
      });
    },
    // 修改initCanvas方法，优化初始化逻辑
    initCanvas() {
      const image = this.$refs.imageRef;
      if (!image) {
        console.error('图像元素未找到');
        return;
      }

      if (!image.complete) {
        console.log('图片尚未加载完成，等待加载');
        image.onload = () => {
          console.log('图片onload事件触发');
          this.initCanvas();
        };
        return;
      }

      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        console.error('图片尺寸为0，无法初始化Canvas');
        return;
      }

      console.log('初始化Canvas，图片尺寸:', image.naturalWidth, 'x', image.naturalHeight);

      this.canvas = this.$refs.canvasRef;
      this.context = this.canvas.getContext('2d', { willReadFrequently: true });

      // 设置canvas大小与图片一致
      this.canvas.width = image.naturalWidth;
      this.canvas.height = image.naturalHeight;

      try {
        // 清空Canvas并重新绘制图像
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
        this.imageLoaded = true;
        console.log('Canvas绘制图像成功');

        // 检测图片是黑白还是彩色
        this.detectImageType();
      } catch (error) {
        console.error('初始化Canvas失败:', error);
        this.imageLoaded = false;
        // this.hasCORSIssue = true;
      }
    },
    // 检测图片是黑白还是彩色
    detectImageType() {
      // || this.hasCORSIssue
      if (!this.context) {
        this.isGrayscaleImage = false;
        return;
      }

      try {
        // 从图片中随机抽取多个像素点进行检查
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const sampleSize = Math.min(1000, this.canvas.width * this.canvas.height); // 最多检查1000个点
        const sampleInterval = Math.floor(data.length / 4 / sampleSize);

        let isAllPixelsEqual = true; // 用于检查是否所有像素的RGB值都完全相等

        for (let i = 0; i < sampleSize; i++) {
          const index = i * sampleInterval * 4;
          if (index >= data.length) break;

          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];

          // 只有当RGB三个通道完全相等时，才可能是灰度图
          // 即使是微小的差异也认为是彩色图
          if (r !== g || g !== b || r !== b) {
            isAllPixelsEqual = false;
            break;
          }
        }

        // 只有当所有采样点的RGB值都完全相等时，才判定为灰度图
        this.isGrayscaleImage = isAllPixelsEqual;

        console.log('图片类型检测结果：', this.isGrayscaleImage ? '黑白图' : '彩色图');

      } catch (error) {
        console.error('检测图片类型失败:', error);
        this.isGrayscaleImage = false; // 默认按彩色图处理
        // this.hasCORSIssue = true;
      }
    },
    // 修改handleMouseMove方法，优化坐标计算逻辑
    handleMouseMove(event) {
      if (!this.imageLoaded) {
        console.log('图像尚未加载完成，无法获取像素信息');
        return;
      }

      const image = this.$refs.imageRef;
      const rect = image.getBoundingClientRect();

      // 计算鼠标在图片上的相对位置
      const scaleX = image.naturalWidth / rect.width;
      const scaleY = image.naturalHeight / rect.height;

      const x = Math.floor((event.clientX - rect.left) * scaleX);
      const y = Math.floor((event.clientY - rect.top) * scaleY);

      // 确保坐标在图片范围内
      if (x >= 0 && x < image.naturalWidth && y >= 0 && y < image.naturalHeight) {
        this.mousePosition = { x, y };

        // if (!this.hasCORSIssue) {
        this.getPixelValues(x, y);
        // } else {
        //   console.warn('由于跨域限制，无法获取像素数据');
        // }

        this.showPixelInfo = true;

        // 设置悬浮提示的位置
        this.tooltipStyle = {
          left: (event.clientX - rect.left + 10) + 'px',
          top: (event.clientY - rect.top + 10) + 'px'
        };
      } else {
        this.showPixelInfo = false;
      }
    },
    // 优化getPixelValues方法，提高像素数据获取的准确性
    getPixelValues(x, y) {
      if (!this.context) {
        console.warn('Canvas上下文未初始化');
        return;
      }

      // if (this.hasCORSIssue) {
      //   console.warn('存在跨域问题，无法获取像素数据');
      //   return;
      // }

      // 确保坐标在有效范围内
      if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
        console.warn('坐标超出范围:', x, y, '画布尺寸:', this.canvas.width, 'x', this.canvas.height);
        return;
      }

      try {
        // 从canvas获取像素数据
        const pixel = this.context.getImageData(x, y, 1, 1).data;
        console.log('获取到像素数据:', x, y, '→', [pixel[0], pixel[1], pixel[2]]);

        // 保存RGB三通道值
        this.pixelValues = {
          r: pixel[0],
          g: pixel[1],
          b: pixel[2],
          gray: Math.round((pixel[0] + pixel[1] + pixel[2]) / 3)
        };

        // 注意：不再单独对灰色点进行处理，始终使用图像整体的类型决定显示方式
        // 这样确保全黑或全白的彩色图像将始终显示为RGB值
      } catch (error) {
        console.error('获取像素数据失败:', error);
        this.pixelValues = { r: 0, g: 0, b: 0, gray: 0 };
        // this.hasCORSIssue = true;
      }
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
          `${EventSourceUrl}/config/quality_trial_running_result`
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
          `${EventSourceUrl}/config/vpp_trial_running_result?algorithm_id=` + this.form.algorithm_id
        );
        let that = this;
        this.eventSource.onmessage = function (event) {
          let vppTrialRunningResult = JSON.parse(event.data);
          let resVppTrialRunningResult = vppTrialRunningResult.map(item => {
            let newItem = { ...item };
            if (typeof item.value === 'string' && !isNaN(item.value)) {
              newItem.value = Number(parseFloat(item.value).toFixed(3));
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
    //开启相机静态试运行
    handlePlay: _.debounce(function () {
      return new Promise((resolve, reject) => {
        this.isDisabled = true;
        this.isStartRun = false;
        if (this.form.camera_type == "Station") {
          this.startTrialRuningStation();
        } else if (this.form.camera_type == "Camera") {
          let addr = `${WebSocketBaseUrl}/hardware/trial_running_camera?ip=${this.form._camera.ip}&exposure_time=${this.form.exposure_time}&gain=${this.form.gain}`;
          this.ws = new WebSocket(addr);
          this.ws.onopen = (event) => {
            this.initViewer();
            this.isPause = true;
            this.isPlay = false;
            this.$message.success("相机试运行已开启！");
            // 添加时间戳参数来强制刷新图片
            const timestamp = new Date().getTime();
            this.imgUrl = `${EventSourceUrl}/view?ip=${this.form._camera.ip}&_t=${timestamp}`
            this.isDisabled = false;
            this.$emit('isUpdateCameraParams', true);
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
    }, 100),
    //停止相机试运行
    handlePause() {
      // 移除所有class为iframeClass的img元素，解决前端图像断流问题
      const imgElement = document.getElementById('runImg');
      if (imgElement) {
        imgElement.src = "";
      }

      return new Promise((resolve, reject) => {
        this.isDisabled = true;
        this.isStartRun = true;
        if (this.isStartDynamicRun) {
          //动态试运行
          stopDynamicTrialRuning()
            .then((res) => {
              this.$message.success("动态试运行已关闭！");
              this.isPause = false;
              this.isPlay = true;
              this.isStartRun = true;
              this.$emit('isUpdateOffsetParams', false);
              if (this.eventSource) {
                this.eventSource.close();
              }
              this.isDisabled = false;
              this.isStartDynamicRun = false;
              resolve(res);
            })
            .catch((err) => {
              this.isDisabled = false;
              reject(err);
            });
        } else {
          //静态试运行
          if (this.form.camera_type == "Station" && this.isPause) {
            stopTrialRuningStation()
              .then((res) => {
                this.$message.success("工位试运行已关闭！");
                this.isPause = false;
                this.isPlay = true;
                this.isStartRun = true;
                this.$emit('isUpdateCameraParams', false);
                if (this.eventSource) {
                  this.eventSource.close();
                }
                this.isDisabled = false;
                resolve(res);
              })
              .catch((err) => {
                this.isDisabled = false;
                reject(err);
              });
          } else if (this.form.camera_type == "Camera" && this.isPause) {
            this.ws.close();
            this.$message.success("相机试运行已关闭！");
            this.isPause = false;
            this.isPlay = true;
            this.isDisabled = false;
            this.$emit('isUpdateCameraParams', false);
            resolve();
          } else {
            this.isDisabled = false;
            resolve(); // 即使不需要停止，也要resolve Promise
          }
        }
      });
    },
    //启动工位静态试运行
    startTrialRuningStation: _.debounce(function (showSuccessMessage = true) {
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
          // 添加时间戳参数来强制刷新图片
          const timestamp = new Date().getTime();
          this.imgUrl = `${EventSourceUrl}/view?ip=${this.form._camera.ip}&_t=${timestamp}`;
          this.initViewer();
        }
        this.isPause = true;
        this.isPlay = false;
        this.isStartRun = false;
        this.$emit('isUpdateCameraParams', true);
      }).finally((res) => {
        this.isDisabled = false;
      });
    }, 100),
    //开启动态试运行
    handleDynamicPlay: _.debounce(function (showSuccessMessage = true) {
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
        offset: this.form.offset.toString(),
      };

      if (this.form["rect"]) {
        startinfo["camera_area"] = this.cameraRect.rect;
      }
      startDynamicTrialRuning(JSON.stringify(startinfo)).then((res) => {
        if (showSuccessMessage) {
          this.$message.success("动态试运行已开启！");
          // 添加时间戳参数来强制刷新图片
          const timestamp = new Date().getTime();
          this.imgUrl = `${EventSourceUrl}/view?ip=${this.form._camera.ip}&_t=${timestamp}`;
          this.initViewer();
        }
        this.isPause = true;
        this.isPlay = false;
        this.isStartRun = false;
        this.isStartDynamicRun = true;
        this.$emit('isUpdateOffsetParams', true);
      }).finally((res) => {
        this.isDisabled = false;
      });
    }, 100),
    //开启相机阈值试运行
    handleExuPlay: _.debounce(function () {
      if (this.isCut) {
        this.myCropper.destroy();
      }
      this.isCut = false;
      this.isDisabled = true;
      if (this.form.algorithm_type == "Ai") {
        this.startTrialRuning("Ai");
        // 添加时间戳参数来强制刷新图片
        const timestamp = new Date().getTime();
        this.imgUrl = `${EventSourceUrl}/view?ip=${this.form._camera.ip}&_t=${timestamp}`;
      }

      if (this.form.algorithm_type == "Size") {
        this.startTrialRuning("Size");
        // 添加时间戳参数来强制刷新图片
        const timestamp = new Date().getTime();
        this.imgUrl = `${EventSourceUrl}/view?ip=${this.form._camera.ip}&_t=${timestamp}`;
      }
    }, 100),
    //停止相机阈值试运行
    handleExuPause() {
      this.isDisabled = true;
      // 连接关闭时的处理
      this.stopTrialRuning();
    },
    //启动工位阈值试运行
    startTrialRuning: _.debounce(function (type) {
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
          this.isStartRun = false;
          this.qualityTrialRunningResult();
          this.$emit('setIsUpdateThresold', true);
          this.initViewer();
        }).finally((res) => {
          this.isDisabled = false;
        });
      }
    }, 100),
    //停止工位阈值试运行
    stopTrialRuning() {
      if (this.isPause) {
        stopTrialRuning({ algorithm_type: this.form.algorithm_type }).then((res) => {
          this.$message.success("阈值试运行已关闭！");
          this.isPause = false;
          this.isPlay = true;
          this.isStartTrialRuning = false;
          this.showMenuBtn = false;
          this.isStartRun = true;
          this.$emit('setIsUpdateThresold', false);
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
        // 先保存当前矩形框信息
        this.originalRect = this.cameraRect.rect ? { ...this.cameraRect.rect } : null;

        // 1. 先获取当前图像
        getLastDisplay({ ip: this.form._camera.ip }).then((res) => {
          let imageUrl = "";
          const uint8ArrayOfImageData = new Uint8Array(res.bytes);
          const blob = new Blob([uint8ArrayOfImageData], {
            type: "image/png",
          });
          imageUrl = URL.createObjectURL(blob);

          // 2. 获取到图像后再停止试运行
          this.handlePause().then(() => {
            // 3. 试运行停止后进入裁剪模式
            this.isCut = true;
            this.isStartRun = false;

            // 4. 设置图像URL
            this.imgUrl = imageUrl;

            // 5. 等待DOM更新后初始化裁剪器
            this.$nextTick(() => {
              this.initCropper();
            });
          }).catch(error => {
            console.error("停止试运行失败", error);
            this.$message.warning("停止试运行失败，请重试");
          });
        }).catch(error => {
          console.error("获取图像失败", error);
          this.$message.warning("获取当前图像失败，请重试");
        });
      }
    }, 500),
    // 新增initCropper方法，从setupCropper分离出裁剪器初始化逻辑
    initCropper() {
      if (!this.$refs.image) {
        console.error('裁剪图像元素未找到');
        return;
      }

      let _this = this;
      // 创建一个 Image 对象来获取原始图片尺寸
      const img = new Image();
      img.src = this.imgUrl;
      img.onload = () => {
        // 保存原始图片尺寸
        _this.originalImageWidth = img.naturalWidth;
        _this.originalImageHeight = img.naturalHeight;
        _this.myCropper = new Cropper(_this.$refs.image, {
          viewMode: 1,
          dragMode: "none",            // 禁止图片拖动
          preview: ".before",
          background: true,
          autoCropArea: 1,
          zoomOnWheel: false,
          zoomable: false,
          info: true,
          autoCrop: true,
          cropBoxMovable: false,       // 禁止拖动裁剪框
          cropBoxResizable: true,      // 允许修改裁剪框尺寸
          guides: true,                // 显示裁剪框内的十字辅助线
          center: true,                // 显示裁剪框中心的小方块
          toggleDragModeOnDblclick: false,//禁止双击拖动模式的切换
          ready: () => {
            _this.myCropper.setCropBoxData({
              left: 0,
              top: 0,
              width: _this.myCropper.getImageData().width,
              height: _this.myCropper.getImageData().height
            });
            _this.getCameraArea("origin");
          },
          cropend: (event) => {
            _this.getCameraArea("change");
            _this.isRectChanged();
          },
          crop: (event) => { },
        });
      };
    },
    //获取相机检测区域坐标参数
    getCameraArea(value) {
      const cropData = this.myCropper.getData();
      const imageData = this.myCropper.getImageData();

      // 计算当前显示图片相对于原始图片的缩放比例
      const scaleX = this.originalImageWidth / imageData.naturalWidth;
      const scaleY = this.originalImageHeight / imageData.naturalHeight;

      // 计算基于原始图片尺寸的坐标和尺寸
      let cameraArea = {
        x: Math.max(0, Math.round(cropData.x * scaleX)),
        y: Math.max(0, Math.round(cropData.y * scaleY)),
        width: Math.round(cropData.width * scaleX),
        height: Math.round(cropData.height * scaleY)
      };
      // console.log("🚀 ~ handleConfirmCamera ~ this.form.rect:", this.form.rect)
      // console.log("🚀 ~ getCameraArea ~ cameraArea:", cameraArea)
      // 如果不是第一次裁剪，需要加上之前累积的偏移量
      // if (this.originalRect) {
      //   cameraArea.x += this.originalRect.x;
      //   cameraArea.y += this.originalRect.y;
      // }
      if (value == 'change') {
        this.cameraRect.rect = cameraArea;
      } else {
        // 如果是第一次裁剪，需要将prev_rect置于null
        if (!this.originalRect) {
          this.originalRect = cameraArea;
          this.prev_rect = null;
        } else {
          this.prev_rect = this.form.rect;
        }
      }
    },
    // 判断矩形框是否被改变
    isRectChanged() {
      // 如果没有原始矩形框信息，认为改变
      if (!this.originalRect) return true;
      if (!this.cameraRect.rect) return true;
      // 比较两个矩形框是否相同
      return this.cameraRect.rect && this.originalRect &&
        (this.cameraRect.rect.width !== this.originalRect.width ||
          this.cameraRect.rect.height !== this.originalRect.height);
    },
    // 取消操作
    handleCancelCamera() {
      if (this.myCropper) {
        // 隐藏裁剪框
        this.myCropper.destroy();
        this.isCut = false;
        this.isStartRun = true;
      }
    },
    // 复原操作
    handleRestoreCamera() {
      // 仅在图像已经是小图且矩形框未改变时生效
      if (this.isCut) {
        this.$message.success('"图像尺寸已改变"可重启试运行观察效果！')
        this.cameraRect.rect = null; // 清空矩形框
        this.originalRect = null; // 清空矩形框
        // 关闭裁剪
        this.isCut = false;
        this.isStartRun = true;
      }
    },
    // 确定/完成操作
    handleConfirmCamera() {
      this.isStartRun = true;
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

      // 关闭裁剪
      if (this.myCropper) {
        this.isCut = false;
      }
      if (this.cameraRect.rect) {
        // console.log("🚀 ~ handleConfirmCamera ~ this.prev_rect:", this.prev_rect)
        // console.log("🚀 ~ handleConfirmCamera ~ this.form.rect:", this.form.rect)
        // console.log("🚀 ~ handleConfirmCamera ~ this.cameraRect.rect:", this.cameraRect.rect)

        this.$message.success('"图像尺寸已改变"可重启试运行观察效果！')
        //无镜像
        // let saveCameraInfo = {
        //   ip: this.form._camera.ip,
        //   rect: this.cameraRect ? this.cameraRect.rect : this.form.rect
        // };
        //可供vpp使用的裁剪坐标
        // setCameraRoi(saveCameraInfo).then(res => {
        //   this.form.rect = { ...res };
        // });
        //有镜像
        let saveMirrorCameraInfo = {
          ip: this.form._camera.ip,
          prev_rect: this.prev_rect,
          cur_rect: this.cameraRect.rect
        };
        // console.log("🚀 ~ handleConfirmCamera ~ saveMirrorCameraInfo:", saveMirrorCameraInfo)
        // 可供vpp使用的裁剪坐标
        setCameraRoi(saveMirrorCameraInfo).then(res => {
          this.form.rect = { ...res };
        });
      }
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
    // 添加一个新方法：当相机参数更新时刷新图像
    refreshImageAfterParamChange() {
      if (!this.isPause) return; // 只在试运行状态下刷新

      const now = Date.now();
      // 防止短时间内多次刷新
      if (now - this.lastParamUpdateTime < 300) return;
      this.lastParamUpdateTime = now;

      console.log('相机参数已更新，刷新图像和像素值显示');

      // 添加时间戳参数来强制重新加载图片
      const timestamp = new Date().getTime();
      const currentSrc = this.imgUrl.split('&_t=')[0]; // 移除旧的时间戳(如果有)
      this.imgUrl = `${currentSrc}&_t=${timestamp}`;

      // 重置canvas和相关数据，以便在图像加载后重新初始化
      this.imageLoaded = false;
      this.showPixelInfo = false;

      // 下一帧再初始化Canvas，确保DOM已更新
      this.$nextTick(() => {
        if (this.$refs.imageRef) {
          // 如果图片已加载完成，立即初始化Canvas
          if (this.$refs.imageRef.complete) {
            this.initCanvas();
          }
          // 否则等待图片加载完成后再初始化
        }
      });
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
    // 移除事件总线监听器
    this.$baseEventBus.$off("cameraParamUpdated");
    // 在组件销毁前清理viewer实例和observer
    if (this.viewer) {
      if (this.viewer._observer) {
        this.viewer._observer.disconnect();
        this.viewer._observer = null;
      }
      this.viewer.destroy();
    }
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

    .cut-txt {
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
        overflow-y: auto;
        padding: 30px 0px 10px 0px;
        display: flex;
        flex-direction: column;

        .cont-txt {
          font-size: 14px;
          text-align: left;
          font-family: PingFangSC-regular;
          padding-left: 5px;
          color: #000000;
          font-weight: 900;
          margin-bottom: 15px;

          p {
            margin-bottom: 20px;
          }
        }
      }
    }

    .pixel-canvas {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      pointer-events: none;
    }

    .pixel-value-tooltip {
      position: absolute;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 8px;
      border-radius: 3px;
      font-size: 14px;
      font-family: monospace;
      /* 等宽字体更适合显示数值 */
      white-space: nowrap;
      pointer-events: none;
      z-index: 999;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .pixel-perfect {
      image-rendering: pixelated;
      /* 现代浏览器 */
      image-rendering: crisp-edges;
      /* Firefox */
      image-rendering: -moz-crisp-edges;
      /* 旧版Firefox */
      image-rendering: -webkit-optimize-contrast;
      /* Safari */
      -ms-interpolation-mode: nearest-neighbor;
      /* IE */
      cursor: crosshair;
      /* 改为十字线光标更适合查看像素 */
      pointer-events: auto;
      /* 允许图片的鼠标事件 */
    }

    /* 重要：必须也应用到viewer.js生成的容器 */
    :deep(.viewer-canvas img) {
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      image-rendering: -moz-crisp-edges;
      image-rendering: -webkit-optimize-contrast;
      -ms-interpolation-mode: nearest-neighbor;
      /* 允许鼠标事件，以便获取鼠标位置 */
      pointer-events: auto !important;
    }

    /* 启用图片容器的点击事件，但禁止图片本身的点击事件 */
    .viewer-container div {
      pointer-events: auto;
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
