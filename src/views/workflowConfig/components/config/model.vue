<template>
  <div id="main" class="modelClass">
    <div class="card-title">
      <div class="title">
        {{ type == 1 ? "模型配置" : "阈值配置" }}
      </div>
      <el-select v-if="configType == 'Quality' && type == 1" v-model="form.algorithm_type" placeholder="类型" size="mini"
        :disabled="isLocked" @change="changeAlgorithmType">
        <el-option :label="item.desc" :value="item.index" v-for="(item, index) in classesTypeList"
          :key="index"></el-option>
      </el-select>
      <el-button type="text" v-if="type == 1" @click="toggleLock" style="margin-left: auto;">
        <i :class="isLocked ? 'el-icon-lock' : 'el-icon-unlock'"></i>
      </el-button>
      <div class="btn" style="margin-left: auto;"
        v-if="isUpdateThresoldParams && type == 2 && form.algorithm_type == 'Ai' && parameterIndex == 'Surface'"
        @click="affirm">更新参数</div>
      <div class="btn" style="margin-left: auto;"
        v-if="isUpdateThresoldParams && type == 2 && form.algorithm_type == 'Size' && parameterIndex == 'Surface'"
        @click="algoAffirm">更新参数</div>
    </div>
    <div v-if="type == 1 && form.algorithm_type == 'Ai'">
      <div class="line">
        <div class="item" v-for="(item, index) in lineData" :key="index">
          <div :class="lineIndex == item.index
            ? 'line-content content-active'
            : 'line-content content-noactive'
            " @click="lineIndex = item.index">
            {{ item.desc }}
          </div>
          <div v-if="index != lineData.length - 1" style="width: 55px; height: 0px; border: dotted 1px #999999;"></div>
          <div class="icon" v-if="index != lineData.length - 1"></div>
        </div>
      </div>
      <div class="form" v-if="lineIndex == 1">
        <!-- :rules="rules" -->
        <el-form ref="form" :model="form" label-width="98px">
          <el-form-item label="路径：" prop="model_path">
            <el-select v-model="form.model_path" placeholder="请选择路径" style="width: 100%" :disabled="isLocked">
              <el-option :label="item" :value="item" v-for="(item, index) in modulesList" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <div class="classes">
            <div class="classes-item" v-for="(item, index) in classes" :key="index">
              <el-form-item :label="item.desc + '：'">
                <el-input v-model="item.name" :disabled="isLocked" @change="handleNameChange(item)"
                  v-if="item.active"></el-input>
                <span v-else class="disabled-input">未启用</span>
              </el-form-item>
              <el-form-item label-width="12px">
                <el-switch class="switch" v-model="item.active" :disabled="isLocked" active-color="#1B2133"
                  inactive-color="#E2E2E3" @change="finish">
                </el-switch>
                <!-- <colorPicker v-model="color" /> -->
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
      <div class="form" v-if="lineIndex == 2">
        <el-form ref="form" :model="form" label-width="130px">
          <div class="min-area">
            <el-form-item label="最小面积：">
              <el-input-number v-model="form.min_area" controls-position="right" :disabled="isLocked"></el-input-number>
            </el-form-item>
            <el-form-item label-width="5px">
              <span class="unit">px</span>
            </el-form-item>
            <el-form-item label-width="12px">
              <el-switch class="switch" v-model="minAreaAtcive" active-color="#1B2133" inactive-color="#E2E2E3"
                :disabled="isLocked">
              </el-switch>
            </el-form-item>
          </div>
        </el-form>
        <!-- <el-button class="finish btn" v-if="configType == 'Quality'" :disabled="isLocked" @click="finish">
          完成
        </el-button> -->
      </div>
      <div class="form" v-if="lineIndex == 3">
        <el-form ref="form" :model="form" label-width="130px">
          <div class="min-area">
            <el-form-item label="算子类型：">
              <el-select v-model="parameterIndex" placeholder="请选择算子类型" style="width: 100%"
                @change="changeParameterIndex" :disabled="isLocked">
                <el-option :label="item.desc" :value="item.index" v-for="(item, index) in parameterList"
                  :key="index"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-form>
        <!-- <el-button class="finish btn" :disabled="isLocked" @click="finish">确认</el-button> -->
      </div>
    </div>
    <div v-if="type == 1 && form.algorithm_type == 'Size'">
      <div class="form">
        <el-form ref="form" :model="form" label-width="120px" style="margin-top: 50px;">
          <el-form-item label="算法选择" prop="algorithm_id">
            <el-select v-loading="loading" v-model="form.algorithm_id" placeholder="请选择算法" style="width: 100%;"
              @change="getSizeAlgoParams(form)" :disabled="isLocked">
              <el-option :label="item.name" :value="item.id" v-for="(item, index) in algorithmList"
                :key="index"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <!-- <el-button class="finish btn" :disabled="isLocked" @click="algoFinish">完成</el-button> -->
      </div>
    </div>
    <div v-if="type == 2 && form.algorithm_type == 'Ai'">
      <div v-if="parameterIndex == 'Stage'" class="stage-box">
        <div :class="resClasses.length > 4 ? 'step step-l' : 'step'">
          <div class="step-box">
            <div class="item" v-for="(item, index) in resClasses" :key="index">
              <div class="title" :style="{
                width:
                  index != resClasses.length - 1
                    ? 'calc(100% - 65px)'
                    : '100%',
              }">
                {{ stepBoj[index] }}
              </div>
              <div class="bod">
                <div :class="stepIndex == index ? 'item active' : 'item noactive'" @click="stepIndex = index">
                  {{ item.name !== "" ? item.name : "请选择" }}
                </div>
                <div class="bod-line" v-if="index != resClasses.length - 1">
                </div>
                <div class="icon" v-if="index != resClasses.length - 1"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="form">
          <el-form ref="formStage" :model="resClasses[stepIndex]">
            <el-form-item label="所属类别：">
              {{ resClasses[stepIndex].name }}
            </el-form-item>
            <el-form-item label="持续时长：">
              <el-input-number v-model="resClasses[stepIndex].parameter.continuous"></el-input-number>ms
            </el-form-item>
          </el-form>
          <!-- <div class="cancal btn" @click="reset">重置</div>
          <div class="finish btn" @click="affirm">确认</div> -->
        </div>
      </div>
      <div v-if="parameterIndex == 'Speed'">
        <el-tabs v-model="stepIndex" type="card" style="margin-top: 26px">
          <el-tab-pane :key="item.name" v-for="(item, index) in resClasses" :label="item.name" :name="index + ''">
          </el-tab-pane>
        </el-tabs>
        <div class="form marg-top">
          <el-form ref="form" :model="form" label-width="80px">
            <el-form-item label="速度：">
              <el-input-number v-model="resClasses[stepIndex].parameter.speed" controls-position="right"
                style="width: 160px"></el-input-number>px/s
            </el-form-item>
          </el-form>
          <!-- <div class="finish btn" @click="affirm">确认</div> -->
        </div>
      </div>
      <div v-if="parameterIndex == 'Surface'">
        <el-tabs v-model="stepIndex" type="card" class="card">
          <el-tab-pane :key="item.name" v-for="(item, index) in resClasses" :label="item.name" :name="index + ''">
          </el-tab-pane>
        </el-tabs>
        <div class="form">
          <div class="form-area">
            <div style="padding: 0px 14px 42px 14px; text-align: center;">
              <el-row>
                <el-col :span="6">
                  面积<= <el-input-number v-model="resClasses[stepIndex].parameter.area" :controls="false"
                    style="width: 50%"></el-input-number>像素
                </el-col>
                <el-col :span="5">
                  & 长<= <el-input-number v-model="resClasses[stepIndex].parameter.length" :controls="false"
                    style="width: 50%"></el-input-number>像素
                </el-col>
                <el-col :span="5">
                  & 宽<= <el-input-number v-model="resClasses[stepIndex].parameter.width" :controls="false"
                    style="width: 50%"></el-input-number>像素
                </el-col>
                <el-col :span="8">
                  & 长宽比<= <el-input-number v-model="resClasses[stepIndex].parameter.ratio" :controls="false"
                    :precision="2" style="width: 40%"></el-input-number>
                </el-col>
              </el-row>
            </div>
            <div class="ipt">
              允许异常数量<= <el-input-number v-model="resClasses[stepIndex].parameter.count" :controls="false"
                style="width: 64px"></el-input-number>
            </div>
          </div>
        </div>
      </div>
      <div v-if="parameterIndex == 'Relative'">
        <el-tabs v-model="positionActiveTab" type="card" class="position-card">
          <el-tab-pane label="目标特征" name="features">
            <div class="position-form-area">
              <div v-for="(item, index) in resClasses" :key="index" class="feature-item">
                <div class="feature-header">{{ item.class == 'C1' ? '类别1' : item.class == 'C2' ? '类别2' : item.class ==
                  'C3' ? '类别3' : item.class == 'C4' ? '类别4' : item.class == 'C5' ? '类别5' : item.class == 'C6' ? '类别6'
                    : item.class == 'C7' ? '类别7' : item.class == 'C8' ? '类别8' : item.class == 'C9' ? '类别9' : item.class ==
                      'C10' ? '类别10' : item.class == 'C11' ? '类别11' : item.class == 'C12' ? '类别12' : item.class == 'C13' ?
                        '类别13' : item.class == 'C14' ? '类别14' : item.class == 'C15' ? '类别15' : '' }}({{ item.name }}):
                  <a :style="getDragItemStyle(item.name)"></a>：
                </div>
                <el-form label-width="120px">
                  <el-form-item label="最小面积：">
                    <el-input-number v-model="item.parameter.min_area" :controls="false"></el-input-number>
                    <span class="unit">px</span>
                  </el-form-item>
                  <el-form-item label="最小长度：">
                    <el-input-number v-model="item.parameter.min_length" :controls="false"></el-input-number>
                    <span class="unit">px</span>
                  </el-form-item>
                  <el-form-item label="最小宽度：">
                    <el-input-number v-model="item.parameter.min_width" :controls="false"></el-input-number>
                    <span class="unit">px</span>
                  </el-form-item>
                  <el-form-item label="最小长宽比：">
                    <el-input-number v-model="item.parameter.min_length_width_ratio" :controls="false"
                      :precision="2"></el-input-number>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="线序设定" name="sequence">
            <div class="sequence-container">
              <div class="available-classes">
                <h3>可用类别</h3>
                <draggable v-model="availableClasses" :group="{ name: 'classes', pull: 'clone', put: false }"
                  :clone="cloneClass" @start="drag = true" @end="drag = false">
                  <div v-for="element in availableClasses" :key="element.id" class="drag-item"
                    :style="getDragItemStyle(element.name)">
                    {{ element.name }}
                  </div>
                </draggable>
              </div>
              <div class="divider"></div>
              <div class="sequence-classes">
                <h3>序列顺序</h3>
                <draggable v-model="sequenceClasses" group="classes" class="sequence-list"
                  @change="handleSequenceChange">
                  <div v-for="element in sequenceClasses" :key="element.id" class="drag-item"
                    :style="getDragItemStyle(element.name)">
                    {{ element.name }}
                    <i class="el-icon-close" @click="removeFromSequence(element)"></i>
                  </div>
                  <div v-if="sequenceClasses.length === 0" class="empty-sequence-tip">
                    请从左侧可用列表拖拽添加
                  </div>
                </draggable>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div v-if="parameterIndex == 'OperationStage' || parameterIndex == 'ScanRecognition'">
        <el-tabs v-model="operationStageActiveTab" type="card" class="position-card">
          <el-tab-pane label="目标特征" name="target">
            <div class="position-form-area">
              <div v-for="(item, index) in resClasses" :key="index" class="feature-item">
                <div class="feature-header">{{ item.class == 'C1' ? '类别1' : item.class == 'C2' ? '类别2' : item.class ==
                  'C3' ? '类别3' : item.class == 'C4' ? '类别4' : item.class == 'C5' ? '类别5' : item.class == 'C6' ? '类别6'
                    : item.class == 'C7' ? '类别7' : item.class == 'C8' ? '类别8' : item.class == 'C9' ? '类别9' : item.class ==
                      'C10' ? '类别10' : item.class == 'C11' ? '类别11' : item.class == 'C12' ? '类别12' : item.class == 'C13' ?
                        '类别13' : item.class == 'C14' ? '类别14' : item.class == 'C15' ? '类别15' : '' }}({{ item.name }}):
                </div>
                <el-form label-width="120px">
                  <el-form-item label="最小面积：">
                    <el-input-number v-model="item.parameter.min_area" :controls="false"></el-input-number>
                    <span class="unit">px</span>
                  </el-form-item>
                  <el-form-item label="最小长度：">
                    <el-input-number v-model="item.parameter.min_length" :controls="false"></el-input-number>
                    <span class="unit">px</span>
                  </el-form-item>
                  <el-form-item label="最小宽度：">
                    <el-input-number v-model="item.parameter.min_width" :controls="false"></el-input-number>
                    <span class="unit">px</span>
                  </el-form-item>
                  <el-form-item label="最小长宽比：">
                    <el-input-number v-model="item.parameter.min_length_width_ratio" :controls="false"
                      :precision="2"></el-input-number>
                  </el-form-item>
                  <el-form-item label="最短持续时间：">
                    <el-input-number v-model="item.parameter.min_continuous" :controls="false"
                      :precision="2"></el-input-number>ms
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="parameterIndex == 'OperationStage'" label="环节清单设定" name="steplist">
            <div class="steplist-container">
              <!-- 类别数量小于3的提示 -->
              <div v-if="activeClassesCount < 3" class="insufficient-classes">
                模型类别需>=3,用于构建完整的监控过程
              </div>
              <!-- 类别数量大于等于3的内容 -->
              <div v-else class="steplist-content">
                <div class="sequence-count">
                  <span class="label">环节序列数量：</span>
                  <el-input-number v-model="sequenceCount" :controls="false" :min="0" :max="3"
                    @change="handleSequenceCountChange">
                  </el-input-number>
                </div>
                <div class="class-list">
                  <div class="left-settings">
                    <div v-for="item in activeClasses" :key="item.class" class="class-item">
                      <span class="class-name">{{ item.name }}:</span>
                      <el-select v-model="classStepTypes[item.class]" placeholder="请选择"
                        @change="(value) => handleStepTypeChange(value, item)">
                        <el-option v-for="option in getAvailableStepTypes(item.class)" :key="option.value"
                          :label="option.label" :value="option.value">
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                  <!-- 右侧图形展示部分 -->
                  <div v-if="hasStartStep && hasEndStep" class="right-diagram">
                    <div class="process-diagram">
                      <!-- 起点 -->
                      <div class="start-node node">
                        <div class="node-content">
                          开始：{{ getStartClassName }}
                        </div>
                      </div>

                      <!-- 中间部分 -->
                      <div class="middle-section">
                        <!-- 清单项列表 -->
                        <div v-if="checklistItems.length > 0" class="checklist-items">
                          <div v-for="item in checklistItems" :key="item.class" class="checklist-item node">
                            {{ item.name }}
                          </div>
                        </div>

                        <!-- 序列项列表 -->
                        <div class="sequence-lists" v-if="sequenceCount > 0">
                          <div v-for="n in sequenceCount" :key="n">
                            <div v-if="sequenceItemsMap[n].length > 0" class="sequence-list-item">
                              <div class="sequence-title">{{ n }}号序列</div>
                              <div class="sequence-items-container">
                                <div class="sequence-item-box" v-for="(item, index) in sequenceItemsMap[n]"
                                  :key="index">
                                  <div class="sequence-item sequence-item-node">
                                    {{ item.name }}
                                  </div>
                                  <!-- 在非最后一个项后添加向下箭头框 -->
                                  <div v-if="index < sequenceItemsMap[n].length - 1" :key="'arrow-' + index"
                                    class="sequence-arrow-box">
                                    <div class="arrow-line"></div>
                                    <div class="arrow-head"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      <!-- 终点 -->
                      <div class="end-node node">
                        <div class="node-content">
                          终点：{{ getEndClassName }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="right-diagram-placeholder">
                    必须设置起点和终点
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div v-if="type == 2 && form.algorithm_type == 'Size'">
      <div class="form">
        <div class="container">
          <div v-for="(group, index) in generateArrayFromJson(form.classes)" :key="index" v-if="group.enabled"
            class="group">
            <div class="group-header">{{ group.name }}</div>
            <div class="group-content">
              <template v-for="order in getOrderedNumbers(group)">
                <div v-for="(item, key) in group" :key="key"
                  v-if="item.enabled && key !== 'name' && key !== 'enabled' && key !== 'group' && item.pair_place === 'NotPair' && item.order === order"
                  class="row">
                  <div class="not-pair">
                    <el-tooltip effect="dark" :content="item.name + ':'" placement="top" v-if="item.name.length > 6">
                      <span class="label">{{ item.name }}：
                      </span>
                    </el-tooltip>
                    <span v-else class="label">{{ item.name }}：</span>
                    <el-switch v-if="typeof item.value == 'boolean'" v-model="form.classes[key].value"
                      active-color="#1B2133" inactive-color="#E2E2E3">
                    </el-switch>
                    <div v-else-if="key === 'gdt_mode'">
                      <el-radio-group v-model="form.classes[key].value">
                        <el-radio :label="'IndependentPrinciple'" role="radio">独立原则</el-radio>
                        <el-radio :label="'MPrinciple'" role="radio">M原则</el-radio>
                      </el-radio-group>
                    </div>
                    <div v-else-if="key == 'size_mode'">
                      <el-radio-group v-model="form.classes[key].value">
                        <el-radio :label="'IndependentPrinciple'" role="radio">独立原则</el-radio>
                        <el-radio :label="'EPrinciple'" role="radio">E原则</el-radio>
                      </el-radio-group>
                    </div>
                    <el-input-number v-else v-model="form.classes[key].value" :controls="false"
                      :precision="3"></el-input-number>
                  </div>
                </div>
                <template v-for="(leftItem, leftKey) in group">
                  <div
                    v-if="leftItem.enabled && leftKey !== 'name' && leftKey !== 'enabled' && leftKey !== 'group' && leftItem.pair_place === 'Left' && leftItem.order === order"
                    class="row pair-row" :key="leftKey">
                    <div class="left">
                      <el-tooltip effect="dark" :content="leftItem.name + ':'" placement="top"
                        v-if="leftItem.name.length > 6">
                        <span class="label">{{ leftItem.name }}：
                        </span>
                      </el-tooltip>
                      <span v-else class="label">{{ leftItem.name }}：</span>
                      <el-switch v-if="typeof leftItem.value == 'boolean'" v-model="form.classes[leftKey].value"
                        active-color="#1B2133" inactive-color="#E2E2E3">
                      </el-switch>
                      <div v-else-if="leftKey === 'gdt_mode'">
                        <el-radio-group v-model="form.classes[leftKey].value">
                          <el-radio :label="'IndependentPrinciple'" role="radio">独立原则</el-radio>
                          <el-radio :label="'MPrinciple'" role="radio">M原则</el-radio>
                        </el-radio-group>
                      </div>
                      <div v-else-if="leftKey == 'size_mode'">
                        <el-radio-group v-model="form.classes[leftKey].value">
                          <el-radio :label="'IndependentPrinciple'" role="radio">独立原则</el-radio>
                          <el-radio :label="'EPrinciple'" role="radio">E原则</el-radio>
                        </el-radio-group>
                      </div>
                      <el-input-number v-else v-model="form.classes[leftKey].value" :controls="false" :precision="3"
                        @input="handleInputValue($event, leftKey)">
                      </el-input-number>
                    </div>
                    <template v-for="(rightItem, rightKey) in group">
                      <div v-if="rightItem.enabled && rightItem.pair_place === 'Right' && rightItem.order === order"
                        :key="rightKey" class="right">
                        <el-tooltip effect="dark" :content="rightItem.name + ':'" placement="top"
                          v-if="rightItem.name.length > 6">
                          <span class="label">{{ rightItem.name }}：
                          </span>
                        </el-tooltip>
                        <span v-else class="label">{{ rightItem.name }}：</span>
                        <el-switch v-if="typeof rightItem.value == 'boolean'" v-model="form.classes[rightKey].value"
                          active-color="#1B2133" inactive-color="#E2E2E3">
                        </el-switch>
                        <div v-else-if="rightKey === 'gdt_mode'">
                          <el-radio-group v-model="form.classes[rightKey].value">
                            <el-radio :label="'IndependentPrinciple'" role="radio">独立原则</el-radio>
                            <el-radio :label="'MPrinciple'" role="radio">M原则</el-radio>
                          </el-radio-group>
                        </div>
                        <div v-else-if="rightKey == 'size_mode'">
                          <el-radio-group v-model="form.classes[rightKey].value">
                            <el-radio :label="'IndependentPrinciple'" role="radio">独立原则</el-radio>
                            <el-radio :label="'EPrinciple'" role="radio">E原则</el-radio>
                          </el-radio-group>
                        </div>
                        <el-input-number v-else v-model="form.classes[rightKey].value" :controls="false" :precision="3"
                          @input="handleInputValue($event, rightKey)">
                        </el-input-number>
                      </div>
                    </template>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getModels, updateTrialRunning } from "@/api/config";
