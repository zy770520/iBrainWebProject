<template>
  <div style="width: 100%;height: 100%;">
    <el-form :model="formModel" ref="configFormRef" :rules="rules">
      <el-form-item>
        <a slot="label" class="com-label">规则使能：</a>
        <el-switch v-model="formModel.enable" active-color="#000" inactive-color="#CCC"
          @change="setDefaultState"></el-switch>
      </el-form-item>
      <el-form-item prop="priority">
        <a slot="label" class="com-label">规则优先级：</a>
        <el-input v-model="formModel.priority" placeholder="请输入1-99" type="number" min="1" max="99"
          @change="handlePriorityChange" @blur="handlePriorityBlur">
        </el-input>
        <!-- v-if="showPriorityHint" -->
        <div class="priority-hint">
          <span>每个电磁阀的优先级不能重复，数值范围为1-99</span>
        </div>
      </el-form-item>
      <el-form-item>
        <a slot="label" class="com-label">规则设定：</a>
        <el-select v-model="formModel.ruleSetting" placeholder="请选择规则设定" @change="ruleSettingChange">
          <el-option label="全部合格" value="Qualified"></el-option>
          <el-option label="尺寸或厚度不合格" value="Unqualified"></el-option>
          <el-option label="外观不合格" value="quality"></el-option>
          <el-option label="全部不合格" value="serious"></el-option>
          <el-option label="规则自定义" value="custom"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <a slot="label" class="com-label">规则名称：</a>
        <div class="code-editor-wrapper">
          <el-input type="text" disabled v-model="formModel.name" placeholder="请输入规则名称"></el-input>
        </div>
      </el-form-item>
      <!-- 自定义规则JS代码输入区域 -->
      <div class="custom-rule-code">
        <el-form-item>
          <a slot="label" class="com-label">规则描述：</a>
          <div class="code-editor-wrapper">
            <el-input type="text" v-model="formModel.description" placeholder="请输入规则描述"
              @change="handleDescriptionChange"></el-input>
          </div>
        </el-form-item>
        <el-form-item>
          <a slot="label" class="com-label">规则代码：</a>
          <div class="code-editor-wrapper">
            <el-input type="textarea" :rows="8" v-model="formModel.code" placeholder="请输入JavaScript代码"
              class="code-editor" :readonly="formModel.ruleSetting !== 'custom'"></el-input>
            <el-button type="primary" @click="validateJSCode" :loading="validating">验证代码</el-button>
            <div v-if="formModel.ruleSetting !== 'custom'" class="code-tip">
              <span>当前使用预设规则，如需编辑代码请选择"规则自定义"</span>
            </div>
          </div>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import { checkJsCode } from '@/api/workflowConfig.js'

