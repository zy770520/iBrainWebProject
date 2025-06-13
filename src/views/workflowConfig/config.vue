<template>
  <div class="config-layout">
    <div class="video-streaming">
      <div v-if="cropShow &&
        (flowItemInfo.type == 'camera' || flowItemInfo.type == 'threshold' || flowItemInfo.type == 'motorLink')"
        style="width: 100%; height: 100%">
        <crop ref="crop" @setIsUpdateThresold="getIsUpdateThresold"></crop>
      </div>
      <draw ref="draw" v-if="flowItemInfo.type == 'model' &&
        type == 'Quality' &&
        workflow.algorithm_type == 'Size'
      " />
    </div>
    <div class="config-box">
      <template v-if="flowItemInfo">
        <cameraExecutorConfig v-if="flowItemInfo.type == 'camera'" ref="cameraConfigRef"
          @submitConfig="cameraSubmitConfig" :configType="type">
        </cameraExecutorConfig>
        <modConfig ref="modConfigRef" @submitConfig="modelSubmitConfig" @changeDraw="changeDraw"
          v-if="flowItemInfo.type == 'model'"></modConfig>
        <modConfig ref="thresholdRef" @submitConfig="thresholdSubmitConfig" v-if="flowItemInfo.type == 'threshold'"
          :isUpdateThresoldParams="isUpdateThresoldParams">
        </modConfig>
        <motorLinkConfig v-if="flowItemInfo.type == 'motorLink'" ref="motorLinkConfigRef"></motorLinkConfig>
      </template>
    </div>
  </div>
</template>

<script>
import cameraMonitorConfig from "./components/config/cameraMonitor.vue";
import cameraExecutorConfig from "./components/config/cameraExecutor.vue";
import modConfig from "./components/config/model.vue";
// import crop from "@/views/crop/cropTempory.vue";
// import crop from "@/views/crop/cropTempory copy 3.vue";
import crop from "@/views/crop/cropTempory copy 4.vue";
import draw from "@/views/crop/draw.vue";
import motorLinkConfig from "./components/hardware/motorLink.vue";
export default {
  name: "config",
  components: {
    cameraMonitorConfig,
    cameraExecutorConfig,
    modConfig,
    crop,
    draw,
    motorLinkConfig
  },
  data() {
    return {
      workflowAll: [],
      flowItemInfo: {}, //当前点击流程{type:'camera',name:'相机'},{type:'model',name:'模型'},{type:'threshold',name:'阈值'}
      workflow: {},
      type: "Monitor", //Monitor:监控场景 Quality 质检场景
      comFlow: {}, //当前选中的一条流程item
      cropShow: false,
      isUpdateThresoldParams: false,
    };
  },
  watch: {},
  created() { },
  computed: {},
  methods: {
    init({ flowInfo, workflow, workflowAll, type, comFlow }) {
      console.log("🚀 ~ init ~ flowInfo:", flowInfo)
      console.log("🚀 ~ init ~ workflow:", workflow)
      console.log("🚀 ~ init ~ type:", type)
      console.log("🚀 ~ init ~ comFlow:", comFlow)
      this.workflowAll = workflowAll;
      this.flowItemInfo = flowInfo;
      this.workflow = workflow;
      this.type = type;
      this.comFlow = comFlow;
      this.cropShow = false;

      if (flowInfo.type == "camera") {
        this.initCamera();
        this.initCrop();
      }
      if (flowInfo.type == "model") {
        this.initModel();
        this.initCrop();
      }
      if (flowInfo.type == "threshold") {
        this.initThreshold();
        this.initCrop();
      }
      if (flowInfo.type == "motorLink") {
        this.initMotor();
        this.initCrop();
      }
    },
    changeDraw(arrayBuffer) {
      this.$nextTick(() => {
        if (this.$refs.draw) {
          this.$refs.draw.init(arrayBuffer);
        }
      });
    },
    //相机配置
    initCamera() {
      this.$nextTick(() => {
        this.$refs.cameraConfigRef.init(this.workflow, this.workflowAll);
      });
    },
    //相机配置确定提交
    cameraSubmitConfig(bol) {
      if (bol) {
        this.flowItemInfo = { type: "model", name: "模型" };
        this.comFlow["step"] = 2;
        this.initModel();
      }
    },
    //模型配置
    initModel() {
      this.$nextTick(() => {
        this.$refs.modConfigRef.type = 1;
        this.$refs.modConfigRef.init(this.workflow, this.type);
        this.comFlow["step"] = 2;
      });
    },
    //模型提交
    modelSubmitConfig(bol) {
      if (bol) {
        console.log('模型提交');
        this.flowItemInfo = { type: "threshold", name: "阈值" };
        // this.comFlow["step"] = 3;
        this.initCrop();
        // this.initThreshold();
      }
    },
    //阈值配置
    initThreshold() {
      this.$nextTick(() => {
        this.$refs.thresholdRef.type = 2;
        this.$refs.thresholdRef.init(this.workflow, this.type);
        this.comFlow["step"] = 3;
      });
    },
    //阈值提交
    thresholdSubmitConfig(bol) {
      if (bol) {
        this.comFlow["state"] = 1;
      }
    },
    //电机配置
    initMotor() {
      this.$nextTick(() => {
        this.$refs.motorLinkConfigRef.init(this.workflow, this.type);
      });
    },
    //相机初始化
    initCrop() {
      console.log('flowItemInfoflowItemInfo', this.flowItemInfo);
      setTimeout(() => {
        this.cropShow = true;
        if (this.cropShow) {
          this.$nextTick(() => {
            // console.log('this.$refs.crop.init', this.$refs.crop.init());
            if (this.$refs.crop) {
              console.log('cropcropcropcrop');
              this.$refs.crop.init(
                this.workflow,
                this.comFlow,
                this.flowItemInfo,
                this.type
              );
            }
          });
        }
      }, 500);
    },
    //试运行时实时更新阈值参数
    getIsUpdateThresold(value) {
      this.isUpdateThresoldParams = value;
    },
  },
};
</script>

<style lang="scss" scoped>
.config-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #fff;
  border-radius: 10px 0px 0px 10px;
  border-left: 3px solid rgba(255, 177, 69, 1);
  box-shadow: -13px 14px 15px -4px rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
  padding: 9px 24px;

  .video-streaming {
    height: 40.05%;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
    margin-bottom: 10px;
  }

  .config-box {
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
    padding: 9px 16px;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
  }
}
</style>
