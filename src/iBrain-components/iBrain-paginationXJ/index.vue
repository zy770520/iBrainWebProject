<template>
  <el-pagination :current-page.sync="currentPage" background :page-size.sync="pageSize" :layout="layout"
    :page-sizes="pageSizes" :total="total" v-bind="$attrs" @size-change="handleSizeChange"
    @current-change="handleCurrentChange" />
</template>

<script>
export default {
  name: "Pagination",
  props: {
    total: {
      required: true,
      type: Number,
    },
    page: {
      type: [String, Number],
      default: 0,
    },
    limit: {
      type: [String, Number],
      default: 25,
    },
    pageSizes: {
      type: Array,
      default() {
        return [15, 25, 50, 100, 500];
      },
    },
    layout: {
      type: String,
      default: "total, sizes, prev, pager, next, jumper",
    },
    background: {
      type: Boolean,
      default: true,
    },
    autoScroll: {
      type: Boolean,
      default: true,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    pageSize: {
      get() {
        return parseInt(this.limit);
      },
      set(val) {
        this.$emit("update:limit", val.toString());
      },
    },
    currentPage: {
      get() {
        return parseInt(this.page);
      },
      set(val) {
        this.$emit("update:page", val.toString());
      },
    },
  },
  data() {
    return {
      pageSize1: 25,
    };
  },
  watch: {},
  methods: {
    handleSizeChange(val) {
      this.pageSize1 = val;
      this.$emit("pagination", { page: 0, limit: val });
    },
    handleCurrentChange(val) {
      let currentVal = val - 1;
      this.currentVal = currentVal;
      this.$emit("pagination", { page: currentVal, limit: this.pageSize1 });
    },
  },
};
</script>

<style scoped>
.pagination-container {
  background: #fff;
  text-align: right;
}

.el-pagination {
  margin-top: 15px;
  text-align: right !important;
}

.pagination-container.hidden {
  display: none;
}
</style>
