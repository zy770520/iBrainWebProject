<template>
  <section class="iBrain-section">
    <iBrain-query-container>
      <slot name="query"></slot>
    </iBrain-query-container>

    <div class="iBrain-section-container">
      <div class="iBrain-section-group" v-if="$slots.group">
        <slot name="group"></slot>
      </div>

      <div class="iBrain-section-main" :class="{ scroll: isScroll }">
        <slot></slot>
      </div>
    </div>

    <div class="iBrain-section-footer" v-if="isPagination">
      <span class="text" v-if="$slots.text">
        <slot name="text"></slot>
      </span>
      <span class="text" v-else></span>
      <iBrain-paginationXJ :total="total_items" :page.sync="current_page" :limit.sync="page_size" :pageSizes="pageSizes"
        @pagination="onSearch"></iBrain-paginationXJ>
    </div>
  </section>
</template>

<script>
export default {
  name: "iBrain-section",
  props: {
    isPagination: {
      type: Boolean,
      default: true,
    },
    total_items: {
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
    isScroll: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      current_page: 0,
      page_size: 25,
    };
  },
  methods: {
    onSearch(data) {
      let params = {
        current_page: data.page,
        page_size: data.limit,
      };
      this.$emit("search", params);
    },
    init() {
      if (this.limit) {
        this.page_size = this.limit;
      }
      this.$baseEventBus.$on("$Bus_setPageInfo", (data) => {
        console.log("🚀 ~ this.$baseEventBus.$on ~ data:", data)
        if (data && data.current_page) this.current_page = data.current_page + 1;
        if (data && data.page_size) this.page_size = data.page_size;
      });
    },
  },
  destroyed() {
    this.$baseEventBus.$off("$Bus_getPageInfo");
    this.$baseEventBus.$off("$Bus_setPageInfo");
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/boxflex.scss";

.iBrain-section {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  height: 100% !important;
  @include dis_flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  overflow: hidden;

  &,
  * {
    box-sizing: border-box;
  }

  .iBrain-section-container {
    width: 100%;
    height: 100%;
    background: #fff;
    padding: 8px 20px;
    margin-top: 10px;
    overflow: hidden;
    @include boxflex;
    @include dis_flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    overflow: hidden;
  }

  .iBrain-section-main {
    width: 100%;
    overflow: hidden;
    @include boxflex;

    &.scroll {
      overflow: hidden;
      overflow-y: auto;
    }

    ::v-deep>div,
    ::v-deep .iBrain-table-container {
      height: 100%;
    }

    ::v-deep .iBrain-main {
      padding: 0;
      height: 100%;
    }
  }

  .iBrain-section-group {
    height: 40px;
    @include dis_flex;
    align-self: flex-end;
  }

  .iBrain-section-footer {
    background: #fff;
    padding: 5px 20px 5px 30px;
    @include dis_flex;
    @include justify(flex-end);

    .text {
      color: #33a647;
      @include boxflex;
    }

    .el-pagination {
      margin: 0;
    }
  }
}
</style>
