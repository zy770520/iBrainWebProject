let showConfigMenu = localStorage.getItem('showConfigMenu');
showConfigMenu = showConfigMenu ? JSON.parse(showConfigMenu) : true;
let currentUser = localStorage.getItem('currentUser');
// 默认权限设置
const defaultPermissions = {
  "运维员": {
    showHardwareReg: true,
    showSoftwareReg: true,
    showTouchSystem: true,
    showConfigMenu: true
  },
  "管理员": {
    showHardwareReg: false,
    showSoftwareReg: false,
    showTouchSystem: false,
    showConfigMenu: true
  },
  "操作员": {
    showHardwareReg: false,
    showSoftwareReg: false,
    showTouchSystem: false,
    showConfigMenu: false
  }
};

const state = {
  formData: {
    tableDate: [{
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }],
    zuixiaomianji: '',
    suanzileixing: ''
  },
  formDatas: {
    tableDate: [{
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }, {
      value: false,
      leibie: ''
    }]
  },
  greenSwitch: '',
  yellowSwitch: '',
  redSwitch: '',
  buzzerSwitch: '',
  redStatus: '',
  redPinlv: '',
  redTime: '',
  yellowStatus: '',
  yellowPinlv: '',
  yellowTime: '',
  greenStatus: '',
  greenPinlv: '',
  greenTime: '',
  fengmingStatus: '',
  fengmingPinlv: '',
  fengmingTime: '',
  greenAction: '',
  greenInput: '',
  greenTime: '',
  redAction: '',
  redInput: '',
  flowConfig: {
    formInline: {
      feipaijiekou: '',
      ip: '',
      xiangjimingcheng: '',
      qutumoshi: '',
      xiangjizengyi: '',
      baoguangshijian: ''
    },
    formInlines: {
      feipaijiekou: '',
      ip: '',
      xiangjimingcheng: '',
      qutumoshi: '',
      xiangjizengyi: '',
      baoguangshijian: '',
      beiguang: '',
      tongzhouguang: '',
      qianjingguang: '',
    },
    selectBox: '',
    leibie: '',
    zuixiaomianji: '',
    zuixiaomianjiSwitch: '',
    chixushichang: '',
    sudu: '',
    mianji: '',
    chang: '',
    kuan: '',
    changkuanbi: '',
    yunxuyichangshuliang: '',
    redResult: [],
    yellowResult: [],
    greenResult: [],
    fengmingResult: [],
    operator: ''
  },
  formQuality: {
    baoguangshijian: '',
    xiangjizengyi: '',
    leibie: '',
    formData: {
      tableDate: [{
        leibie: ''
      }, {
        value: false,
        leibie: ''
      }, {
        value: false,
        leibie: ''
      }, {
        value: false,
        leibie: ''
      }, {
        value: false,
        leibie: ''
      }, {
        value: false,
        leibie: ''
      }, {
        value: false,
        leibie: ''
      }, {
        value: false,
        leibie: ''
      }],
      zuixiaomianji: '',
      suanzileixing: ''
    },
    flowConfig: {
      zuixiaomianji: '',
      zuixiaomianjiSwitch: '',
      mianji: '',
      chang: '',
      kuan: '',
      changkuanbi: '',
      yunxuyichangshuliang: '',
    }
  },
  data: {},
  row: [],
  optionsRow: [],
  menuWorkFlowRefresh: false,
  delBol: true,
  showConfigMenu: showConfigMenu,
  currentUser: currentUser || null,
  userPermissions: currentUser ? defaultPermissions[currentUser] || null : null,
  isUpdateCamera: false,
  isUpdateOffset: false,
  isUpdateMotor: false,
}

export default {
  state
}