export default {
  name: "execute-form",
  components: {},
  props: {
    activeTab: {
      type: Object,
      default: () => {
        return { key: 'tab-0', name: '' }
      }
    },
    // 接收所有已存在的规则优先级列表，用于校验优先级不重复
    existingPriorities: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // 自定义验证规则：检查优先级是否重复并且在1-99范围内
    const validatePriority = (rule, value, callback) => {
      // 如果值为空，自动使用电磁阀slot
      if (!value || value.toString().trim() === '') {
        this.formModel.priority = this.formModel._executorObj.slot.replace(/[^0-9]/g, '');
        value = this.formModel.priority; // 更新value以便后续验证
      }

      // 将输入转换为数字进行比较
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return callback(new Error('优先级必须是数字'));
      }

      // 验证是否在1-99范围内
      if (numValue < 1 || numValue > 99) {
        return callback(new Error('优先级必须在1到99之间'));
      }

      // 检查是否与已有优先级重复
      // 排除当前编辑项本身的优先级
      const currentId = this.formModel.executor_id;
      // 获取所有电磁阀的优先级列表（排除当前正在编辑的电磁阀）
      const priorityList = this.getPriorityList(currentId);

      if (priorityList.includes(numValue)) {
        return callback(new Error('该优先级已被使用，请输入其他数值'));
      }

      callback();
    };

    return {
      formModel: {
        controller_id: '',
        enable: false, //是否启用
        priority: '',
        ruleSetting: 'Qualified',
        name: '',
        description: '',
        code: '',
      },
      // 存储各种规则对应的代码
      ruleCodes: {
        'Qualified': `var qualified = true;

                      for (var element of packets) {
                          if (element.result.camera_result !== "Qualified") {
                              qualified = false;
                              break;
                          }
                      }

                      qualified`,
        'Unqualified': `var result = false;

                      for (var element of packets) {
                          if (element.result.camera_result === "NotDetected") {
                              result = false;
                              break;
                          }

                          if (element.type === "Size" || element.type === "Thick") {
                              if (element.result.camera_result === "Unqualified") {
                                  result = true;
                              }
                          }
                      }

                      result`,
        'quality': `var result = false;

                    for (var element of packets) {
                        if (element.result.camera_result === "NotDetected") {
                            result = false;
                            break;
                        }

                        if (element.type === "Surface" && element.result.camera_result === "Unqualified") {
                            result = true;
                        }
                    }

                    result`,
        'serious': `var unqualified = true;

                    for (var element of packets) {
                        if (element.result.camera_result !== "Unqualified") {
                            unqualified = false;
                            break;
                        }
                    }

                    unqualified`,
        'custom': ''
      },
      rules: {
        priority: [
          { required: true, message: '请输入规则优先级', trigger: 'blur' },
          { validator: validatePriority, trigger: 'blur' }
        ]
      },
      // JS代码验证相关
      validating: false,
      // 保存用户输入的自定义代码
      userCustomCode: '',
      // 添加保存用户输入的自定义规则描述
      userRuleDescription: '',
      showPriorityHint: false, // 是否显示优先级提示
    };
  },
  watch: {
  },
  created() { },
  computed: {},
  methods: {
    init(formData) {
      this.formModel = formData;
      if (this.formModel.name == '全部合格') {
        this.formModel.ruleSetting = 'Qualified';
      } else if (this.formModel.name == '尺寸或厚度不合格') {
        this.formModel.ruleSetting = 'Unqualified';
      } else if (this.formModel.name == '外观不合格') {
        this.formModel.ruleSetting = 'quality';
      } else if (this.formModel.name == '全部不合格') {
        this.formModel.ruleSetting = 'serious';
      } else if (this.formModel.name == '规则自定义') {
        this.formModel.ruleSetting = 'custom';
      }
    },
    // 查找匹配的规则
    findMatchingRule(code) {
      for (const [key, value] of Object.entries(this.ruleCodes)) {
        if (key !== 'custom' && code === value) {
          return key;
        }
      }
      return null;
    },
    // JS代码验证方法
    validateJSCode() {
      return new Promise((resolve, reject) => {
        if (!this.formModel.code || !this.formModel.code.trim()) {
          this.$message.warning('请输入需要验证的代码');
          reject(new Error('代码为空'));
          return;
        }

        // 如果是自定义规则，保存用户输入的代码和描述
        if (this.formModel.ruleSetting === 'custom') {
          this.userCustomCode = this.formModel.code;
          this.userRuleDescription = this.formModel.description || '';
        }

        this.validating = true;

        // 发送纯文本格式的请求验证代码
        checkJsCode(this.formModel.code)
          .then(res => {
            this.validating = false;
            this.$message.success('代码验证通过');
            resolve(true);
          })
          .catch(error => {
            this.validating = false;
            this.$message.warning(`${this.activeTab['name']}电磁阀触发条件代码存在错误，无法保存`);
            reject(error);
          });
      });
    },
    // 修改规则设定的选择事件
    ruleSettingChange(value) {
      // 先保存用户输入的自定义代码，以便后续使用
      // if (this.formModel.ruleSetting === 'custom') {
      //   this.userCustomCode = this.formModel.code;
      //   this.userRuleDescription = this.formModel.description || '';
      // }

      if (value == 'Qualified') {
        this.formModel.name = '全部合格';
        this.formModel.code = this.ruleCodes['Qualified'];
      } else if (value == 'Unqualified') {
        this.formModel.name = '尺寸或厚度不合格';
        this.formModel.code = this.ruleCodes['Unqualified'];
      } else if (value == 'quality') {
        this.formModel.name = '外观不合格';
        this.formModel.code = this.ruleCodes['quality'];
      } else if (value == 'serious') {
        this.formModel.name = '全部不合格';
        this.formModel.code = this.ruleCodes['serious'];
      } else if (value == 'custom') {
        this.formModel.name = '规则自定义';
        // 如果之前有用户输入的自定义代码，则恢复
        this.formModel.code = '';
        // this.formModel.description = this.userRuleDescription || '';
      }
      // 通知父组件更新状态显示
      this.$emit('setStateText', { executor_id: this.formModel.executor_id });
    },
    //设置总览表是否显示
    setDefaultState(obj) {
      this.$emit('setStateText', { executor_id: this.formModel['executor_id'] })
    },
    // 获取所有电磁阀的优先级列表（除了当前正在编辑的）
    getPriorityList(currentId) {
      const priorityList = [];
      if (this.$parent && this.$parent.executing && this.$parent.executing.inner) {
        this.$parent.executing.inner.forEach(item => {
          if (item.executor_id !== currentId && item.priority) {
            const priorityNum = Number(item.priority);
            if (!isNaN(priorityNum)) {
              priorityList.push(priorityNum);
            }
          }
        });
      }
      return priorityList;
    },
    // 处理优先级变更
    handlePriorityChange(value) {
      // 显示优先级提示
      this.showPriorityHint = true;

      // 当用户输入为空时，使用电磁阀id作为默认值
      if (!value || value.trim() === '') {
        this.formModel.priority = this.formModel._executorObj.slot.replace(/[^0-9]/g, '');
        setTimeout(() => {
          this.showPriorityHint = false;
        }, 2000);
        return;
      }

      // 确保值在1-99范围内
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        if (numValue < 1) {
          this.formModel.priority = '1';
        } else if (numValue > 99) {
          this.formModel.priority = '99';
        }
      }

      // 5秒后隐藏提示
      setTimeout(() => {
        this.showPriorityHint = false;
      }, 2000);
    },
    // 处理优先级输入框失焦
    handlePriorityBlur() {
      // 当输入为空时，使用电磁阀id作为默认值
      if (!this.formModel.priority || this.formModel.priority.toString().trim() === '') {
        this.formModel.priority = this.formModel._executorObj.slot.replace(/[^0-9]/g, '');
        this.showPriorityHint = true;
        setTimeout(() => {
          this.showPriorityHint = false;
        }, 3000);
      }
    },
    // 处理规则描述变更
    handleDescriptionChange() {
      // 保存用户输入的描述
      if (this.formModel.ruleSetting === 'custom') {
        this.userRuleDescription = this.formModel.description;
      }
      // 通知父组件更新状态显示
      this.$emit('setStateText', { executor_id: this.formModel.executor_id });
    },
    //提交触发动作数据
    configFormSubmit() {
      return new Promise((resolve, reject) => {
        // 如果优先级为空，设置为电磁阀id
        if (!this.formModel.priority || this.formModel.priority.toString().trim() === '') {
          this.formModel.priority = this.formModel._executorObj.slot.replace(/[^0-9]/g, '');
        }

        // 验证优先级是否有效和唯一
        const currentId = this.formModel.executor_id;
        const priority = Number(this.formModel.priority);

        if (isNaN(priority) || priority < 1 || priority > 99) {
          this.$message({
            type: 'warning',
            message: `${this.activeTab['name']}，规则优先级必须是1-99之间的数字!`
          });
          reject({ msg: false, code: -200 });
          return false;
        }

        // 验证优先级是否重复
        const priorityList = this.getPriorityList(currentId);
        if (priorityList.includes(priority)) {
          this.$message({
            type: 'warning',
            message: `${this.activeTab['name']}，规则优先级${priority}已被使用，请修改!`
          });
          reject({ msg: false, code: -200 });
          return false;
        }

        //验证自定义规则代码是否为空，如果为空，则给出提示
        if (this.formModel.ruleSetting === 'custom' && !this.formModel.code) {
          this.$message({
            type: 'warning',
            message: `${this.activeTab['name']}，请输入自定义规则代码!`
          });
          reject({ msg: false, code: -200 });
          return false;
        }

        // 先执行常规表单验证
        this.$refs.configFormRef.validate((valid) => {
          if (!valid) {
            this.$message({
              type: 'warning',
              message: `${this.activeTab['name']}，请完善执行参数配置!`
            });
            reject({ msg: 'error submit!!', code: -200 });
            return;
          }

          // 如果是自定义规则，需要进行代码验证
          if (this.formModel.ruleSetting === 'custom' && this.formModel.code) {
            this.validateJSCode()
              .then(() => {
                // 代码验证通过，完成表单提交
                resolve({ msg: 'submit', code: 200 });
              })
              .catch((error) => {
                // 代码验证失败，显示错误消息并拒绝表单提交
                this.$message({
                  type: 'warning',
                  message: `${this.activeTab['name']}，自定义规则代码验证失败: ${error.message || '未知错误'}`
                });
                reject({ msg: 'JS code validation failed', code: -200 });
              });
          } else {
            // 非自定义规则或无代码，直接完成表单提交
            resolve({ msg: 'submit', code: 200 });
          }
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
  min-width: 150px;
  max-width: 150px;
  padding-left: 75px;

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

/* JS代码编辑区域样式 */
.custom-rule-code {
  margin-top: 15px;
}

.code-editor-wrapper {
  width: 500px;
  display: flex;
  flex-direction: column;

  .code-editor {
    font-family: monospace;
    margin-bottom: 10px;

    .el-textarea__inner {
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      line-height: 1.5;
    }

    &[readonly] .el-textarea__inner {
      background-color: #f8f8f8;
      cursor: default;
    }
  }

  .el-button {
    align-self: flex-end;
  }

  .code-tip {
    align-self: flex-end;
    color: #909399;
    font-size: 14px;
  }
}

.error-details {
  margin-top: 15px;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 4px;

  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #f56c6c;
  }

  p {
    margin-bottom: 10px;
  }
}

.code-preview {
  font-family: monospace;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;

  .line-number {
    display: inline-block;
    min-width: 30px;
    color: #909399;
    user-select: none;
  }

  .error-line {
    background-color: #ffeeee;
    color: #f56c6c;
    font-weight: bold;
  }

  .context-line {
    color: #606266;
  }

  .error-indicator {
    padding-left: 30px;
    color: #f56c6c;
    white-space: pre;
  }

  .error-pointer {
    color: #f56c6c;
  }

  .error-message {
    font-weight: bold;
  }
}

.priority-hint {
  font-size: 14px;
  color: #909399;
  padding-left: 10px;
}
</style>