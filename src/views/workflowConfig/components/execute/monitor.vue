<template>
  <div class="execution-layout">
    <div class="execution-overview-table">
      <div class="box-header">
        <el-row type="flex" align="middle">
          <el-col :span="4">
            <div class="label">执行总览表</div>
          </el-col>
        </el-row>
      </div>
      <div class="box-body">
        <div style="width: 100%;height: 100%;background-color: #ccc;overflow: hidden;">
          <el-table :data="overviewTableData" class="custom-row-gap" height="100%" :row-class-name="tableRowClassName"
            style="width: 100%">
            <el-table-column prop="number" label="序号" width="100">
              <template slot-scope="scope">
                <div class="number-box-call">
                  <div class="number-icon">
                    <svg class="icon"
                      style="width: 100%;height:100%;vertical-align: middle;fill: currentColor;overflow: hidden;"
                      viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4917">
                      <path
                        d="M918.208 424.96L207.04 13.824C139.456-25.088 55.488 23.552 55.488 101.376v821.76c0 77.824 83.968 125.952 151.04 87.04l711.68-410.624c67.072-38.912 67.072-136.192 0-174.592z"
                        p-id="4918"></path>
                    </svg>
                  </div>
                  <div class="number-txt">{{ scope.$index + 1 }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="triColorLight" label="三色灯" show-overflow-tooltip></el-table-column>
            <el-table-column prop="state" label="状态" show-overflow-tooltip>
              <template slot-scope="scope">
                <a class="state-txt" v-if="scope.row.state == 'Open'">默认点亮</a>
                <a class="state-txt" v-if="scope.row.state == 'Close'">默认关闭</a>
                <a class="state-txt" v-if="scope.row.state == 'Strobing'">默认频闪</a>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="config-box">
      <div class="box-header">
        <el-row type="flex" align="middle">
          <el-col :span="4">
            <div class="label">执行配置</div>
          </el-col>
        </el-row>
      </div>
      <div class="box-body">
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane label="红灯" name="red">
            <div class="configForm">
              <formView ref="redRef" :activeTab="{ key: 'red', name: '红灯' }" :cameraList="cameraList"
                @setDefaultState="setDefaultState"></formView>
            </div>
          </el-tab-pane>
          <el-tab-pane label="黄灯" name="yellow">
            <div class="configForm">
              <formView ref="yellowRef" :activeTab="{ key: 'yellow', name: '黄灯' }" :cameraList="cameraList"
                @setDefaultState="setDefaultState"></formView>
            </div>
          </el-tab-pane>
          <el-tab-pane label="绿灯" name="green">
            <div class="configForm">
              <formView ref="greenRef" :activeTab="{ key: 'green', name: '绿灯' }" :cameraList="cameraList"
                @setDefaultState="setDefaultState"></formView>
            </div>
          </el-tab-pane>
          <el-tab-pane label="蜂鸣" name="buzzer">
            <div class="configForm">
              <formView ref="buzzerRef" :activeTab="{ key: 'buzzer', name: '蜂鸣' }" :cameraList="cameraList"
                @setDefaultState="setDefaultState"></formView>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { cameras } from '@/api/workflowConfig.js'
import formView from './monitorForm.vue'
const defFormModel = {
  enable: true, //是否启用
  //默认状态参数
  default_state: {
    state: 'Open', //默认状态 Open为开启和频闪，Close为关闭
    frequency: '', //默认频率 非必填，如果没值传null
  },
  //触发动作条件参数
  conditions: [],
  //触发动作设置参数
  executing_state: {
    state: 'Open', //触发状态 Open为开启和频闪和定时频闪和定时点亮，Close为关闭
    frequency: '', //频率 非必填，如果没值传null，频闪和定时频闪必传
    limit: '', //定时时长 非必填 如果没值传null，定时点亮和定时频闪必传
  }
}
export default {
  name: "execute-monitor",
  components: { formView },
  data() {
    return {
      cameraList: [],
      camerasIds: [],
      tabActiveName: '',
      selectCamerasIds: [],
      activeName: 'red',
      overviewTableData: [
        { key: 'red', triColorLight: '红灯', state: 'Open', frequency: '' },
        { key: 'yellow', triColorLight: '黄灯', state: 'Open', frequency: '' },
        { key: 'green', triColorLight: '绿灯', state: 'Open', frequency: '' },
        { key: 'buzzer', triColorLight: '蜂鸣', state: 'Open', frequency: '' },
      ],
      workflow: null,
      id: 0,
      operatorList: [
        { value: 'And', label: '&' },
        { value: 'Or', label: '||' },
      ],
      delActionIndex: '',
      conditions: [],
      executing: {
        type: 'Monitor', //Monitor:监控场景 Quality 质检场景
        //绿灯参数
        green: null,
        //黄灯参数
        yellow: null,
        //红灯参数
        red: null,
        //蜂鸣
        buzzer: null,
      },
      flowInfoExecuting: null,
      rules: {}
    };
  },
  watch: {},
  created() { },
  computed: {},
  methods: {
    init(flowInfo) {
      let { id, type, workflow, executing } = flowInfo;
      this.id = id || 0;
      if (executing != null) {
        this.executing = executing;
      } else {
        executing = this.executing;
      }

      this.executing['type'] = type;
      this.cameraList = [];
      this.camerasIds = [];
      (workflow || []).forEach(v => {
        this.camerasIds.push(v['camera_id']);
      })

      this.$nextTick(() => {
        this.getCamerasList();
        this.handleClick({ name: 'red' })
      })
    },
    tableRowClassName({ row, rowIndex }) {
      return 'com-trColumn';
    },
    //获取相机列表
    getCamerasList() {
      this.loading = false;
      cameras().then(res => {
        let data = res || [];
        if (data.length) {
          data.forEach((v, k) => {
            let _v = v;
            _v['_customName'] = (v['light'] || []).length > 0 ? `${v.name}(${v.controller_id}号飞拍)` : `${v.name}(${v.controller_id}号飞拍${v.slot}号接口)`;
            if (this.camerasIds.includes(_v['id'])) {
              this.cameraList.push(_v);
            }
          });
        }
      })
    },
    //三色灯tab点击
    handleClick(tab) {
      let { name } = tab;
      this.tabActiveName = name;
      if (this.executing[name]) {
        this.$nextTick(() => {
          this.$refs[`${name}Ref`].init(this.executing[name]);
        })
      } else {
        this.executing[name] = JSON.parse(JSON.stringify(defFormModel));
        this.$nextTick(() => {
          this.$refs[`${name}Ref`].init(this.executing[name], name);
        })
      }
    },
    setDefaultState(val) {
      this.overviewTableData.forEach((v, k) => {
        if (v.key == this.tabActiveName) {
          this.overviewTableData[k]['state'] = val;
        };
      });
    },
    configFormSubmit() {
      return new Promise(async (resolve, reject) => {
        let errorObj = null;
        await this.$refs.redRef.configFormSubmit().catch(e => {
          !errorObj && (errorObj = e);
        });
        await this.$refs.yellowRef.configFormSubmit().catch(e => {
          !errorObj && (errorObj = e);
        });
        await this.$refs.greenRef.configFormSubmit().catch(e => {
          !errorObj && (errorObj = e);
        });
        await this.$refs.buzzerRef.configFormSubmit().catch(e => {
          !errorObj && (errorObj = e);
        });
        if (errorObj) {
          let { data: { key, name } } = errorObj
          this.activeName = key;
          this.handleClick({ name: key })
          reject({ msg: 'error', code: -200, data: null });
          return false;
        }
        resolve({ msg: 'submit', code: 200, data: this.executing })
        /*  */

        /* if(this.conditions.length<=1){
            reject({msg:false,code:-200})
            return false;
        }
        this.$refs.configFormRef.validate((valid) => {
          if (valid) {
            resolve({msg:'submit',code:200})
          } else {
            reject({msg:'error submit!!',code:-200})
          }
        }); */
      })
    },
  },
};
</script>
<style>
.el-table .com-trColumn {
  margin-bottom: 1px;
}

.el-table .com-trColumn td {
  background: #FFF !important;
  padding: 8px 0;
}

.el-table .com-trColumn .cell {
  background: #F5F5F5 !important;
  height: 38px;
  line-height: 38px;
}
</style>
<style lang="scss" scoped>
.execution-layout {
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



  .box-header {
    .label {
      font-size: 20px;
      font-weight: 600;
    }

    margin-bottom: 36px;
  }

  .box-body {
    flex: 1;

    .el-tabs {
      display: flex;
      flex-direction: column;
      height: 100%;

      .el-tab-pane {
        flex: 1;
        padding: 5px;
        box-sizing: border-box;
      }
    }

  }


  .execution-overview-table {
    height: 40.05%;
    box-sizing: border-box;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .number-box-call {
      position: relative;
      width: 100%;
      height: 47px;
    }

    .state-txt {
      color: #030303;
      font-weight: bold;
    }

    .number-txt {
      position: absolute;
      width: 100px;
      height: 47px;
      top: 0px;
      left: 0px;
      color: #FFF;
      line-height: 40px;
      z-index: 2;
    }

    .number-icon {
      position: absolute;
      width: 100px;
      height: 150px;
      top: -30px;
      left: -58px;
      transform: rotate(90deg);
      z-index: 1;
    }

    ;

    .box-header {
      margin-bottom: 33px;
    }

    .box-body {
      height: calc(100% - 83px);

    }
  }

  .config-box {
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
    padding: 9px 16px;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
    display: flex;
    flex-direction: column;

    .box-header {
      margin-bottom: 10px;
    }

    .box-body {
      display: flex;
      flex-direction: column;
    }

    .configForm {
      width: 100%;
      height: 100%;

      .el-form {
        width: 100%;
        height: 100%;
      }

      /* .el-row{
            display: flex;
            flex-direction: column;
            height: 100%;
          } */
    }


  }

}
</style>