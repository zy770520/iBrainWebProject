import iBrainButton from '@/iBrain-components/iBrain-button' //按钮精简
import iBrainInputNumber from '@/iBrain-components/iBrain-input-number' // 金额输入框
import iBrainLink from '@/iBrain-components/iBrain-link' //按钮精简
import iBrainMain from '@/iBrain-components/iBrain-main' // 左右结构容器
import iBrainModule from '@/iBrain-components/iBrain-module' // 模块
import iBrainPageFiles from '@/iBrain-components/iBrain-page-files' // 审批流页面模块
import iBrainPageProcess from '@/iBrain-components/iBrain-page-process' // 审批流页面模块
import iBrainQueryContainer from '@/iBrain-components/iBrain-query-container' // 查询模块容器
import iBrainQueryDisplay from '@/iBrain-components/iBrain-query-display' // 查询条件展示
import iBrainRangeInput from '@/iBrain-components/iBrain-range-input' // 区间输入框
import iBrainSection from '@/iBrain-components/iBrain-section' // 单据查询页面容器
import iBrainSectionInfo from '@/iBrain-components/iBrain-section-info' // 单据信息页面容器
import iBrainSectionApprove from '@/iBrain-components/iBrain-section-approve' // 单据信息审批页面容器
import iBrainStepsHorizontal from '@/iBrain-components/iBrain-steps-horizontal'
import iBrainStepsVertical from '@/iBrain-components/iBrain-steps-vertical'
import iBrainTableContainer from '@/iBrain-components/iBrain-table-container' // 动态列表格组件
import iBrainTableSelect from '@/iBrain-components/iBrain-table-select' // 查询弹窗表格
import iBrainTablePopup from '@/iBrain-components/iBrain-table-select/select-popup.vue' // 查询弹窗表格 点击弹窗
import iBrainTree from '@/iBrain-components/iBrain-tree' // 树形菜单
import iBrainMoreTree from '@/iBrain-components/iBrain-More-tree' // 多选树形菜单
import iBrainUpLoadTable from '@/iBrain-components/iBrain-upLoad-table' //附加上传表
import iBrainUpLoadButton from '@/iBrain-components/iBrain-upLoad-button' //附加上传按钮
import iBrainTextareaPopup from '@/iBrain-components/iBrain-textarea-popup' //附加上传表
import iBrainInputImitate from '@/iBrain-components/iBrain-input-imitate' //模拟input样式展示
import iBrainDatePicker from '@/iBrain-components/iBrain-date-picker' // 时间区间选择器
import iBrainDeptSelect from '@/iBrain-components/iBrain-dept-select' // 部门下拉选
import iBrainTooltip from '@/iBrain-components/iBrain-tooltip' // tip 提示
import iBrainPaginationXJ from '@/iBrain-components/iBrain-paginationXJ' // 分页
import iBrainSelect from '@/iBrain-components/iBrain-select' // 下拉选择


export default {
  install(Vue) {
    Vue.component('iBrainButton', iBrainButton)
    Vue.component('iBrainInputNumber', iBrainInputNumber)
    Vue.component('iBrainLink', iBrainLink)
    Vue.component('iBrainMain', iBrainMain)
    Vue.component('iBrainModule', iBrainModule)
    Vue.component('iBrainPageFiles', iBrainPageFiles)
    Vue.component('iBrainPageProcess', iBrainPageProcess)
    Vue.component('iBrainQueryContainer', iBrainQueryContainer)
    Vue.component('iBrainQueryDisplay', iBrainQueryDisplay)
    Vue.component('iBrainRangeInput', iBrainRangeInput)
    Vue.component('iBrainSection', iBrainSection)
    Vue.component('iBrainSectionInfo', iBrainSectionInfo)
    Vue.component('iBrainSectionApprove', iBrainSectionApprove)
    Vue.component('iBrainStepsHorizontal', iBrainStepsHorizontal)
    Vue.component('iBrainStepsVertical', iBrainStepsVertical)
    Vue.component('iBrainTableContainer', iBrainTableContainer)
    Vue.component('iBrainTableSelect', iBrainTableSelect)
    Vue.component('iBrainTablePopup', iBrainTablePopup)
    Vue.component('iBrainTree', iBrainTree)
    Vue.component('iBrainMoreTree', iBrainMoreTree)
    Vue.component('iBrainUpLoadTable', iBrainUpLoadTable)
    Vue.component('iBrainUpLoadButton', iBrainUpLoadButton)
    Vue.component('iBrainTextareaPopup', iBrainTextareaPopup)
    Vue.component('iBrainInputImitate', iBrainInputImitate)
    Vue.component('iBrainDatePicker', iBrainDatePicker)
    Vue.component('iBrainDeptSelect', iBrainDeptSelect)
    Vue.component('iBrainTooltip', iBrainTooltip)
    Vue.component('iBrainPaginationXJ', iBrainPaginationXJ)
    Vue.component('iBrainSelect', iBrainSelect)
  },
}
