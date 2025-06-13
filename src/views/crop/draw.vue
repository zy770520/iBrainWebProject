<template>
  <div class="draw">
    <el-image :src="imgUrl" style="height: 100%; width: 100%" :fit="'contain'"></el-image>
  </div>
</template>
<script>
export default {
  data() {
    return {
      imgUrl: "",
    };
  },
  methods: {
    init(arrayBuffer) {
      const uint8ArrayOfImageData = new Uint8Array(arrayBuffer);
      const blob = new Blob([uint8ArrayOfImageData], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);
      this.imgUrl = imageUrl;
    },
  },
  created() { },
};
</script>
<style lang="scss">
.draw {
  width: 100%;
  height: 100%;
}
</style>