import { querySizeAlgorithmsList } from "@/api/softwareRegistration/sizeAlgorithm";
import draggable from 'vuedraggable';

export default {
  name: "modConfig",
  components: {
    draggable
  },
  props: {
    isUpdateThresoldParams: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      color: '#000000',
      loading: false,
      configType: "Monitor",
      type: 1,
      form: {
        model_path: "",
        algorithm_type: "Ai",
      },
      classesTypeList: [
        {
          desc: "AI模型",
          index: "Ai",
        },
        {
          desc: "尺寸模型",
          index: "Size",
        },
      ],
      lineData: [
        {
          desc: "AI模型",
          index: 1,
        },
        {
          desc: "噪点过滤",
          index: 2,
        },
      ],
      lineIndex: 1,
      modulesList: [],
      classes: [
        {
          desc: "类别1",
          name: "",
          index: 1,
          class: "C1",
          active: false,
        },
        {
          desc: "类别2",
          name: "",
          index: 2,
          class: "C2",
          active: false,
        },
        {
          desc: "类别3",
          name: "",
          index: 3,
          class: "C3",
          active: false,
        },
        {
          desc: "类别4",
          name: "",
          index: 4,
          class: "C4",
          active: false,
        },
        {
          desc: "类别5",
          name: "",
          index: 5,
          class: "C5",
          active: false,
        },
        {
          desc: "类别6",
          name: "",
          index: 6,
          class: "C6",
          active: false,
        },
        {
          desc: "类别7",
          name: "",
          index: 7,
          class: "C7",
          active: false,
        },
        {
          desc: "类别8",
          name: "",
          index: 8,
          class: "C8",
          active: false,
        },
        {
          desc: "类别9",
          name: "",
          index: 9,
          class: "C9",
          active: false,
        },
        {
          desc: "类别10",
          name: "",
          index: 10,
          class: "C10",
          active: false,
        },
        {
          desc: "类别11",
          name: "",
          index: 11,
          class: "C11",
          active: false,
        },
        {
          desc: "类别12",
          name: "",
          index: 12,
          class: "C12",
          active: false,
        },
        {
          desc: "类别13",
          name: "",
          index: 13,
          class: "C13",
          active: false,
        },
        {
          desc: "类别14",
          name: "",
          index: 14,
          class: "C14",
          active: false,
        },
        {
          desc: "类别15",
          name: "",
          index: 15,
          class: "C15",
          active: false,
        },
      ],
      min_area: 0,
      parameterIndex: "Surface",
      parameterList: [
        {
          desc: "环节",
          index: "Stage",
        },
        {
          desc: "速度",
          index: "Speed",
        },
        {
          desc: "无",
          index: "Surface",
        },
        {
          desc: "位置序列",
          index: "Relative",
        },
        {
          desc: "环节/清单",
          index: "OperationStage",
        },
        {
          desc: "扫码识别",
          index: "ScanRecognition",
        },
      ],
      algorithmList: [],
      resClasses: [],
      stepIndex: "0",
      stepBoj: {
        0: "步骤一",
        1: "步骤二",
        2: "步骤三",
        3: "步骤四",
        4: "步骤五",
        5: "步骤六",
        6: "步骤七",
        7: "步骤八",
      },
      actClasses: [],
      isLocked: true,
      positionActiveTab: 'features',
      operationStageActiveTab: 'target',
      availableClasses: [],
      sequenceClasses: [],
      nextId: 1,
      sequenceCount: 0, // 环节序列数量
      classStepTypes: {}, // 用于存储每个类别的步骤类型
    };
  },
  computed: {
    minAreaAtcive: {
      get() {
        // 从当前工作流中获取 minAreaActive 状态
        return this.form._minAreaActive === true;
      },
      set(value) {
        // 将状态与当前工作流关联
        this.$set(this.form, '_minAreaActive', value);

        // 如果禁用了最小面积，则从表单中移除 min_area
        if (!value && this.form.min_area !== undefined) {
          this.$delete(this.form, 'min_area');
        } else if (value) {
          // 如果启用了最小面积，确保 min_area 有值
          this.$set(this.form, 'min_area', this.min_area || 0);
        }
      }
    },
    // 获取激活的类别数量
    activeClassesCount() {
      return this.classes.filter(item => item.active).length;
    },
    // 获取激活的类别列表
    activeClasses() {
      return this.classes.filter(item => item.active).map(item => ({
        ...item,
        stepType: this.classStepTypes[item.class] || 'checklist' // 从classStepTypes中获取值 
      }));
    },
    // 获取起点类别名称
    getStartClassName() {
      const startClass = this.activeClasses.find(item => this.classStepTypes[item.class] === 'start');
      return startClass ? startClass.name : '未设置';
    },

    // 获取终点类别名称
    getEndClassName() {
      const endClass = this.activeClasses.find(item => this.classStepTypes[item.class] === 'end');
      return endClass ? endClass.name : '未设置';
    },

    // 获取清单项列表
    checklistItems() {
      return this.activeClasses.filter(item => this.classStepTypes[item.class] === 'checklist');
    },
    // 获取序列项映射
    sequenceItemsMap() {
      const map = {};
      // 初始化每个序列的数组
      for (let i = 1; i <= this.sequenceCount; i++) {
        map[i] = [];
      }

      // 遍历所有激活的类别
      this.activeClasses.forEach(item => {
        const stepType = this.classStepTypes[item.class];
        if (stepType && stepType.startsWith('sequence_')) {
          const sequenceNum = parseInt(stepType.split('_')[1]);
          if (sequenceNum <= this.sequenceCount) {
            map[sequenceNum].push(item);
          }
        }
      });

      return map;
    },
    // 是否已设置起点
    hasStartStep() {
      return Object.values(this.classStepTypes).includes('start');
    },

    // 是否已设置终点
    hasEndStep() {
      return Object.values(this.classStepTypes).includes('end');
    },
    // 添加新的计算属性来获取可用的步骤类型选项
    getAvailableStepTypes() {
      return function (currentClass) {
        // 基础选项
        let options = [
          { label: '清单项', value: 'checklist' }
        ];

        // 添加序列选项
        for (let n = 1; n <= this.sequenceCount; n++) {
          options.push({
            label: `${n}号序列项`,
            value: `sequence_${n}`
          });
        }

        // 如果当前类别已经被分配了起点或终点，则保留其选项
        if (this.classStepTypes[currentClass] === 'start') {
          options.unshift({ label: '过程起点', value: 'start' });
        } else if (this.classStepTypes[currentClass] === 'end') {
          options.unshift({ label: '过程终点', value: 'end' });
        } else {
          // 检查起点和终点是否已被其他类别使用
          const hasStart = Object.values(this.classStepTypes).includes('start');
          const hasEnd = Object.values(this.classStepTypes).includes('end');

          // 如果起点未被使用，添加起点选项
          if (!hasStart) {
            options.unshift({ label: '过程起点', value: 'start' });
          }

          // 如果终点未被使用，添加终点选项
          if (!hasEnd) {
            options.unshift({ label: '过程终点', value: 'end' });
          }
        }

        return options;
      }
    }
  },
  watch: {
    parameterIndex: {
      handler(newVal) {
        if (newVal === 'Relative') {
          console.log("🚀 ~ handler ~ parameterIndex:", newVal)
          // 初始化可用类别列表
          this.initAvailableClasses();
        }
      },
      immediate: true
    },
  },
  mounted() {
  },
  methods: {
    init(cfg, type) {
      console.log("🚀 ~ init ~ cfg:", cfg)
      this.form = cfg;
      console.log('初始化模型组件', this.form.classes.type);
      if (type == "Monitor") {
        this.lineData = [
          {
            desc: "AI模型",
            index: 1,
          },
          {
            desc: "噪点过滤",
            index: 2,
          },
          {
            desc: "后处理算子",
            index: 3,
          },
        ];
      };
      this.configType = type;
      this.lineIndex = 1;
      this.stepIndex = "0";
      this.isLocked = true;
      this.operationStageActiveTab = 'target';
      this.positionActiveTab = 'features';
      // 在所有条件判断之后,根据实际type设置parameterIndex
      if (this.form.classes && this.form.classes.type) {
        this.parameterIndex = this.form.classes.type;  // 根据实际类型设置
      } else {
        this.parameterIndex = "Surface";  // 默认值
      }
      // 初始化 _minAreaActive 状态
      if (this.form.min_area !== undefined && this.form.min_area !== "") {
        this.min_area = this.form.min_area;
        this.$set(this.form, '_minAreaActive', true);
      } else {
        this.$set(this.form, '_minAreaActive', false);
      }
      //初始化模型
      if (this.form.algorithm_type == 'Size') {
        this.querySizeAlgorithmsList();
      } else if (this.form.algorithm_type == 'Ai') {
        this.getModels();
      }
      //初始化阈值
      if (this.form.classes && this.form.classes.type === 'OperationStage') {
        console.log('初始化OperationStage类型', this.form.classes);
        if (this.form.classes.start !== null) {
          console.log('环节清单设置过');

          // 重置所有类别状态
          this.classes.forEach(item => {
            item.active = false;
            item.name = "";
          });

          // 创建一个临时数组存储所有配置
          let allConfigs = [];

          // 重置 classStepTypes
          this.classStepTypes = {};

          // 添加 start 配置
          if (this.form.classes.start) {
            allConfigs.push(this.form.classes.start);
            // 设置起点类型
            this.$set(this.classStepTypes, this.form.classes.start.class, 'start');
          }

          // 添加 end 配置
          if (this.form.classes.end) {
            allConfigs.push(this.form.classes.end);
            // 设置终点类型
            this.$set(this.classStepTypes, this.form.classes.end.class, 'end');
          }

          // 添加 unordered 配置
          if (this.form.classes.unordered && Array.isArray(this.form.classes.unordered)) {
            allConfigs = allConfigs.concat(this.form.classes.unordered);
            // 设置清单项类型
            this.form.classes.unordered.forEach(item => {
              this.$set(this.classStepTypes, item.class, 'checklist');
            });
          }

          // 添加 ordered 配置
          if (this.form.classes.ordered && Array.isArray(this.form.classes.ordered)) {
            // 设置序列数量
            this.sequenceCount = this.form.classes.ordered.length;

            // 将所有序列中的配置添加到总配置中
            this.form.classes.ordered.forEach((sequence, index) => {
              if (Array.isArray(sequence)) {
                allConfigs = allConfigs.concat(sequence);
                // 设置序列项类型
                sequence.forEach(item => {
                  this.$set(this.classStepTypes, item.class, `sequence_${index + 1}`);
                });
              }
            });
          }

          // 更新 classes
          this.classes.forEach(item => {
            const matchedConfig = allConfigs.find(config => config.class === item.class);
            if (matchedConfig) {
              item.active = true;
              item.name = matchedConfig.name;
            }
          });
          console.log('allConfigs', allConfigs);

          // 设置 resClasses
          this.resClasses = allConfigs.sort((a, b) => {
            const numA = parseInt(a.class.substring(1)); // 提取 "C1" 中的数字 1
            const numB = parseInt(b.class.substring(1)); // 提取 "C2" 中的数字 2
            return numA - numB;
          });
        }
        console.log('初始化classStepTypes', this.classStepTypes);
      } else if (this.form.classes && this.form.classes.type === 'Relative') {
        console.log('初始化Relative类型');
        if (this.form.classes && this.form.classes.feature_sets && this.form.classes.feature_sets.length > 0) {
          console.log('加载已有的feature_sets');
          // 设置parameterIndex
          this.parameterIndex = this.form.classes.type;

          // 处理classes
          this.classes.forEach((item) => {
            item.active = false;
            item.name = "";

            // 查找是否在feature_sets中有对应项
            const matchedFeature = this.form.classes.feature_sets.find(
              feature => feature.class === item.class
            );

            if (matchedFeature) {
              item.active = true;
              item.name = matchedFeature.name;
            }
          });

          // 设置resClasses
          this.resClasses = this.form.classes.feature_sets;

          // 初始化可用类别和序列类别
          this.nextId = 1; // 重置ID计数器
          this.initAvailableClasses();
        }
      } else {
        if (this.form.classes && this.form.classes.classes && this.form.classes.classes.length > 0) {
          console.log('000000');
          this.classes.forEach((item, index) => {
            item.active = false;
            item.name = "";
            this.parameterIndex = this.form.classes.type;
            this.form.classes.classes.forEach((ele, i) => {
              if (item.class == ele.class) {
                item.active = true;
                item.name = ele.name;
              }
            });
            // 确保禁用的类别名称被清空
            if (!item.active) {
              item.name = "";
            }
          });
          this.resClasses = this.form.classes.classes;
        } else {
          if (this.form._timeAnchor) {
            let anchorData = JSON.parse(
              localStorage.getItem(this.form._timeAnchor)
            );
            this.classes = anchorData.classes;
            // 确保禁用的类别名称被清空
            this.classes.forEach(item => {
              if (!item.active) {
                item.name = "";
              }
            });
            this.resClasses = anchorData.resClasses;
            this.actClasses = anchorData.actClasses;
            this.parameterIndex = anchorData.parameterIndex;
          } else {
            this.classes.forEach((item, index) => {
              item.active = false;
              item.name = "";
            });
          }
        }
      }
    },
    //解析toml文件
    generateArrayFromJson(json) {
      // 获取所有组的信息
      const groups = json.groups;

      // 获取所有配置项（排除 groups 和 type）
      const configItems = Object.keys(json).filter(key => key !== 'groups' && key !== 'type');

      // 初始化结果数组
      const result = [];

      // 遍历每个组
      for (const groupKey in groups) {
        const group = groups[groupKey];
        const groupName = group.name;
        const groupEnabled = group.enabled;
        const groupID = parseInt(groupKey);

        // 初始化当前组的对象
        const groupObj = {
          name: groupName,
          enabled: groupEnabled,
          group: groupID,
        };

        // 遍历所有配置项，筛选属于当前组的配置项
        const groupConfigItems = configItems.filter(itemKey => json[itemKey].group === groupID);

        // 按 order 属性对配置项进行排序
        groupConfigItems.sort((a, b) => json[a].order - json[b].order);

        // 将排序后的配置项添加到当前组对象中
        groupConfigItems.forEach(itemKey => {
          const item = json[itemKey];
          groupObj[itemKey] = {
            enabled: item.enabled,
            group: item.group,
            name: item.name,
            order: item.order,
            pair_place: item.pair_place,
            value: item.value,
          };
        });

        // 将当前组对象添加到结果数组中
        result.push(groupObj);
      }

      return result;
    },
    // 获取按顺序排列的 order 数字数组
    getOrderedNumbers(group) {
      const orders = new Set();
      Object.keys(group).forEach(key => {
        const item = group[key];
        if (item.enabled && key !== 'name' && key !== 'enabled' && key !== 'group' && item.order !== undefined) {
          orders.add(item.order);
        }
      });
      return Array.from(orders).sort((a, b) => a - b);
    },
    //切换模型配置  
    changeAlgorithmType(value) {
      if (value == 'Size') {
        // 重置相关数据
        this.$set(this.form, 'algorithm_id', '')

        // 使用 nextTick 确保 DOM 更新后再获取算法列表
        this.$nextTick(() => {
          this.querySizeAlgorithmsList();
        });
      } else if (value == 'Ai') {
        // 重置相关数据
        this.$set(this.form, 'model_path', '');

        // 使用 nextTick 确保 DOM 更新后再获取模型列表
        this.$nextTick(() => {
          this.getModels();
        });
      }
    },
    //切换算子类型
    changeParameterIndex(value) {
      console.log('切换算子类型', value);
      this.finish();
    },
    //获取模型路径
    getModels() {
      console.log('获取模型路径');
      getModels().then((res) => {
        this.modulesList = res;
        // 如果模型列表不为空且当前没有选中的模型，则默认选中第一个
        if (this.modulesList && this.modulesList.length > 0) {
          console.log(1111111);
          // console.log('this.classes', this.classes);
          // console.log('this.form', this.form);
          if (!this.form.model_path) {
            console.log(222222);
            console.log('默认选中第一个模型');
            this.$set(this.form, 'model_path', this.modulesList[0]);
            // 默认启用类别1
            this.$nextTick(() => {
              this.classes[0].active = true;
              this.classes[0].name = this.classes[0].desc;
              this.finish();
            });
          }
        } else {
          console.log('没有模型列表，选中尺寸算法');
          // 如果模型列表为空,则选中尺寸算法
          this.form.algorithm_type = 'Size';
          this.querySizeAlgorithmsList();
        }
      });
    },
    //获取尺寸算法列表
    querySizeAlgorithmsList() {
      console.log('获取算法列表');
      this.loading = true;
      querySizeAlgorithmsList()
        .then((res) => {
          this.algorithmList = res;

          // 如果算法列表不为空且当前没有选中的算法，则默认选中第一个
          if (this.algorithmList && this.algorithmList.length > 0 && !this.form.algorithm_id) {
            console.log(3333333);
            console.log('默认选中第一个算法');
            const firstAlgo = this.algorithmList[0];

            // 使用 $set 更新数据
            this.$set(this.form, 'model_path', '');
            this.$set(this.form, 'algorithm_id', firstAlgo.id);

            // 使用 nextTick 确保数据更新后再调用 getSizeAlgoParams
            this.$nextTick(() => {
              this.getSizeAlgoParams(this.form);
            });
          }

          this.loading = false;

          // 如果是质检配置且已选择算法，更新图纸
          if (
            this.configType == "Quality" &&
            this.form.algorithm_type == "Size" &&
            this.form.algorithm_id != 0
          ) {
            const selectedAlgo = this.algorithmList.find(
              item => item.id == this.form.algorithm_id
            );
            if (selectedAlgo) {
              this.$emit("changeDraw", selectedAlgo.blueprint);
            }
          }
        })
        .catch((err) => {
          this.loading = false;
          this.$message.warning("获取尺寸算法列表失败!");
        });
    },
    //选中的当前尺寸算法
    getSizeAlgoParams(e) {
      // 先找到选中的算法
      const selectedAlgorithm = this.algorithmList.find(item => item.id == e.algorithm_id);

      if (selectedAlgorithm) {
        // 创建新的 classes 对象
        const newClasses = {
          ...selectedAlgorithm.inputs_outputs.inputs,
          type: selectedAlgorithm.inputs_outputs.type
        };

        // 使用 $set 更新 form.classes
        this.$set(this.form, 'classes', newClasses);
        // 使用 $set 更新 algorithm_id
        this.$set(this.form, 'algorithm_id', selectedAlgorithm.id);

        // 删除不需要的属性
        if (this.form.classes.classes) {
          this.$delete(this.form.classes, 'classes');
        }

        // 触发图纸更新
        this.$emit("changeDraw", selectedAlgorithm.blueprint);

        // 强制更新视图
        this.$forceUpdate();
      }
    },
    //添加新方法处理名称变更
    handleNameChange(item) {
      // 只有在类别启用时才更新名称
      if (!item.active) return;

      // 更新对应的 resClasses 中的名称
      if (this.resClasses && this.resClasses.length > 0) {
        this.resClasses.forEach(resItem => {
          if (resItem.class === item.class) {
            resItem.name = item.name || item.desc;
          }
        });
      }
      if (this.form.classes.type === 'OperationStage') {
        // 初始化 环节清单枚举项
        this.initializeStepTypes();
      } else
        if (this.form.classes.type === 'Relative') {
          //初始化可用类别
          this.initAvailableClasses();
        }
      // 调用 finish 方法更新配置
      this.finish();
    },
    // 初始化可用类别列表
    initAvailableClasses() {
      console.log('初始化可用类别列表');
      console.log('this.classes', this.form.classes);
      this.availableClasses = this.classes
        .filter(item => item.active)
        .map(item => ({
          id: this.nextId++,
          name: item.name,
          class: item.class
        }));

      // 初始化序列类别 
      this.initSequenceClasses();
    },
    // 初始化序列类别列表
    initSequenceClasses() {
      // 重置序列
      this.sequenceClasses = [];

      // 检查是否存在序列配置
      if (this.form.classes && this.form.classes.classes && Array.isArray(this.form.classes.classes)) {
        // 创建类别映射用于查找类别名称
        const classMap = {};
        this.classes.forEach(item => {
          if (item.active) {
            classMap[item.class] = item.name;
          }
        });

        // 根据form.classes.classes生成序列
        this.form.classes.classes.forEach(item => {
          if (typeof item === 'string') {
            // 如果是字符串形式的类别（如"C1","C2"等）
            const className = item;
            const classObj = this.classes.find(c => c.class === className);
            if (classObj && classObj.active) {
              this.sequenceClasses.push({
                id: this.nextId++,
                name: classObj.name,
                class: className
              });
            }
          } else if (item.class) {
            // 如果是对象形式，包含class属性
            this.sequenceClasses.push({
              id: this.nextId++,
              name: item.name || classMap[item.class] || item.class,
              class: item.class
            });
          }
        });
      }

      console.log('初始化序列类别列表完成', this.sequenceClasses);
    },
    // 克隆类别
    cloneClass(item) {
      return {
        id: this.nextId++,
        name: item.name,
        class: item.class
      };
    },
    // 从序列中移除类别
    removeFromSequence(item) {
      const index = this.sequenceClasses.findIndex(i => i.id === item.id);
      if (index > -1) {
        this.sequenceClasses.splice(index, 1);
        // 调用handleSequenceChange以更新form.classes.classes
        this.handleSequenceChange();
      }
    },
    //拖拽线序序列
    handleSequenceChange(value) {
      console.log('handleSequenceChange', value);
      console.log('handleSequenceChange', this.sequenceClasses);

      // 更新form.classes.classes以反映新的序列
      if (this.form.classes && this.parameterIndex === 'Relative') {
        // 将sequenceClasses转换为classes数组
        const classes = this.sequenceClasses.map(item => item.class);
        this.$set(this.form.classes, 'classes', classes);

        // 确保emit submitConfig以通知父组件配置已更新
        this.$emit("submitConfig", true);
      }
    },
    //模型选择AI算法完成
    finish() {
      console.log('changeParameterIndex', this.parameterIndex);

      // min_area 通过计算属性已经在 form 中设置或移除，这里不需要再额外处理
      this.actClasses = [];
      // 创建一个映射来存储现有的配置
      const existingConfigs = {};
      if (this.resClasses && this.resClasses.length > 0) {
        this.resClasses.forEach(item => {
          existingConfigs[item.class] = item;
        });
      }
      // 重置 resClasses
      this.resClasses = [];
      // 处理每个类别
      this.classes.forEach((item) => {
        // 当类别被禁用时，清空其名称
        if (!item.active) {
          item.name = "";
        }

        if (item.active) {
          item.name = item.name || item.desc;
          // 检查是否存在现有配置
          if (existingConfigs[item.class] && this.form.classes.type == this.parameterIndex) {
            console.log(121212);
            // 如果存在，使用现有配置
            this.resClasses.push(existingConfigs[item.class]);
          } else {
            console.log(232323);
            // 如果不存在，创建新的配置
            let newConfig = {
              class: item.class,
              name: item.name,
            };

            switch (this.parameterIndex) {
              case "Stage":
                newConfig.parameter = {
                  continuous: "10",
                };
                break;
              case "Speed":
                newConfig.parameter = {
                  speed: 10,
                };
                break;
              case "Surface":
                newConfig.parameter = {
                  area: 10,
                  count: 0,
                  length: 0,
                  width: 0,
                  ratio: "0",
                };
                break;
              case "Relative":
                newConfig.parameter = {
                  min_area: 0,
                  min_length: 0,
                  min_width: 0,
                  min_length_width_ratio: 1,
                };
                break;
              case "OperationStage":
                newConfig.parameter = {
                  min_area: 0,
                  min_length: 0,
                  min_width: 0,
                  min_length_width_ratio: 1,
                  min_continuous: "0",
                };
                break;
              case "ScanRecognition":
                newConfig.parameter = {
                  min_area: 0,
                  min_length: 0,
                  min_width: 0,
                  min_length_width_ratio: 1,
                  min_continuous: "0",
                };
                break;
            }
            this.resClasses.push(newConfig);
          }
        }
      });
      if (this.resClasses.length > 0) {
        console.log(44444);
        // if (!this.form.classes) {
        this.form.classes = {};
        // }
        this.form.classes.type = this.parameterIndex;
        if (this.form.classes.type == 'Relative') {
          this.form.classes.feature_sets = this.resClasses;
          // 如果是位置序列类型，保存当前序列到classes
          if (this.sequenceClasses && this.sequenceClasses.length > 0) {
            this.form.classes.classes = this.sequenceClasses.map(item => item.class);
          } else {
            this.form.classes.classes = [];
          }
        } else if (this.form.classes.type == 'OperationStage') {
          this.initializeStepTypes();
          this.handleClassesData();
        } else {
          this.form.classes.classes = this.resClasses;
        }
        let timeAnchor = Date.now();
        let anchorData = {
          actClasses: this.resClasses,
          resClasses: this.resClasses,
          classes: this.classes,
          parameterIndex: this.parameterIndex,
        };
        this.form["_timeAnchor"] = timeAnchor;
        localStorage.setItem(timeAnchor, JSON.stringify(anchorData));
        this.$emit("submitConfig", true);
      }
    },
    //模型选择尺寸算法确认
    algoFinish() {
      if (this.form.algorithm_id) {
        // this.type = 2;
        this.form.classes.classes = [];
        this.$emit("submitConfig", true);
      } else {
        this.$message.warning("请选择算法!");
      }
    },
    //环节重置
    reset() {
      this.finish();
    },
    //AI算法阈值实时更新参数
    affirm() {
      let isFinish = true;
      // 更新 this.resClasses 的逻辑
      this.resClasses.forEach((item) => {
        if (item.name == "") {
          isFinish = false;
        }
        switch (this.parameterIndex) {
          case "Stage":
            if (item.parameter.continuous == "") {
              isFinish = false;
            }
            break;
          case "Speed":
            if (item.parameter.speed == null) {
              isFinish = false;
            }
            break;
          case "Surface":
            if (
              item.parameter.area == null ||
              item.parameter.area == 0 ||
              item.parameter.count == null ||
              item.parameter.length == null ||
              item.parameter.width == null ||
              item.parameter.ratio == undefined
            ) {
              this.$message.warning("请完善配置信息!");
              isFinish = false;
            } else {
              if (!Number.isInteger(item.parameter.area) ||
                !Number.isInteger(item.parameter.count) ||
                !Number.isInteger(item.parameter.length) ||
                !Number.isInteger(item.parameter.width)) {
                isFinish = false;
                this.$message.warning("请输入整数!");
              }
            }
            break;
        }
      });
      if (isFinish) {
        this.form.classes.classes = this.resClasses; // 确保更新
        this.$emit("submitConfig", true);
      }
      //试运行时更新AI阈值参数
      const queryParams = {
        ...(this.minAreaAtcive ? { min_area: this.form.min_area } : {}), // 如果启用最小面积，则传递 this.form.min_area，否则不传
      };

      const requestBody = {
        type: this.form.classes.type, // 当前算法类型
        classes: [
          ...this.form.classes.classes // 当前算法阈值
        ]
      };
      updateTrialRunning(queryParams, requestBody).then(res => {
        this.$message.success('AI阈值试运行参数更新成功！');
      })
    },
    //尺寸算法阈值确认
    algoAffirm() {
      this.$emit("submitConfig", true);
      //试运行时更新尺寸阈值参数
      const queryParams = {};

      const requestBody = {
        ...this.form.classes //当前算法阈值
      };
      updateTrialRunning(queryParams, requestBody).then(res => {
        this.$message.success('尺寸阈值试运行参数更新成功！');
      })
    },
    // 添加锁定切换方法
    toggleLock() {
      this.isLocked = !this.isLocked;
    },
    // 添加判断是否为特殊字段的辅助方法
    isRadioField(key) {
      return key === 'radio0' || key === 'radio1' || key === 'radio2' || key === 'radio3';
    },
    // 添加输入值处理方法
    handleInputValue(value, key) {
      // 如果是radio字段且值为0，则自动改为1
      if (this.isRadioField(key) && (value === 0 || value === '0')) {
        this.$nextTick(() => {
          this.form.classes[key].value = 1;
          // 提示用户已自动调整值
          this.$message.warning(`${key}字段不能为0，已自动调整为1`);
        });
      }
    },
    // 计算拖拽项的样式
    getDragItemStyle(name) {
      let style = {};
      if (name) {
        if (name.includes('红')) {
          style.backgroundColor = '#f85c5c';
          style.color = '#ffffff';
        } else if (name.includes('黄')) {
          style.backgroundColor = '#f8e05c';
          style.color = '#000000';
        } else if (name.includes('绿')) {
          style.backgroundColor = '#3ac233';
          style.color = '#ffffff';
        } else if (name.includes('白')) {
          style.backgroundColor = '#ffffff';
          style.color = '#000000';
        } else if (name.includes('黑')) {
          style.backgroundColor = '#000000';
          style.color = '#ffffff';
        } else if (name.includes('粉')) {
          style.backgroundColor = '#ffc0cb';
          style.color = '#ffffff';
        } else if (name.includes('蓝')) {
          style.backgroundColor = '#4282C9';
          style.color = '#ffffff';
        } else if (name.includes('棕')) {
          style.backgroundColor = '#8B4513';
          style.color = '#ffffff';
        }
        return style;
      }
    },
    // 处理序列数量变化
    handleSequenceCountChange(value) {
      this.sequenceCount = value;

      // 更新所有已选择序列项的类别
      Object.keys(this.classStepTypes).forEach(classKey => {
        const stepType = this.classStepTypes[classKey];
        if (stepType && stepType.startsWith('sequence_')) {
          const sequenceNum = parseInt(stepType.split('_')[1]);
          if (sequenceNum > value) {
            this.$set(this.classStepTypes, classKey, 'checklist');

            // 同时更新 form.classes 中的数据
            this.handleClassesData();
          }
        }
      });

      // 触发配置更新
      this.$emit("submitConfig", true);
    },
    // 处理步骤类型变化
    handleStepTypeChange(value, item) {
      // 更新 classStepTypes
      this.$set(this.classStepTypes, item.class, value);

      // 更新 form.classes 中的数据
      this.handleClassesData();
      // 触发配置更新
      this.$emit("submitConfig", true);
    },
    // 初始化环节清单枚举项
    initializeStepTypes() {
      console.log('初始化stepTypes2222222');
      // 获取激活的类别并按照类别编号排序
      const activeClasses = this.classes
        .filter(item => item.active)
        .sort((a, b) => {
          const numA = parseInt(a.class.substring(1));
          const numB = parseInt(b.class.substring(1));
          return numA - numB;
        });

      if (activeClasses.length >= 3) {
        // 重置所有 stepTypes
        this.classStepTypes = {};

        // 设置最小编号的类别为起点
        this.$set(this.classStepTypes, activeClasses[0].class, 'start');

        // 设置最大编号的类别为终点
        this.$set(this.classStepTypes, activeClasses[activeClasses.length - 1].class, 'end');

        // 设置中间的类别为清单项
        for (let i = 1; i < activeClasses.length - 1; i++) {
          this.$set(this.classStepTypes, activeClasses[i].class, 'checklist');
        }
        // 触发配置更新
        this.$emit("submitConfig", true);
      }
    },
    //处理环节清单form.classes数据
    handleClassesData() {
      const operationStageData = {
        type: 'OperationStage',
        start: null,
        end: null,
        unordered: [],
        ordered: []
      };

      // 遍历所有激活的类别
      this.activeClasses.forEach(item => {
        const stepType = this.classStepTypes[item.class];
        const classData = this.resClasses.find(c => c.class === item.class);

        if (stepType === 'start') {
          operationStageData.start = classData;
        } else if (stepType === 'end') {
          operationStageData.end = classData;
        } else if (stepType === 'checklist') {
          operationStageData.unordered.push(classData);
        } else if (stepType && stepType.startsWith('sequence_')) {
          const sequenceNum = parseInt(stepType.split('_')[1]);
          if (!operationStageData.ordered[sequenceNum - 1]) {
            operationStageData.ordered[sequenceNum - 1] = [];
          }
          operationStageData.ordered[sequenceNum - 1].push(classData);
        }
      });

      // 移除空的序列数组
      operationStageData.ordered = operationStageData.ordered.filter(sequence => sequence && sequence.length > 0);

      // 更新 form.classes
      this.form.classes = operationStageData;
      console.log('处理后的444444444444444form.classes', this.form.classes);
    }
  },
};
</script>

