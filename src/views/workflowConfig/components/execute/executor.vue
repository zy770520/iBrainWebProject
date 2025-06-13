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
            <el-table-column prop="_executorObj.customName" label="出料口" width="200"
              show-overflow-tooltip></el-table-column>
            <el-table-column prop="priority" label="优先级" width="100"></el-table-column>
            <el-table-column prop="_state" label="动作条件" show-overflow-tooltip>
              <template slot-scope="scope">
                <a :class="getStateClass(scope.row)" class="state-txt">{{ scope.row['_state'] }}</a>
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
          <el-tab-pane v-for="v in tabDatas" :label="v.customName" :key="v.id" :name="`tab-${v.id}`">
            <div class="configForm">
              <formView :ref="`executorRef${v.id}`" @setStateText="setStateText"
                :activeTab="{ key: `tab-${v.id}`, name: v.customName }" @setDefaultState="setDefaultState"></formView>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { getEecutorsList } from '@/api/workflowConfig.js'
import formView from './executorForm.vue'

export default {
  name: "execute-executor",
  components: { formView },
  data() {
    return {
      tabDatas: [],
      activeName: null,
      overviewTableData: [],
      executing: {
        type: 'Executor', //Monitor:监控场景 ，Executor 质检场景
        inner: []
      },
    };
  },
  watch: {
  },
  created() { },
  computed: {},
  methods: {
    init(flowInfo) {
      console.log('flowInfo', flowInfo);
      let { executing } = flowInfo;
      if (executing != null) {
        this.executing = executing;
      } else {
        executing = this.executing;
      }
      this.executing['type'] = "Executor";
      this.$nextTick(() => {
        this.getEecutorsList();
      })
    },
    tableRowClassName({ row, rowIndex }) {
      return 'com-trColumn';
    },
    //获取执行配置列表
    getEecutorsList() {
      getEecutorsList().then(res => {
        let data = res || [];
        let innerBol = true;
        if (!this.executing['inner']) {
          console.log('走这里00000');
          this.executing['inner'] = [];
          innerBol = false;
        }
        data.forEach(v => {
          console.log("🚀 ~ getEecutorsList ~ v:", v)
          v['customName'] = `${v.name}(${v.slot}吹气口)`
          if (innerBol) {
            console.log('走这里11111');
            let _ids = [];
            let foundExecutors = new Set(); // 用于跟踪已找到的电磁阀ID

            // 先处理已存在的电磁阀
            this.executing['inner'].forEach((cv, ck) => {
              if (cv.executor_id == v.id && !_ids.includes(cv.executor_id)) {
                _ids.push(cv.executor_id)
                this.executing['inner'][ck]['_executorObj'] = v;
                foundExecutors.add(v.id); // 标记此电磁阀已被处理
              }
            })

            // 如果这个电磁阀在当前inner中不存在，则添加它
            if (!foundExecutors.has(v.id)) {
              console.log('添加新电磁阀:', v.id);
              this.executing.inner.push({
                _executorObj: v,
                executor_id: v.id, // 电磁阀id
                enable: false, // 是否启用
                priority: parseInt(v.slot.replace(/[^0-9]/g, '')), // 从slot中提取数字作为优先级
                name: '全部合格',
                ruleSetting: 'Qualified', // 默认设置为全部合格
                description: '', // 默认规则描述为空
                code: `var qualified = true;
                    for (var element of packets) {
                        if (element.result.camera_result !== "Qualified") {
                            qualified = false;
                            break;
                        }
                    }
                    qualified`, // 默认自定义代码为全部合格
              });
            }
          } else {
            console.log('走这里22222');
            this.executing.inner.push({
              _executorObj: v,
              executor_id: v.id,//电磁阀id
              enable: false,//是否启用
              priority: parseInt(v.slot.replace(/[^0-9]/g, '')), // 修改：从slot中提取数字作为优先级
              name: '全部合格',
              ruleSetting: 'Qualified', // 默认设置为全部合格
              description: '', // 默认规则描述为空
              code: `var qualified = true;
                    for (var element of packets) {
                        if (element.result.camera_result !== "Qualified") {
                            qualified = false;
                            break;
                        }
                    }
                    qualified`, // 默认自定义代码为全部合格
            });
          }
        })

        if (innerBol) {
          // 对电磁阀数组根据slot中的数字进行排序
          this.executing.inner.sort((a, b) => {
            // 从slot中提取数字并比较
            const slotNumA = parseInt(a._executorObj.slot.replace(/[^0-9]/g, ''));
            const slotNumB = parseInt(b._executorObj.slot.replace(/[^0-9]/g, ''));
            return slotNumA - slotNumB; // 升序排列
          });

          // 对tabDatas也进行相同的排序，确保标签顺序一致
          this.tabDatas = data.sort((a, b) => {
            const slotNumA = parseInt(a.slot.replace(/[^0-9]/g, ''));
            const slotNumB = parseInt(b.slot.replace(/[^0-9]/g, ''));
            return slotNumA - slotNumB;
          });

          this.overviewTableData = [];
          setTimeout(() => {
            this.executing.inner.forEach(v => {
              // 修改：不再使用getShowState函数，而是使用规则设定作为状态文本
              v['_state'] = this.getRuleSettingText(v);
              this.overviewTableData.push(v);
            })
            this.overviewTableData = [...(this.executing.inner.filter(item => item.enable))]
          });
        } else {
          // 对tabDatas进行排序
          this.tabDatas = data.sort((a, b) => {
            const slotNumA = parseInt(a.slot.replace(/[^0-9]/g, ''));
            const slotNumB = parseInt(b.slot.replace(/[^0-9]/g, ''));
            return slotNumA - slotNumB;
          });
        }

        // 不再需要单独赋值this.tabDatas = data，因为已经在上面赋值并排序
        if (this.tabDatas.length > 0) {
          this.activeName = `tab-${this.tabDatas[0].id}`;
        };
        let tabActiveIdList = data.map(item => { return { activeId: `tab-${item.id}` } });
        this.$nextTick(() => {
          console.log("🚀 ~ getEecutorsList ~ tabActiveIdList:", tabActiveIdList)
          tabActiveIdList.forEach(item => {
            this.handleClick({ name: item.activeId });
          })
        });
      })
    },
    getRuleSettingText(v) {
      // 获取规则设定和自定义规则描述
      let { ruleSetting } = v;
      // 根据规则设定返回对应的显示文本
      if (ruleSetting === 'Qualified') {
        return '全部合格';
      } else if (ruleSetting === 'Unqualified') {
        return '尺寸或厚度不合格';
      } else if (ruleSetting === 'quality') {
        return '外观不合格';
      } else if (ruleSetting === 'serious') {
        return '全部不合格';
      } else if (ruleSetting === 'custom') {
        return '规则自定义';
      } else {
        // 默认情况，直接返回规则设定的值
        return ruleSetting || '';
      }
    },
    // 根据规则设定获取对应的CSS类名
    getStateClass(row) {
      const ruleSetting = row.ruleSetting;
      if (ruleSetting === 'Qualified') {
        return 'state-qualified';
      } else if (ruleSetting === 'Unqualified') {
        return 'state-unqualified';
      } else if (ruleSetting === 'quality') {
        return 'state-quality';
      } else if (ruleSetting === 'serious') {
        return 'state-serious';
      } else if (ruleSetting === 'custom') {
        return 'state-custom';
      } else {
        return 'state-default';
      }
    },
    //tab点击
    handleClick(tab) {
      let { name } = tab;
      let id = name.split('-')[1];
      this.executing.inner.forEach((v, k) => {
        if (id == v['_executorObj'].id) {
          this.$nextTick(() => {
            this.$refs[`executorRef${id}`][0].init(this.executing.inner[k])
          })
        }
      })
    },
    setDefaultState({ executor_id, msg }) {
      this.setStateText({ executor_id, msg });
    },
    setStateText({ executor_id, msg }) {
      this.overviewTableData = [];
      setTimeout(() => {
        this.executing.inner.forEach(v => {
          v['_state'] = this.getRuleSettingText(v);
        })
        this.overviewTableData = [...(this.executing.inner.filter(item => item.enable))]
      });
    },
    configFormSubmit() {
      return new Promise(async (resolve, reject) => {
        let errorObj = null;

        // 确保所有电磁阀的优先级都有值
        for (const item of this.executing.inner) {
          if (!item.priority || item.priority.toString().trim() === '') {
            item.priority = item.slot.replace(/[^0-9]/g, '');
          }
        }

        // 先验证优先级是否唯一
        const priorityMap = new Map();
        for (const item of this.executing.inner) {
          const priority = Number(item.priority);
          if (!isNaN(priority)) {
            if (priorityMap.has(priority)) {
              // 发现重复的优先级
              this.$message({
                type: 'warning',
                message: `电磁阀 ${item._executorObj.name} 与 ${priorityMap.get(priority)} 的规则优先级 ${priority} 重复，请修改!`
              });

              // 激活有问题的tab
              this.activeName = `tab-${item.executor_id}`;
              this.handleClick({ name: this.activeName });

              reject({ msg: 'error', code: -200, data: null });
              return false;
            } else {
              priorityMap.set(priority, item._executorObj.name);
            }
          }
        }

        // 验证每个表单
        for (const item of this.executing.inner) {
          try {
            await this.$refs[`executorRef${item.executor_id}`][0].configFormSubmit();
          } catch (e) {
            if (!errorObj) {
              errorObj = e;

              // 激活有问题的tab
              this.activeName = `tab-${item.executor_id}`;
              this.handleClick({ name: this.activeName });

              break;
            }
          }
        }

        if (errorObj) {
          reject({ msg: 'error', code: -200, data: null });
          return false;
        }
        console.log('this.executing', this.executing);

        resolve({ msg: 'submit', code: 200, data: this.executing });
      })
    },
  },
};
</script>
<style lang="scss">
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
<style lang="scss">
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

      &.state-qualified {
        color: #67C23A; // 绿色 - 全部合格
      }

      &.state-unqualified {
        color: #E6A23C; // 橙色 - 尺寸或厚度不合格
      }

      &.state-quality {
        color: #F56C6C; // 红色 - 外观不合格
      }

      &.state-serious {
        color: #F56C6C; // 红色 - 全部不合格
      }

      &.state-custom {
        color: #409EFF; // 蓝色 - 自定义规则
      }

      &.state-default {
        color: #030303; // 默认黑色
      }
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
      border: 1px solid #FFB145;
      border-radius: 6px;
      padding: 10px;
      box-sizing: border-box;

      .el-form {
        .el-form-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 6px;

          .el-form-item__label {
            width: 110px;
            max-width: 110px;
            text-align: left;
          }

          .el-form-item__content {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;

            .el-input {
              width: 160px;
            }
          }

          &:last-child {
            margin-bottom: 0px;
          }
        }
      }
    }


  }

}
</style>