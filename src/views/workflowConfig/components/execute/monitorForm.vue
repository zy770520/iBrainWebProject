<template>
  <div style="width: 100%;height: 100%;">
    <el-form :model="formModel" ref="configFormRef">
      <el-row :gutter="5" style="display: flex;flex-direction: column;height: 100%;">
        <el-col :span="24">
          <el-row :gutter="24">
            <el-col :span="10">
              <el-form-item>
                <a slot="label" class="com-label">默认状态：</a>
                <el-select v-model="formModel.default_state.state" placeholder="默认状态" style="width: 56%;"
                  @change="setDefaultState">
                  <el-option v-for="v in defaultState" :key="v.key" :label="v.label" :value="v.key"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item v-if="formModel.default_state.state == 'Strobing'" prop="default_state.frequency"
                :rules="[{ required: true, message: '请输入频率', trigger: 'blur' }]">
                <a slot="label" class="com-label">频率：</a>
                <el-row :gutter="5">
                  <el-col :span="12"><el-input v-model="formModel.default_state.frequency"
                      placeholder="请输入频率"></el-input></el-col>
                  <el-col :span="2">Hz</el-col>
                </el-row>
              </el-form-item>
              <div v-else>&nbsp;</div>
            </el-col>
            <el-col :span="2">
              <el-form-item>
                <el-switch v-model="formModel.enable" active-color="#000" inactive-color="#CCC"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="24" style="flex:1">
          <div class="trigger-box">
            <div style="display: flex;align-items: center;">
              <a slot="label" class="com-label">触发动作：</a>
              <el-radio-group v-model="isChangeCameraAll" size="small" style="margin-left: 11px;"
                @change="changeCamera">
                <el-radio :label="1" class="btn-changeCamera">所有相机</el-radio>
                <el-radio :label="2" class="btn-changeCamera">单独配置</el-radio>
              </el-radio-group>
            </div>
            <el-row :gutter="5" class="trigger-action">
              <el-col :span="14" class="camera-config" v-if="ChangeCameraAllShow">
                <div class="camera-box">
                  <div class="action-tiem" v-for="(v, k) in formModel.conditions"
                    :class="{ delActive: delActionIndex === k }">
                    <div class="btn-del" @click="delTriggerAction(k)">
                      <i class="el-icon-remove-outline"></i>
                    </div>
                    <div class="operator">
                      <el-form-item prop="operator" v-if="k > 0">
                        <el-select v-model="v.operator" placeholder="">
                          <el-option label="&" value="And"></el-option>
                          <el-option label="||" value="Or"></el-option>
                        </el-select>
                      </el-form-item>
                    </div>
                    <div class="number">{{ k + 1 }}</div>
                    <div class="camera">
                      <el-form-item :prop="`conditions[${k}].camera.camera_id`"
                        :rules="[{ required: true, message: '请选择相机', trigger: 'change' }]">
                        <el-select v-model="v.camera.camera_id" placeholder="选择相机" @change="(v) => cameraChange(v, k)"
                          :disabled="v.camera.camera_id != ''">
                          <el-option v-for="(cv, cnk) in currentCameraList" :key="cv.id" :value="cv.id"
                            :label="cv.name"></el-option>
                        </el-select>
                      </el-form-item>
                    </div>
                    <div class="result">
                      <el-form-item prop="result">
                        <el-select v-model="v.result" :prop="`conditions[${k}].result`" placeholder=""
                          :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
                          <el-option label="合格" value="Qualified"></el-option>
                          <el-option label="不合格" value="Unqualified"></el-option>
                        </el-select>
                      </el-form-item>
                    </div>
                  </div>
                </div>
                <div @click="addTriggerAction" class="btn-add-trigger-action"><i
                    class="el-icon-circle-plus-outline"></i>新增动作条件</div>
              </el-col>
              <el-col ::span="14" class="camera-config" v-else>
                <div class="camera-box">
                  <el-form-item prop="result">
                    <a slot="label" class="com-label">所有相机：</a>
                    <el-select v-model="cameraAllResult" placeholder="">
                      <el-option label="合格" value="Qualified"></el-option>
                      <el-option label="不合格" value="Unqualified"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>

              <el-col :span="10" class="other-config">
                <el-row :gutter="5">
                  <el-col :span="24">
                    <el-form-item>
                      <a slot="label" class="com-label">动作：</a>
                      <el-select v-model="formModel.executing_state.state" placeholder="默认状态" style="width: 56%;">
                        <el-option v-for="v in actionOptions" :key="v.key" :label="v.label" :value="v.key"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item v-if="['Strobing', 'timerStrobing'].includes(formModel.executing_state.state)"
                      prop="executing_state.frequency" :rules="[{ required: true, message: '请输入频率', trigger: 'blur' }]">
                      <a slot="label" class="com-label">频率：</a>
                      <el-row :gutter="5">
                        <el-col :span="12"><el-input v-model="formModel.executing_state.frequency"
                            placeholder="请输入频率"></el-input></el-col>
                        <el-col :span="2">Hz</el-col>
                      </el-row>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item v-if="['timerStrobing', 'timerOpen'].includes(formModel.executing_state.state)"
                      prop="executing_state.limit" :rules="[{ required: true, message: '请输入定时时长', trigger: 'blur' }]">
                      <a slot="label" class="com-label">定时时长：</a>
                      <el-row :gutter="5">
                        <el-col :span="12"><el-input v-model="formModel.executing_state.limit"
                            placeholder="请输入定时时长"></el-input></el-col>
                        <el-col :span="2">ms</el-col>
                      </el-row>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "execute-form",
  components: {},
  props: {
    cameraList: {
      type: Array,
      default: () => []
    },
    activeTab: {
      type: Object,
      default: () => {
        return { key: 'red', name: '红灯' }
      }
    }
  },
  data() {
    return {
      ChangeCameraAllShow: true,
      isChangeCameraAll: 2,  //是否选择所有相机 1：是，2：否（单独配置）
      cameraAllResult: 'Qualified',  //isChangeCameraAll=1 生效
      formModel: {
        enable: true, //是否启用
        //默认状态参数
        default_state: {
          state: 'Open', //默认状态 Open为开启和频闪，Close为关闭
          frequency: null, //默认频率 非必填，如果没值传null
        },
        //触发动作条件参数
        conditions: [],
        //触发动作设置参数
        executing_state: {
          state: 'Open', //触发状态 Open为开启和频闪和定时频闪和定时点亮，Close为关闭
          frequency: '', //频率 非必填，如果没值传null，频闪和定时频闪必传
          limit: '', //定时时长 非必填 如果没值传null，定时点亮和定时频闪必传        
        }
      },
      camerasIds: [],
      selectCamerasIds: [],
      operatorList: [
        { value: 'And', label: '&' },
        { value: 'Or', label: '||' },
      ],
      delActionIndex: '',
      conditions: [],
      defaultState: [
        { key: 'Open', label: '点亮' },
        { key: 'Close', label: '关闭' },
        { key: 'Strobing', label: '频闪' },
      ],
      actionOptions: [
        { key: 'Open', label: '点亮' },
        { key: 'Close', label: '关闭' },
        { key: 'Strobing', label: '频闪' },
        { key: 'timerStrobing', label: '定时频闪' },
        { key: 'timerOpen', label: '定时点亮' },
      ],
      rules: {},
      currentCameraList: [],
      camerIds: [],
    };
  },
  watch: {
    cameraList: {
      handler(nv, ov) {
        this.currentCameraList = JSON.parse(JSON.stringify(nv));
      },
      deep: true
    },
    isChangeCameraAll(nv, ov) {
    }
  },
  created() { },
  computed: {},
  methods: {
    init(formData) {
      this.formModel = formData;
      this.camerIds = [];
      if (this.formModel['conditions'].length > 0) {
        this.formModel['conditions'].forEach(v => {
          if (v.camera != null) {
            this.camerIds.push(v.camera['camera_id']);
          } else {
            this.ChangeCameraAllShow = false;
            this.isChangeCameraAll = 1;
            this.cameraAllResult = v['result'];
          }
        })
      }
      this.$nextTick(() => {
        if (formData['conditions'].length == 0) {
          this.addTriggerAction();
        }
      })
    },
    setDefaultState(obj) {
      this.$emit('setDefaultState', obj);
    },
    //新增触发动作条件
    addTriggerAction() {
      let _currentCameraList = JSON.parse(JSON.stringify(this.cameraList));
      this.currentCameraList = [];
      _currentCameraList.forEach(v => {
        if (!this.camerIds.includes(v.id)) {
          this.currentCameraList.push(v);
        }
      });
      this.formModel.conditions.push(JSON.parse(JSON.stringify({
        camera: {
          camera_id: '', //相机id
          camera_type: '', //相机类型 如果此处是相机为Camera，如果此处是工位为Station
        }, //所有相机时camera为null
        result: 'Qualified', //检测结果  合格为Qualified，不合格为Unqualified
        operator: 'And', //逻辑运算符 &为And，||为Or, 只有一条触发动作时随便传
      })));
    },
    //删除相机
    delTriggerAction(index) {
      /* if(this.formModel.conditions.length<=1){
          this.$message({
              type: 'warning',
              message: `必须保留一条触发动作`
          });
          return false;
      } */
      this.delActionIndex = index;
      this.$confirm('去掉要删除此条触发条件?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.formModel.conditions.splice(index, 1);
        this.delActionIndex = '';
      }).catch(() => {
        this.delActionIndex = '';
      });
    },
    //相机选择
    cameraChange(val, index) {
      let cameraInfo = null;
      let cameraType = '';//相机类型 如果此处是相机为Camera，如果此处是工位为Station
      this.cameraList.forEach(v => {
        if (v.id == val) {
          cameraType = v.light.length > 0 ? 'Station' : 'Camera';
          cameraInfo = v;
        }
      });
      this.formModel.conditions[index]['_camera'] = cameraInfo;
      this.formModel.conditions[index]['camera']['camera_id'] = parseInt(val);
      this.formModel.conditions[index]['camera']['camera_type'] = cameraType;
      if (!this.camerIds.includes(val)) {
        this.camerIds.push(val);
      }
      let _currentCameraList = JSON.parse(JSON.stringify(this.cameraList));
      this.currentCameraList = [];
      _currentCameraList.forEach(v => {
        if (!this.camerIds.includes(v.id)) {
          this.currentCameraList.push(v);
        }
      })
    },
    //所有相机or单独配置
    changeCamera(v) {
      if (v == 2) {
        this.formModel.conditions = [];
        this.addTriggerAction();
        setTimeout(() => {
          this.ChangeCameraAllShow = true;
        }, 20);
      } else {
        this.camerIds = [];
        let _currentCameraList = JSON.parse(JSON.stringify(this.cameraList));
        this.currentCameraList = [];
        _currentCameraList.forEach(v => {
          this.currentCameraList.push(v);
        });
        this.ChangeCameraAllShow = false;
      };
    },
    configFormSubmit() {
      return new Promise((resolve, reject) => {
        if (this.isChangeCameraAll === 1) { //所有相机
          this.formModel['conditions'] = [
            {
              camera: null,
              result: this.cameraAllResult,
              operator: 'And',
            }
          ]
        };
        if (!this.formModel['conditions'] || this.formModel.conditions.length == 0) {
          this.$message({
            type: 'warning',
            message: `${this.activeTab['name']}，请增加至少1条触发动作!`
          });
          reject({ msg: false, code: -200, data: this.activeTab });
          return false;
        };
        this.$refs.configFormRef.validate((valid) => {
          if (valid) {
            resolve({ msg: 'submit', code: 200 })
          } else {
            this.$message({
              type: 'warning',
              message: `${this.activeTab['name']}，请完善执行参数配置!`
            });
            reject({ msg: 'error submit!!', code: -200, data: this.activeTab });
          };
        });
      });
    },
  }
}
</script>
<style lang="scss">
.btn-changeCamera {
  .el-radio__input.is-checked .el-radio__inner {
    background: #FFB145 !important;
    border-color: #FFB145 !important;
  }

  .el-radio__input.is-checked+.el-radio__label {
    color: #FFB145 !important;
  }
}
</style>
<style lang="scss" scoped>
.custom-row-gap .el-table__row {
  background-color: #000;
  padding-bottom: 10px;
  /* 设置行间距 */
}

