<template>
  <div>
    <el-card class="list-wrapper">
      <div class="search-box">
        <div class="wrapper-head">
          <span class="title"> | 条件搜索 </span>
        </div>
        <el-form ref="searchFormRef" :inline="true" :model="searchFormState">
          <el-form-item v-for="(option, fieldkey) in searchOptions" :key="fieldkey" :label="option.label"
            :prop="fieldkey">
            <el-select v-if="option.type === 'select'" :key="fieldkey" v-model:value="searchFormState[fieldkey]"
              placeholder="请选择" clearable>
              <el-option v-for="item in option.options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-input v-if="option.type === 'input'" :key="fieldkey" v-model:value.trim="searchFormState[fieldkey]"
              placeholder="请输入" autocomplete="off" allow-clear clearable v-bind="{ ...option.originAttrs }" />
            <el-input-number v-if="option.type === 'number'" :key="fieldkey" v-model:value="searchFormState[fieldkey]"
              :step="1" placeholder="请输入" :min="0" v-bind="{ ...option.originAttrs }" />
            <el-date-picker v-if="option.type === 'date-picker'" v-model="searchFormState[fieldkey]" type="daterange"
              value-format="yyyy-MM-dd" @change="fillingDateChange" range-separator="~" start-placeholder="开始日期"
              end-placeholder="结束日期" v-bind="{ ...option.originAttrs }">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-left: auto">
            <iBrain-button type="primary" @click="onSearch"><i class="el-icon-search"></i>查询</iBrain-button>
            <iBrain-button @click="onReset"><i class="el-icon-refresh-left"></i>重置</iBrain-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="operation">
        <slot name="operation"></slot>
      </div>
      <div class="table-list-wrapper">
        <div class="tabel-content">
          <span class="title">
            | 数据列表
          </span>
          <iBrain-table-container ref="myTable" :tableData="tableData" :columns="columns" :selectList="tableSelectList"
            :showSelection="showSelection" show-index @currentSelect="currentSelect">
            <slot name="tabel-operation" slot="operation"></slot>
          </iBrain-table-container>
          <div class="pagination">
            <div class="total-pages">共 {{ total_pages }} 页</div>
            <el-pagination :current-page.sync="current_page" :page-size.sync="page_size"
              :page-sizes="[15, 25, 50, 100, 500]" :total="total" background
              layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
              @current-change="() => getList()">
            </el-pagination>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { unset, has } from "loadsh";
import { removeEmptyFields } from "../../utils/index";

export default {
  name: "List",
  props: {
    searchOptions: {
      type: Object,
      default() {
        return {};
      },
    },
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    fetchData: {
      type: Function,
      default: () => { },
    },
    showSelection: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      searchFormState: {},
      realSearchFields: {},
      tableData: [],
      tableSelectList: [],
      current_page: 1,
      page_size: 25,
      total: 0,
      total_pages: 1,
    };
  },
  async created() {
    this.getList();
  },
  methods: {
    async getList() {
      try {
        const params = {
          ...this.realSearchFields,
          current_page: this.current_page - 1,
          page_size: this.page_size,
        };
        unset(params, "create_at");
        const data = removeEmptyFields(params);
        const res = await this.fetchData(data);
        this.total = res.total_items;
        this.total_pages = res.total_pages;
        this.tableData = res.data;
        this.tableData.forEach((item) => {
          item.create_at = new Date(item.create_at).toLocaleString();
        });
      } catch (err) {
        throw err;
      }
    },
    fillingDateChange(e) {
      //时间状态选择 特殊处理
      if (e) {
        this.searchFormState.start = e[0];
        this.searchFormState.end = e[1];
      } else {
        this.searchFormState.start = "";
        this.searchFormState.end = "";
      }
    },
    currentSelect(val) {
      this.$emit("selectTable", val);
    },
    handleSizeChange() {
      this.current_page = 1;
      this.getList();
    },
    onSearch() {
      this.current_page = 1;
      this.realSearchFields = {
        ...this.searchFormState,
      };
      this.getList();
    },
    onReset() {
      this.current_page = 1;
      this.$refs["searchFormRef"].resetFields();
      // 特殊处理
      if (has(this.searchFormState, "start")) {
        this.searchFormState.start = "";
        this.searchFormState.end = "";
      }
      this.realSearchFields = {};
      this.getList();
    },
  },
};
</script>
<style lang="scss">
// @import "@/styles/boxflex.scss";

.list-wrapper {
  .tabel-content {
    .title {
      display: flex;
      line-height: 30px;
      font-size: 16px;
      font-weight: 500;
      color: rgb(48, 86, 211);
    }
  }

  .search-box {
    .wrapper-head {
      height: 50px;
      @include dis_flex;
      @include align-items;

      .title {
        line-height: 50px;
        font-size: 16px;
        font-weight: 500;
        color: rgb(48, 86, 211);
      }
    }

    .el-form {
      display: flex;
      border-bottom: 1px solid #ececec;
      margin-bottom: 5px;

      .el-form-item {
        .el-form-item__label {
          font-weight: 500;
          margin-right: 5px;
          display: inline-block;
        }
      }
    }
  }

  .operation {
    text-align: right;
  }

  .pagination {
    display: flex;
    justify-content: end;
    margin-top: 20px;

    .total-pages {
      display: inline-block;
      min-width: 35.5px;
      font-size: 13px;
      height: 32px;
      line-height: 32px;
      color: #606266;
      margin-right: 10px;
      font-weight: 400;
    }

    .el-pagination {
      text-align: right !important;
    }
  }
}
</style>