<style lang="scss">
.el-radio__input.is-checked .el-radio__inner {
  border-color: #000000 !important;
  background-color: #000000 !important;
}

.el-radio__input.is-checked+.el-radio__label {
  color: #000000 !important;
}

.modelClass {
  *::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: transparent !important;
  }

  *::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #dadada !important;
  }

  .disabled-input {
    color: #999;
    padding-left: 10px;
  }

  .size-box {
    width: 660px;
    border: 1px solid #ffb145;
    border-radius: 7px;
    margin: 10px auto;
    display: flex;
    justify-content: start;
    align-items: start;
    padding: 7px 18px 7px 0;

    .fat {
      padding-left: 20px;
      display: flex;
      justify-content: end;
      align-content: start;

      .item {
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: end;
        align-items: center;

        .el-radio-group {
          display: flex;

          .el-radio__input.is-checked .el-radio__inner {
            border-color: #f4ac45 !important;
            background: #f4ac45 !important;
          }

          .el-radio__input.is-checked+.el-radio__label {
            color: #f4ac45 !important;
          }

          .el-radio__inner:hover {
            border-color: #f4ac45 !important;
          }
        }
      }

      .ipt {
        width: 110px;
      }
    }

    .son {
      flex: 1;
      height: 100%;
      display: flex;
      justify-content: start;
      flex-wrap: wrap;
      padding-left: 10px;

      .item {
        padding-left: 10px;
        height: 50px;
        display: flex;
        justify-content: end;
        align-items: center;

        .ipt {
          width: 110px;
        }
      }
    }

    &:empty {
      border: none;
    }
  }

  .card-title {
    width: 100%;
    display: flex;
    justify-content: start;
    align-items: center;

    .title {
      width: 120px;
      color: rgba(0, 0, 0, 1);
      font-size: 20px;
      font-weight: 600;
      text-align: left;
      font-family: PingFangSC-bold;
    }

    .btn {
      margin-bottom: 15px;
      margin-right: 10px;
      cursor: pointer;
      border-radius: 10px 10px 10px 10px;
      background-color: rgba(0, 0, 0, 1);
      color: rgba(255, 255, 255, 1);
      font-size: 16px;
      padding: 5px 15px;
      text-align: center;
      font-family: Roboto;
    }
  }

  .line {
    width: 100%;
    padding-top: 32px; //0.2rem
    padding-bottom: 29px; //0.181rem
    display: flex;
    justify-content: center;
    align-items: center;

    .item {
      display: flex;
      justify-content: center;
      align-items: center;

      .line-content {
        width: 109px;
        height: 42px;
        line-height: 42px;
        border-radius: 10px 10px 10px 10px;
        font-size: 18px;
        text-align: center;
        font-family: Roboto;
        cursor: pointer;
      }

      .icon {
        width: 0;
        height: 0;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        border-left: 6px solid #999999;
      }

      .content-active {
        background-color: rgba(249, 149, 0, 1);
        color: rgba(255, 255, 255, 1);
      }

      .content-noactive {
        background-color: rgba(237, 237, 237, 1);
        color: rgba(187, 187, 187, 1);
      }
    }
  }

  .marg-top {
    margin-top: 48px;
  }

  .card {
    margin: 9.94px 15px 0 15px;
  }

  .form {
    width: 100%;
    flex-grow: 1;
    margin-top: 10px;

    .el-form {
      .el-form-item {
        .el-form-item__label {
          font-size: 16px;
          color: #333;
        }

        .el-form-item__content {
          font-size: 16px;

          .el-input {
            .el-input__inner {
              height: 40px !important;
              line-height: 40px !important;
            }
          }
        }
      }
    }

    .form-area {
      margin: 24px auto;
      border: #eb9a36 solid 1px;
      padding: 20px 0px 0 0px;
      border-radius: 6px 6px 6px 6px;

      .ipt {
        width: 100%;
        border-radius: 0px 0px 6px 6px;
        background-color: rgba(255, 220, 172, 1);
        font-size: 18px;
        text-align: center;
        font-family: Roboto;
        border: 1px solid rgba(255, 177, 69, 1);
        padding: 5px 0;
      }
    }

    .classes {
      width: 100%;
      display: flex;
      justify-content: start;
      flex-flow: row wrap;

      .classes-item {
        width: 50%;
        display: flex;
        justify-content: start;
        align-items: center;

        .el-form-item {
          display: flex;
          flex-direction: row;

          .el-form-item__label {
            width: 90px !important;
          }

          .el-form-item__content {
            margin-left: 0px !important;
            margin-right: 10px;
          }
        }

        .switch {
          width: 40px;
          height: 20px;
        }
      }
    }

    .min-area {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .unit {
        font-size: 12px;
      }

      .switch {
        width: 37px;
        height: 20px;
      }
    }

    .cancal {
      position: absolute;
      right: 141px;
      bottom: 50px;
    }

    .finish {
      position: absolute;
      right: 53px;
      bottom: 52px;
    }

    .container {
      display: flex;
      flex-wrap: wrap;
      flex: 1;
      // gap: 20px;
      padding: 20px 10px 20px 10px;
      // height: calc(100vh - 650px);
      max-height: calc(100vh - 580px);
      // height: 600px;
      // max-height: 600px;
      margin-top: 10px;
      // flex-grow: 1;
      // width: 100%;
      overflow-y: auto;
      overflow-x: hidden;

      .group {
        border: 2px solid #ffb145;
        border-radius: 8px;
        padding: 25px;
        position: relative;
        min-width: 620px;
        width: 620px;
        margin-bottom: 20px;

        .group-header {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 15px;
          text-align: center;
          color: #333;
          position: absolute;
          top: -15px;
          left: 300px;
          padding: 5px;
          border: 2px solid #ffb145;
          border-radius: 4px;
          background: #ffffff;
        }

        .group-content {
          .row {
            margin-bottom: 15px;
            margin-top: 10px;

            &.pair-row {
              display: flex;
              justify-content: space-between;
              gap: 10px;
            }

            .not-pair,
            .left,
            .right {
              display: flex;
              align-items: center;
              gap: 10px;

              .label {
                min-width: 120px;
                // width: 120px;
                color: #333;
                font-size: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .el-input {
                width: 120px;
              }

              .el-radio-group {
                display: flex;
                // gap: 10px;

                .el-radio {
                  display: flex;
                  align-items: center;
                }
              }
            }
          }
        }
      }
    }

  }

  .stage-box {
    padding: 20px;

    .step-l {
      display: flex;
    }

    .step {
      overflow-x: auto;
      overflow-y: hidden;

      .step-box {
        display: flex;
        padding-top: 17px; //0.2rem
        padding-bottom: 14px; //0.181rem
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;

        .item {

          // width: 20%;
          .title {
            height: 29px;
            width: 100%;
            line-height: 25px;
            color: rgba(249, 149, 0, 1);
            font-size: 18px;
            font-family: PingFangSC-bold;
            text-align: center;
            padding: 0;
          }

          .bod {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;

            .bod-line {
              width: 58px;
              height: 0px;
              border: solid 1px #c3c3c3;
            }

            .item {
              min-width: 80px;
              min-height: 38px;
              line-height: 38px;
              border-radius: 20px;
              cursor: pointer;
              background-color: rgba(255, 255, 255, 1);
              color: rgba(0, 0, 0, 1);
              font-size: 14px;
              text-align: center;
              font-family: Roboto;
              text-overflow: ellipsis;
            }

            .active {
              background: #ffc174;
              font-size: 14px;
              font-weight: 500;
            }

            .noactive {
              border: 1px solid #ffc174;
            }

            .icon {
              width: 0;
              height: 0;
              border-top: 4px solid transparent;
              border-bottom: 4px solid transparent;
              border-left: 6px solid #999999;
            }
          }
        }
      }
    }
  }

  .el-button {
    padding: 0px;
  }

  .el-icon-lock,
  .el-icon-unlock {
    font-size: 24px;
    color: #989797;
    cursor: pointer;
  }

  .position-card {
    .position-form-area {
      max-height: calc(100vh - 580px);
      overflow-y: auto;

      .feature-item {
        margin-right: 5px;
        margin-bottom: 20px;
        padding: 10px 0px 10px 10px;
        border: 2px solid #ffb145;
        border-radius: 8px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;

        .feature-header {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          text-align: center;
          width: 260px;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;

          a {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 4px;
            margin-left: 5px;
            border: 1px solid #e0e0e0;
          }
        }

        .unit {
          margin-left: 5px;
          color: #666;
        }

        .el-form {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          flex-wrap: wrap;

          .el-form-item {
            margin-bottom: 2px;
            margin-right: 10px;

            .el-form-item__label {
              width: 110px !important;
              font-size: 14px;
              color: #333;
            }

            .el-form-item__content {
              font-size: 14px;
              margin-left: 0px !important;
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: flex-start;

              .el-input-number {
                width: 100px !important;
              }
            }
          }
        }
      }


    }

    .sequence-container {
      display: flex;
      margin: 20px;
      min-height: 400px;
      max-height: 400px;
      border-radius: 8px;
      background: linear-gradient(to bottom, #f9f9f9, #f1f1f1);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;

      .available-classes {
        div {
          // &:nth-child(1) {
          max-height: 320px;
          overflow-y: auto;
          // }
        }
      }

      .available-classes,
      .sequence-classes {
        flex: 1;
        padding: 10px;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(255, 255, 255, 0.7);
        }

        h3 {
          margin-bottom: 20px;
          color: #333;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          position: relative;
          padding-bottom: 10px;

          &:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 3px;
            background: #ffb145;
            border-radius: 2px;
          }
        }
      }

      .divider {
        width: 1px;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.03));
        position: relative;

        &:before {
          content: '';
          position: absolute;
          top: 50%;
          left: -5px;
          width: 10px;
          height: 10px;
          background-color: #ffb145;
          border-radius: 50%;
          transform: translateY(-50%);
        }
      }

      .drag-item {
        padding: 12px 18px;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        font-weight: 500;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;

        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.4);
        }

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .el-icon-close {
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.2s ease;

          &:hover {
            opacity: 1;
            transform: rotate(90deg);
            background: rgba(0, 0, 0, 0.25);
          }
        }
      }

      .sequence-list {
        min-height: 300px;
        max-height: 300px;
        overflow-y: auto;
        padding: 15px;
        border: 1px dashed rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;

        &:hover {
          border-color: #ffb145;
          background-color: rgba(255, 255, 255, 0.9);
        }
      }

      .empty-sequence-tip {
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 14px;
        border: 2px dashed #eee;
        border-radius: 8px;
        margin: 40px 0;
        background: repeating-linear-gradient(45deg,
            rgba(0, 0, 0, 0.01),
            rgba(0, 0, 0, 0.01) 10px,
            rgba(0, 0, 0, 0.03) 10px,
            rgba(0, 0, 0, 0.03) 20px);
        transition: all 0.3s ease;

        &:hover {
          border-color: #ffb145;
          color: #666;
        }
      }
    }
  }

  .steplist-container {
    padding: 20px;

    .insufficient-classes {
      text-align: center;
      color: #ff4d4f;
      font-size: 16px;
      padding: 40px 0;
    }

    .steplist-content {
      .sequence-count {
        margin-bottom: 20px;
        display: flex;
        align-items: center;

        .label {
          margin-right: 10px;
          font-size: 14px;
          color: #333;
        }

        .el-input-number {
          width: 100px;
        }
      }

      .class-list {
        display: flex; // 使用flex布局
        gap: 20px; // 左右间距
        margin-top: 20px;

        .left-settings {

          .class-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;

            .class-name {
              min-width: 80px; // 调整名称最小宽度
              margin-right: 10px;
              font-size: 14px;
              color: #333;
              white-space: nowrap; // 防止名称换行
              overflow: hidden; // 超出隐藏
              text-overflow: ellipsis; // 显示省略号
            }

            .el-select {
              width: 100px;
            }
          }
        }

        .right-diagram {
          flex: 1; // 占据剩余空间
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          display: flex; // 使用flex布局
          flex-direction: column;

          .process-diagram {
            height: 100%; // 占满容器高度
            display: flex;
            flex-direction: column;
            justify-content: space-between; // 上中下分布

            .node {
              padding: 5px;
              background: #fff;
              border: 1px solid #ffb145;
              border-radius: 6px;
              text-align: center;
              min-width: 40px; // 设置最小宽度
              margin-bottom: 10px;

              &.start-node {
                background: #e8f5e9;
                align-self: center; // 居中对齐
                margin-bottom: 20px; // 增加与中间部分的间距
              }

              &.end-node {
                background: #ffebee;
                align-self: center; // 居中对齐
                margin-top: 20px; // 增加与中间部分的间距
              }
            }

            .middle-section {
              flex: 1;
              display: flex;
              justify-content: center;
              gap: 10px;
              min-height: 200px; // 设置最小高度

              .checklist-items {
                display: flex;
                flex-wrap: wrap;
                align-content: flex-start;
                gap: 5px;
                padding: 10px;
                border: 1px dashed #ddd;
                border-radius: 6px;
                background: rgba(249, 249, 249, 0.5); // 轻微背景色



                .checklist-item {
                  min-width: 0px; // 设置最小宽度
                }
              }

              .sequence-lists {
                display: flex;
                gap: 10px;

                .sequence-list-item {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  border: 1px dashed #ddd;
                  border-radius: 6px;
                  background: rgba(249, 249, 249, 0.5);
                  padding: 10px;

                  .sequence-title {
                    text-align: center;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #666;
                  }

                  .sequence-items-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;

                    .sequence-item-box {
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;

                      .sequence-item-node {
                        padding: 0.026042rem;
                        background: #fff;
                        border: 0.005208rem solid #ffb145;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        z-index: 1;
                      }

                      .sequence-arrow-box {
                        width: 30px;
                        height: 35px;
                        position: relative;
                        display: flex;
                        justify-content: center;
                        align-items: center;

                        .arrow-line {
                          width: 2px;
                          height: 30px;
                          background-color: #ffb145;
                          position: absolute;
                          top: 0;
                        }

                        .arrow-head {
                          width: 10px;
                          height: 10px;
                          border: 2px solid #ffb145;
                          border-left: 0;
                          border-top: 0;
                          transform: rotate(45deg);
                          position: absolute;
                          bottom: 2px;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        .right-diagram-placeholder {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #ff4d4f;
          font-size: 16px;
          background: #fff;
        }
      }
    }
  }
}
</style>
