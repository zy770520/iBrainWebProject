<template>
  <div class="sizeAlgorithm-config" v-loading="loading">
    <el-form :model="sizeAlgorithmForm" :rules="rules" ref="sizeAlgorithmForm" label-position="right"
      label-width="0.53rem" label-w label-suffix="：" class="sizeAlgorithmForm">
      <div class="blueprint" :class="{ blueprintError: blueprintNull }">
        <el-upload class="longFileUpload" ref="longFileUpload" action="#" drag
          :http-request="(param) => UploadImage('blueprint', param)" :accept="accept" :auto-upload="true"
          :show-file-list="false">
          <div v-if="percentage.blueprint.file" class="blueprint-img"
            :style="{ backgroundImage: `url(${percentage.blueprint.file})` }"></div>
          <el-button v-else type="text" :loading="false" :disabled="sizeAlgorithmForm.id == 0 && !isCreated"
            class="comUploadBtn blueprint">点击/拖拽上传图纸</el-button>
        </el-upload>
        <el-progress v-if="percentage.blueprint.show" :percentage="percentage.blueprint.v"
          :text-inside="true"></el-progress>
      </div>
      <div class="paramsBox">
        <div class="tools">
          <el-button class="comBtn" :disabled="sizeAlgorithmForm.id == 0 && !isCreated"
            @click="submitForm()">确认</el-button>
        </div>
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane label="程序" name="procedure">
            <div class="tabForm">
              <el-form-item label="名称" prop="name">
                <el-input v-model="sizeAlgorithmForm.name" :disabled="sizeAlgorithmForm.id == 0 && !isCreated"
                  placeholder="请输入名称" style="width: 50%;"></el-input>
              </el-form-item>
              <el-form-item label="模型文件" prop="model"
                :rules="sizeAlgorithmForm.id == 0 ? [{ required: true, message: '请上传模型文件', trigger: 'blur' }] : []">
                <el-col :span="4">
                  <el-select v-model="sizeAlgorithmForm._modelType" placeholder="请选择模型类型"
                    :disabled="sizeAlgorithmForm.id == 0 && !isCreated" @change="modelTypeChange">
                    <el-option v-for="v in modelTypes" :key="v.value" :label="v.label" :value="v.value"></el-option>
                  </el-select>
                </el-col>
                <el-col class="line" :span="1">&nbsp;</el-col>
                <el-col :span="11">
                  <el-upload action="#" ref="longFileModelUpload" :http-request="(param) => UploadImage('model', param)"
                    :accept="modelAccept" :auto-upload="true" :show-file-list="false">
                    <el-button size="small" type="text" :disabled="sizeAlgorithmForm.id == 0 && !isCreated"
                      class="comUploadBtn">点击上传模型文件</el-button>
                  </el-upload>
                  <el-progress v-if="percentage.model.show" :percentage="percentage.model.v"
                    :text-inside="true"></el-progress>
                </el-col>
              </el-form-item>
              <el-form-item label="标定文件" prop="calibration"
                :rules="sizeAlgorithmForm.id == 0 ? [{ required: true, message: '请上传标定文件', trigger: 'blur' }] : []">
                <el-upload action="#" ref="longFileCalibrationUpload"
                  :http-request="(param) => UploadImage('calibration', param)" :accept="calibrationAccept"
                  :auto-upload="true" :show-file-list="false">
                  <el-button size="small" type="text" :disabled="sizeAlgorithmForm.id == 0 && !isCreated"
                    class="comUploadBtn">点击上传标定文件</el-button>
                </el-upload>
                <el-progress v-if="percentage.calibration.show" :percentage="percentage.calibration.v"
                  :text-inside="true"></el-progress>
              </el-form-item>
              <el-form-item label="块尺寸" prop="board.tile_size">
                <el-input v-model="sizeAlgorithmForm.board.tile_size"
                  :disabled="sizeAlgorithmForm.id == 0 && !isCreated" placeholder="请输入块尺寸值"
                  style="width: 50%;"></el-input>
              </el-form-item>
              <el-form-item label="棋盘格类型">
                <el-radio-group v-model="sizeAlgorithmForm.board.type"
                  :disabled="sizeAlgorithmForm.id == 0 && !isCreated">
                  <el-radio :label="'CheckerboardExhaustive'">详尽棋盘格</el-radio>
                  <el-radio :label="'DotGrid'">点网格</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </el-tab-pane>
          <el-tab-pane label="输入" name="input">
            <div class="tabForm" style="display: flex;flex-direction: column;">
              <el-form-item label-width="0"> <!-- prop="inputs_outputs.inputs" -->
                <el-upload ref="longFileInputUpload" action="#"
                  :http-request="(param) => UploadInputOutput('input', param)" :accept="inputAccept" :auto-upload="true"
                  :show-file-list="false">
                  <el-button size="small" type="text" :disabled="sizeAlgorithmForm.id == 0 && !isCreated"
                    class="comUploadBtn">点击上传配置文件</el-button>
                </el-upload>
                <el-progress v-if="percentage.input.show" :percentage="percentage.input.v" :text-inside="true"
                  :stroke-width="13" color="#D28A90"></el-progress>
              </el-form-item>
              <!-- <div class="dataListBox" v-if="inputOrOutputDataList.inputList.length > 0">
                <div class="list" v-for="(v, k) in inputOrOutputDataList.inputList">
                  <div class="parent label" v-if="v.name">{{ v.name }}{{ v.children.length > 0 ? '：' : ''
                  }}</div>
                  <div v-if="v.children.length > 0" class="children">
                    <div class="label" v-for="(cv, ck) in v.children">{{ cv.name }}</div>
                  </div>
                </div>
              </div> -->
              <div class="container">
                <div v-for="(group, index) in inputOrOutputDataList.inputList" :key="index" v-if="group.enabled"
                  class="group">
                  <div class="group-header">{{ group.name }}</div>
                  <div class="group-content">
                    <template v-for="order in getOrderedNumbers(group)">
                      <div v-for="(item, key) in group" :key="key"
                        v-if="item.enabled && key !== 'name' && key !== 'enabled' && key !== 'group' && item.pair_place === 'NotPair' && item.order === order"
                        class="row">
                        <div class="not-pair">
                          {{ item.name }}
                        </div>
                      </div>
                      <template v-for="(item, key) in group">
                        <div
                          v-if="item.enabled && key !== 'name' && key !== 'enabled' && key !== 'group' && item.pair_place === 'Left' && item.order === order"
                          class="row pair-row" :key="key">
                          <div class="left">{{ item.name }}</div>
                          <template v-for="(rightItem, rightKey) in group">
                            <div
                              v-if="rightItem.enabled && rightItem.pair_place === 'Right' && rightItem.order === order"
                              :key="rightKey" class="right">
                              {{ rightItem.name }}
                            </div>
                          </template>
                        </div>
                      </template>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="输出" name="output">
            <div class="tabForm">
              <el-form-item label-width="0"><!-- prop="inputs_outputs.outputs" -->
                <el-upload ref="longFileOutputUpload" action="#"
                  :http-request="(param) => UploadInputOutput('output', param)" :accept="outputAccept"
                  :auto-upload="true" :show-file-list="false">
                  <el-button size="small" type="text" :disabled="sizeAlgorithmForm.id == 0 && !isCreated"
                    class="comUploadBtn">点击上传配置文件</el-button>
                </el-upload>
                <el-progress v-if="percentage.output.show" :percentage="percentage.output.v" :text-inside="true"
                  :stroke-width="13" color="#D28A90"></el-progress>
              </el-form-item>
              <div class="dataListBox" v-if="inputOrOutputDataList.outputList.length > 0">
                <div class="list" v-for="(v, k) in inputOrOutputDataList.outputList">
                  <div class="parent label" v-if="v.name && v.enabled">{{ v.name }}</div>
                  <div v-if="v.children.length > 0" class="children">
                    <div class="label" v-for="(cv, ck) in v.children">{{ cv.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-form>
  </div>
</template>

<script>
import { querySizeAlgorithmsList, createSizeAlgorithm, updateSizeAlgorithm, parseInputsOrOutputs } from '@/api/softwareRegistration/sizeAlgorithm.js'
const defSizeAlgorithmForm = {
  id: 0,
  name: '',  //算法名称
  blueprint: '', //图纸
  model: '',   //模型
  _modelType: 'Size',
  calibration: '', //标定
  inputs_outputs: {  //输入输出
    type: 'Size',
    inputs: null,
    outputs: null
  },
  board: {
    tile_size: 1,
    type: 'CheckerboardExhaustive'
  }
}
export default {
  name: "config",
  components: {},
  props: {
    isCreated: {
      type: Boolean,
      default: () => false,
    }
  },
  data() {
    return {
      loading: false,
      accept: '.bmp,.png,.jpg,.jpeg',
      modelAccept: '.vpp,.VPP',
      calibrationAccept: '.bmp',
      inputAccept: '.toml',
      outputAccept: '.toml',
      percentage: {},
      blueprintNull: false,
      inputOrOutputDataList: {},
      activeName: 'procedure',
      modelTypes: [
        { value: 'Size', label: '尺寸' },
        { value: 'Thick', label: '厚度' },
      ],
      sizeAlgorithmForm: {},
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
          { validator: this.checkName, trigger: 'blur' }
        ],
        'board.tile_size': [
          { required: true, message: '请输入块尺寸值', trigger: 'change' },
          { validator: this.checkPositiveNumber, trigger: 'blur' },
          { validator: this.checkIsNumber, trigger: 'blur' }
        ],
        'inputs_outputs.inputs': [
          { required: true, message: '请上传输入配置文件', trigger: 'blur' },
        ],
        'inputs_outputs.outputs': [
          { required: true, message: '请上传输出配置文件', trigger: 'blur' },
        ]
      }
    };
  },
  watch: {},
  created() {
    this.initData();
  },
  computed: {},
  methods: {
    iData() {
      this.percentage = {
        blueprint: { show: false, v: 0, file: '' },
        model: { show: false, v: 0, file: '' },
        calibration: { show: false, v: 0, file: '' },
        input: { show: false, v: 0, file: '' },
        output: { show: false, v: 0, file: '' }
      }
      this.inputOrOutputDataList = {
        input: {},
        inputList: [],
        output: {},
        outputList: []
      };
      if (this.$refs.sizeAlgorithmForm) {
        this.$refs.sizeAlgorithmForm.resetFields();
        this.$refs.longFileUpload.clearFiles()
        this.$refs.longFileModelUpload.clearFiles()
        this.$refs.longFileCalibrationUpload.clearFiles()
      }
    },
    init(data = {}) {
      this.iData();
      let _data = JSON.parse(JSON.stringify(data))
      console.log("🚀 ~ init ~ _data:", _data)
      if (_data['id'] > 0) {
        // this.parsingObject(data['inputs_outputs']['inputs'], this.inputOrOutputDataList.inputList);
        let getInputList = this.generateArrayFromJson(data['inputs_outputs']['inputs']);
        this.inputOrOutputDataList.inputList = getInputList;
        this.parsingObject(data['inputs_outputs']['outputs'], this.inputOrOutputDataList.outputList);
      }
      this.percentage['blueprint']['file'] = this.arrayBufferToImage(_data['blueprint'])
      _data['blueprint'] = '';
      this.sizeAlgorithmForm = { ...defSizeAlgorithmForm, ..._data };
      this.sizeAlgorithmForm['_modelType'] = _data['inputs_outputs']['type'];
      this.sizeAlgorithmForm.board.tile_size = _data.board.tile_size;
      this.sizeAlgorithmForm.board.type = _data.board.type;
    },
    initData() {
      this.iData();
      this.sizeAlgorithmForm = JSON.parse(JSON.stringify(defSizeAlgorithmForm));
    },
    //二进制数组转图片
    arrayBufferToImage(arrayBuffer) {
      const uint8ArrayOfImageData = new Uint8Array(arrayBuffer);
      const blob = new Blob([uint8ArrayOfImageData], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    },
    //上传文件
    UploadImage(type, param) {
      this.blueprintNull = false;
      this.$nextTick(() => {
        this.readerFile(type, param.file);
      })
    },
    //上传输入输出
    UploadInputOutput(type, param) {
      let oFile = param.file;
      let _this = this;
      var reader = new FileReader();
      reader.onload = function (ev) {
        const buffer = ev.target.result;
        let _accept = _this[type == 'input' ? 'inputAccept' : 'outputAccept'].split(',');
        let fileType = false, fileInfos = [], suffix = '';
        if (!oFile.type) {
          fileInfos = oFile.name.split('.');
          suffix = fileInfos[fileInfos.length - 1];
        } else {
          fileInfos = oFile.type.split('/');
          suffix = fileInfos[fileInfos.length - 1];
        }
        fileType = _accept.includes(`.${suffix}`);
        if (!fileType) {
          let fileInfos = oFile.name.split('.');
          let suffix = fileInfos[fileInfos.length - 1];
          _this.$message.warning(`${type == 'input' ? '输入配置文件' : '输出配置文件'}‘${suffix}’类型不支持`);
          return false;
        }
        _this.percentage[type].show = true;
        _this.percentage[type].v = 0;
        let params = new FormData()
        params.append('file', oFile)
        params.append('ty', _this.sizeAlgorithmForm._modelType)

        parseInputsOrOutputs(type, params, (e) => {
          let progress = ((e.loaded / e.total) * 100) | 0;
          _this.percentage[type].v = progress;
        }).then(res => {
          _this.sizeAlgorithmForm['inputs_outputs'][type == 'input' ? 'inputs' : 'outputs'] = JSON.parse(JSON.stringify(res)) || null;
          _this.inputOrOutputDataList[type] = JSON.parse(JSON.stringify(res))
          if (type == 'input') {
            _this.inputOrOutputDataList.inputList = [];
            // _this.parsingObject(res, _this.inputOrOutputDataList.inputList);
            const setInputList = _this.generateArrayFromJson(res);
            _this.inputOrOutputDataList.inputList = setInputList;
          } else {
            _this.inputOrOutputDataList.outputList = [];
            _this.parsingObject(res, _this.inputOrOutputDataList.outputList);
          }
        })
      };
      reader.readAsDataURL(oFile);
    },
    //解析重构后的尺寸&厚度输入文件
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
    //解析重构后的尺寸&厚度输入文件---获取按顺序排列的 order 数字数组
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
    //解析输入输出文件返回结果---优化后
    generateArrayFromObj(obj) {
      delete obj.type
      return Object.keys(obj).map(key => {
        let item = {
          name: obj[key].name,
          value: obj[key].value,
          children: []
        };
        // 如果有子属性，递归构建子项
        if (Object.keys(obj[key]).length > 1) {
          // 假设如果属性多于3个，则必有子属性
          const subKeys = Object.keys(obj[key]).filter(subKey => subKey !== 'enabled' && subKey !== 'name' && subKey !== 'value');
          item.children = subKeys.map(subKey => ({
            name: obj[key][subKey].name,
            value: obj[key][subKey].value,
            children: [] // 子项的子项默认为空数组
          }));
        }
        return item;
      });
    },
    //解析输入输出返回结果集对象---优化前
    parsingObject(obj, list = []) {
      Object.keys(obj).map(index => {
        if (obj[index] instanceof Object) {
          if (obj[index]['enabled']) {
            let childrenList = JSON.parse(JSON.stringify(obj[index]))
            delete childrenList['name'];
            let children = this.parsingObjectChildren(childrenList, children);
            list.push({
              name: obj[index]['name'] ? obj[index]['name'] : null,
              value: obj[index]['value'],
              children,
              enabled: obj[index]['enabled']
            })
            let listIndex = list.length;
            if (!list[listIndex - 1]['name'] && list[listIndex - 1]['children'].length == 0) {
              list.splice(listIndex - 1, 1)
            }
          }
        } else {
          if (index == 'name' && obj['enabled']) {
            list.push({
              name: obj[index] ? obj[index] : null,
              value: obj['value'],
              children: [],
              enabled: obj['enabled']
            })
          }
        }
      })
      console.log("🚀 ~ parsingObject ~ list:", list)
      return list;
    },
    //解析子级---优化前
    parsingObjectChildren(obj, list = []) {
      Object.keys(obj).map(index => {
        if (obj[index] instanceof Object) {
          if (obj[index]['enabled']) {
            this.parsingObjectChildren(obj[index], list);
          }
        } else {
          if (index == 'name' && obj['enabled']) {
            list.push({
              name: obj[index] ? obj[index] : null,
              value: obj['value'],
              children: []
            })
          }
        }
      })
      return list;
    },
    //读取上传文件流
    readerFile(type, oFile) {
      let _this = this;
      var reader = new FileReader();
      //读取成功
      reader.onload = function (ev) {
        const buffer = ev.target.result;

        let _accept = _this[type == 'model' ? 'modelAccept' : (type == 'calibration' ? 'calibrationAccept' : 'accept')].split(',');
        let fileType = false, fileInfos = [], suffix = '';
        if (!oFile.type) {
          fileInfos = oFile.name.split('.');
          suffix = fileInfos[fileInfos.length - 1];
        } else {
          fileInfos = oFile.type.split('/');
          suffix = fileInfos[fileInfos.length - 1];
        }
        fileType = _accept.includes(`.${suffix}`);

        if (!fileType) {
          let fileInfos = oFile.name.split('.');
          let suffix = fileInfos[fileInfos.length - 1];
          _this.$message.warning(`${type == 'model' ? '模型文件' : (type == 'calibration' ? '标定文件' : '图纸文件')}‘${suffix}’类型不支持`);
          return false;
        }
        _this.percentage[type]['file'] = buffer;
        _this.sizeAlgorithmForm[type] = oFile;
      };
      reader.readAsDataURL(oFile); // ,'base64'
    },
    //tabs切换
    handleClick(tab) {
      let { name } = tab;
      this.tabActiveName = name;
    },
    //模型文件类型选择
    modelTypeChange(v) {
      if (this.sizeAlgorithmForm['inputs_outputs'].type != v) {
        this.sizeAlgorithmForm['inputs_outputs']['inputs'] = null;
        this.sizeAlgorithmForm['inputs_outputs']['outputs'] = null;
        this.inputOrOutputDataList.inputList = [];
        this.inputOrOutputDataList.outputList = [];
      }
      this.sizeAlgorithmForm['inputs_outputs'].type = v;
    },
    checkName(rule, value, callback) {
      if (this.sizeAlgorithmForm.id > 0) {
        callback();
        return true;
      }
      querySizeAlgorithmsList().then(res => {
        let list = res || [];
        let info = list.find(v => v.name === value);
        if (info) {
          callback(new Error(`${this.sizeAlgorithmForm.name} 名称已存在`));
          this.$emit('dataRefresh', true)
        } else {
          callback();
        }
      })
    },
    checkPositiveNumber(rule, value, callback) {
      console.log("🚀 ~ checkPositiveNumber ~ value:", value)
      if (value <= 0) {
        callback(new Error('块尺寸值必须是正数'));
      } else {
        callback();
      }
    },
    checkIsNumber(rule, value, callback) {
      if (!value) {
        callback(); // 如果没有值，直接通过
      } else if (isNaN(value)) {
        callback(new Error('块尺寸必须是数字')); // 如果不是数字，返回错误
      } else {
        callback(); // 如果是数字，直接通过
      }
    },
    //提交
    submitForm() {
      this.loading = true;
      this.$refs.sizeAlgorithmForm.validate((valid) => {
        if (valid) {
          if (this.sizeAlgorithmForm.id == 0 && !this.sizeAlgorithmForm['blueprint']) {
            this.blueprintNull = true;
            this.$message.warning('请上传图纸');
            this.loading = false;
            setTimeout(() => {
              this.blueprintNull = false;
            }, 1000)
            return false;
          }

          if (!this.sizeAlgorithmForm['inputs_outputs']['inputs']) {
            this.$message.warning('请上传输入文件');
            this.activeName = 'input'
            this.loading = false;
            return false;
          }
          if (!this.sizeAlgorithmForm['inputs_outputs']['outputs']) {
            this.$message.warning('请上传输出文件');
            this.activeName = 'output'
            this.loading = false;
            return false;
          }
          let params = new FormData();
          let _params = {};
          for (let key in this.sizeAlgorithmForm) {
            if (key === 'board') {
              params.append(key, JSON.stringify(this.sizeAlgorithmForm[key]));
            } else if (key != '_modelType' && key != 'inputs_outputs') {
              params.append(key, this.sizeAlgorithmForm[key]);
              _params[key] = this.sizeAlgorithmForm[key];
            }
            if (key == 'inputs_outputs') {
              params.append(key, JSON.stringify(this.sizeAlgorithmForm[key]));
              _params[key] = this.sizeAlgorithmForm[key];
            }
            if (this.sizeAlgorithmForm.id > 0 && this.sizeAlgorithmForm[key] === '') {
              params.delete(key);
              delete _params[key];
            }
          }
          if (this.sizeAlgorithmForm.id) {
            updateSizeAlgorithm(params, (e) => {
              let progress = ((e.loaded / e.total) * 100) | 0;
              console.log(progress)
            }).then(res => {
              this.$message.success('修改成功');
              this.$emit('dataRowUpdata', this.sizeAlgorithmForm)
              this.initData()
            }).finally(e => {
              this.loading = false;
            })
          } else {
            console.log("🚀 ~ this.$refs.sizeAlgorithmForm.validate ~ params:", params)
            createSizeAlgorithm(params, (e) => {
              let progress = ((e.loaded / e.total) * 100) | 0;
              console.log(progress)
            }).then(res => {
              this.$message.success('创建成功');
              this.$emit('dataRefresh', true)
              this.initData()
            }).finally(e => {
              this.loading = false;
            })
          }
        } else {
          this.loading = false;
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss">
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .group {
    border: 2px solid #c88d91;
    border-radius: 5px;
    padding: 10px;
    width: 44%;
    position: relative;
    margin-bottom: 5px;

    .group-header {
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 10px;
      text-align: center;
      position: absolute;
      top: -20px;
      left: 110px;
      border: 2px solid #c88d91;
      background-color: #ffffff;
      border-radius: 5px;
      padding: 5px;
    }

    .group-content {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding-top: 15px;
      font-size: 16px;

      .row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        &.pair-row {
          justify-content: space-between;
          gap: 10px;
        }

        .left,
        .right {
          flex: 1;
        }

        .left {
          text-align: left;
        }

        .right {
          text-align: right;
        }

        .not-pair {
          width: 100%;
          text-align: left;
        }
      }
    }
  }
}

.sizeAlgorithm-config {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #fff;
  border-radius: 10px 0px 0px 10px;
  border-left: 3px solid #D77C84;
  box-shadow: -13px 14px 15px -4px rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
  padding: 9px 24px;

  .el-progress-bar__innerText {
    font-size: 11px !important;
    color: #000 !important;
    display: block !important;
  }

  .tools {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .comBtn {
      background-color: rgba(0, 0, 0, 1);
      color: rgba(255, 255, 255, 1);
      font-size: 16px;
      text-align: center;
      padding: 8px 15px;
      border-radius: 10px;
      cursor: pointer;
    }

    .comBtn:active,
    .comBtn:hover {
      background-color: #000;
      color: #FFB754;
    }
  }

  .comBtn {
    background-color: rgba(0, 0, 0, 1);
    color: rgba(255, 255, 255, 1);
    font-size: 16px;
    text-align: center;
    padding: 5px 10px;
    border-radius: 10px;
    cursor: pointer;

    &:active,
    &:hover {
      background-color: #000;
      color: #D77C84;
    }
  }


  .sizeAlgorithmForm {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .comUploadBtn {
    &.blueprint {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }

    span {
      color: rgba(222, 134, 143, 1);
      font-size: 14px;
    }
  }

  .blueprint {
    height: 40.05%;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
    margin-bottom: 10px;

    @keyframes blink {
      0% {
        box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);
      }

      100% {
        box-shadow: 0px 2px 9px 2px rgba(211, 4, 4, 1);
      }
    }

    &.blueprintError {
      animation: blink .5s 3;
    }

    .longFileUpload {
      width: 100%;
      height: 100%;

      .el-upload,
      .el-upload-dragger {
        width: 100%;
        height: 100%;
      }

      .el-upload-dragger {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 5px;
      }

      .comUploadBtn span {
        font-size: 28px;
      }

    }
  }

  .paramsBox {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-y: auto;
    padding: 9px 16px;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0px 2px 9px 6px rgba(0, 0, 0, 0.07);

    .el-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .el-tabs__item.is-active,
    .el-tabs__item:hover {
      color: #de868f !important;
    }

    .el-tabs__content {
      flex: 1;

      .el-tab-pane {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }
    }

    .tabForm {
      padding-top: 10px 10px;
      box-sizing: border-box;
      width: 100%;
      height: 100%;

      .el-form-item__label {
        width: 107px !important;
      }

      .el-radio {

        .el-radio__input.is-checked .el-radio__inner {
          background: #cd9ea2 !important;
          border-color: #cd9ea2 !important;
        }

        .el-radio__input.is-checked+.el-radio__label {
          color: #cd9ea2 !important;
        }

        .el-radio__inner:hover {
          border-color: #cd9ea2 !important;
        }
      }
    }

  }

  .dataListBox {
    width: 100%;
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    gap: 20px;

    .list {
      border: 2px solid rgba(210, 138, 144, 1);
      padding: 10px;
      box-sizing: border-box;
      border-radius: 7px;
      width: calc(96%/2);
      height: auto;
      display: flex;
      align-items: flex-start;
      gap: 20px;

      .children {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        gap: 5px 20px;
      }

      .parent.label {
        font-weight: 600;
      }

      .label {
        font-size: 16px;
      }
    }
  }

  .blueprint-img {
    width: 100%;
    height: 100%;
    background: center center no-repeat;
    background-size: contain;
  }
}
</style>