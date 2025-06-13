<template>
  <div>
    <el-scrollbar style="">
      <div class="phone" :style="{ height: pageHeight + 'px' }">
        <div class="page" id="page-div" :style="{ 'min-height': pageHeight + 'px' }">
          <!--   v-if v-else连用，不然拖动排序失效  :group="{ name: 'componentsGroup', pull: 'clone', put: true, }"-->
          <draggable :list="widgets" group="componentsGroup1" animation="150">
            <div class="widget-empty" :style="{ height: pageHeight + 'px', 'line-height': pageHeight + 'px' }"
              v-if="widgets.length === 0">请添加组件</div>
            <div v-else v-for="(item, index ) in widgets" :key="item.id">
              <component :is="item.CType" :config="item" :dialogVisible="dialogVisible" :kHSix="kHSix"
                :kHSeven="kHSeven" :kHEight="kHEight" :kHTwo="kHTwo" @delete="deleteCom(item, index)">
              </component>
            </div>
          </draggable>
        </div>

      </div>
    </el-scrollbar>

  </div>
</template>

<script>
import draggable from 'vuedraggable'
import left1 from '../../home/components/leftchart1.vue'
import left2 from '../../home/components/leftchart2.vue'
import right1 from '../../home/components/rightchart1.vue'
import right2 from '../../home/components/rightchart2.vue'
import right3 from '../../home/components/rightchart3.vue'
// import { ref, toRefs } from '@vue/composition-api'
import componentList from './widgets/config/index'
export default {
  name: "PageDesign",
  props: {
    page2: {
      require: true,
    },

    kHSix: {
      require: true,
    },
    kHSeven: {
      require: true,
    },
    kHEight: {
      require: true,
    },
    kHTwo: {
      require: true,
    },
    pageHeight: {
      require: true,
    },
    dialogVisible: {
      require: true,
    },
  },
  computed: {
  },
  components: {
    draggable,
    left1,
    left2,
    right1,
    right2,
    right3
  },
  // setup(props) {
  //   const activeTabs = ref('content')
  //   const { widgets } = toRefs(props.page)
  //   const changeTabs = (tab, event) => {
  //     console.log(tab, event);
  //   }
  //   return {
  //     widgets,
  //     changeTabs,
  //     activeTabs
  //   }
  // },
  watch: {
    page2: {
      handler(newPage) {
        console.log("🚀 ~ handler ~ newPage2:", newPage)
        if (newPage !== null) {
          this.widgets = newPage.widgets
        } else {
          this.widgets = []
        }
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      componentList: componentList,
      widgets: null
    };
  },
  mounted() {
  },
  methods: {
    //删除子项
    deleteCom(items, index) {
      const q = this.componentList.find((item) => {
        return items.id.includes(item.id)
      })
      this.$set(q, 'flag', false)
      this.$emit("newcomlist2", this.componentList)
      const widget = this.page2.widgets.splice(index, 1)

      widget && this.$emit("deleteWidget2", widget[0])
    },
  }
}
</script>

<style lang="scss" scoped>
.phone {

  .page {}
}

.widget-empty {
  border: 1px dashed #7de3f9;
  font-size: 30px;
  text-align: center;
  color: #7de3f9;
}
</style>
