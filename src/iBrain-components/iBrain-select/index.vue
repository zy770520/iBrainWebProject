<template>
  <el-select v-model="value" placeholder="请选择" @change="currentValue">
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item">
    </el-option>
  </el-select>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      value: ''
    }
  },
  methods: {
    currentValue(value) {
      this.$emit('selectOption', value)
    }
  }
}
</script>