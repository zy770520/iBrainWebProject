<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

*::-webkit-scrollbar {
  width: 5px !important;
  height: 5px !important;
}

*::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: transparent;
}

*::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #dadada;
  /* 控制滚动条滑块的最小长度 */
  max-height: 20px !important;
  /* 垂直滚动条滑块最小长度 */
  max-width: 20px !important;
  /* 水平滚动条滑块最小长度 */
}

#app {
  width: 100%;
  height: 100%;
  position: fixed;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* 阿里字体图标设置 */
  .icon,
  .iconfont {
    font-family: "iconfont" !important;
    font-size: 24px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -webkit-text-stroke-width: 0.2px;
    -moz-osx-font-smoothing: grayscale;
  }

  .el-input__inner {
    border-radius: 10px;
    height: 36px;
    line-height: 36px;
  }

  .el-switch.is-checked .el-switch__core {
    border-color: #000000;
    background-color: #000000;
  }

  .el-form-item {
    .el-form-item__content {
      .el-input-number--medium {
        width: 180px !important;

        .el-input-number__decrease {
          border-radius: 10px 0 0 10px;
          left: 2px !important;
          height: 34px;
        }

        .el-input-number__increase {
          border-radius: 0 10px 10px 0;
          height: 34px;
        }
      }

      .el-slider {
        .el-slider__runway {
          margin-right: 250px !important;
          width: 230px !important;
        }

        .el-slider__input {
          width: 180px !important;

          .el-input-number__decrease {
            border-radius: 10px 0 0 10px;
            left: 2px !important;
            height: 33px;
          }

          .el-input-number__increase {
            border-radius: 0 10px 10px 0;
            right: 2px !important;
            height: 33px;
          }
        }
      }
    }
  }

  /* 全局修改el-table 表头和内容颜色 header color content color */
  .el-table th {

    // background: #e7eff9 !important;
    // border-right: 1px solid #e6e5e5;
    .cell {
      font-weight: bold;
      color: #111111 !important;
    }
  }

  .el-table td.el-table__cell,
  .el-table th.el-table__cell.is-leaf {
    border-bottom: 0;
  }

  .el-table::before {
    height: 0;
  }

  .el-switch {
    width: 40px;
  }
}
</style>