.com-label {
  color: #000;
  font-weight: bold;
  min-width: 80px;
  font-size: 14px;
  text-align: right;
  display: contents;
}

.trigger-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.trigger-action {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  margin-top: 20px;
  flex: 1;

  .camera-config {
    height: 100%;
    height: 270px;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid #FFB145;
    border-radius: 6px;
    padding: 9px 0px !important;
    box-sizing: border-box;

    .el-form-item {
      margin-bottom: 0px !important;
    }
  }

  .other-config {
    border: 1px solid #FFB145;
    border-radius: 6px;
    padding: 9px 15px !important;
    margin-left: 20px;
  }
}

.btn-add-trigger-action {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: rgba(154, 154, 154, 1);
  font-size: 16px;
  padding: 10px 0px;
  padding-left: 115px;

  .el-icon-circle-plus-outline {
    font-size: 23px;
    margin-right: 5px;
  }
}

.camera-box {
  width: 100%;
  flex: 1;
  overflow: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 0 9px;

  .action-tiem {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    gap: 10px;
    margin-bottom: 20px;
    border-radius: 8px;

    &:last-child {
      margin-bottom: 0px;
    }

    &.delActive {
      .btn-del {
        color: red;
      }

      background-color: #ebebeb;
    }

    .btn-del {
      width: 30px;
      display: flex;
      align-items: center;
      color: #BEBEBE;
      cursor: pointer;
      font-size: 28px;

      &:hover {
        color: red;
      }
    }

    .operator {
      width: 60px;
    }

    .number {
      width: 15px;
      text-align: center;
      font-weight: bold;
      color: #000;
    }

    .camera {
      flex: 1;
    }

    .result {
      width: 90px;
    }
  }
}
</style>