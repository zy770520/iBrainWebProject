<template>
  <div class="container">
    <div class="main">
      <draggable :list="comlist1.length > 0 ? comlist1.slice(2, 4) : componentList.slice(2, 4)" class="main"
        :group="{ name: 'componentsGroup2', pull: 'clone', put: false, }" :sort="true" :clone="cloneComponent"
        draggable=".drag-item" filter='.item' @end="onEnd">
        <div class="drag-item" v-for="item in (comlist1.length > 0 ? comlist1.slice(2, 4) : componentList.slice(2, 4))"
          :key="item.id">
          <div :class="{ item: item.flag }">
            <el-image fit="scale-down" :src="item.url" class="itemIcon" :style="{
        width: itemHeight + 'px',
        height: itemHeight + 'px',
        'margin-right': itemMargin + 'px'
      }"></el-image>
          </div>
        </div>
      </draggable>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import componentList, { widgets } from './widgets/config/index'
export default {
  props: {
    page1: {
      require: true,
    },
    comlist1: {
      require: true,
    },
    itemHeight: {
      require: true,
    },
    itemMargin: {
      require: true,
    },
  },
  name: "ComponentList1",
  components: {
    draggable
  },
  data() {
    //  componentList 为所有的基础组件 需要在后台维护
    return {
      componentList: componentList,
      activeData: null
    }
  },
  methods: {
    //组件拖动的时候先深拷贝一下，防止相同组件数据干扰
    // 再对渲染组件初始化
    cloneComponent(obj) {
      console.log('--左边拖到右边obj--', obj)
      let clone = widgets[obj.id]
      clone = JSON.parse(JSON.stringify(clone))
      clone.id = obj.id
      console.log("🚀 ~ cloneComponent ~ clone:", clone)
      this.activeData = clone
    },
    onEnd(obj) {
      console.log("🚀 ~ onEnd ~ obj:", obj)
      if (obj.from !== obj.to) {
        if (obj.to.className.indexOf('row-drag') < 0) {
          console.log(obj.newIndex)
          this.page1.widgets.splice(obj.newIndex, 0, this.activeData);
        }
        if (obj.to.className === '') {
          this.$set(this.componentList.slice(2, 4)[obj.oldIndex], 'flag', true)
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  // flex-direction: column;
  // padding: 20px;

  .main {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    &::after {
      content: '';
      flex: auto;
      /* 或者flex: 1 */
    }

  }

  .item {
    padding: 20px;
  }

  .itemIcon {
    width: 150px;
    height: 150px;
    margin-right: 10px;
  }
}
</style>
