<template>
  <div>
    <el-dropdown trigger="hover" placement="top-end" @command="handleCommand">
      <span class="avatar-dropdown" @click="openLoginDialoag">
        <a>{{ $store.state.applicationInfo.currentUser ? userText : '登录' }}</a>
        <i v-if="$store.state.applicationInfo.currentUser" class="iconfont icon-lbznshixinyuanxing"></i>
        <i v-else class="iconfont icon-lbznshixinyuanxing-copy"></i>
      </span>
      <el-dropdown-menu slot="dropdown" v-if="$store.state.applicationInfo.currentUser">
        <el-dropdown-item command="userInfo">
          <div class="user-logout icon-item">
            <i class="iconfont icon-lbznyonghu"></i>
            <span>{{ userText }}</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item command="logout">
          <div class="user-logout icon-item">
            <i class="iconfont icon-lbzntuichu"></i>
            <span>退出登录</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
// import { userLogout } from '@/api/login.js'

export default {
  name: 'HtAvatar',
  components: {
  },
  data() {
    return {
      userText: "运维员", // 默认用户名
    }
  },
  computed: {
  },
  watch: {
    // 监听用户变化，更新显示的用户名
    '$store.state.applicationInfo.currentUser': {
      handler(newVal) {
        if (newVal) {
          this.userText = newVal;
        }
      },
      immediate: true
    }
  },
  created() {
    // 页面加载时从localStorage恢复用户信息
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      if (!this.$store.state.applicationInfo.currentUser) {
        this.$store.state.applicationInfo.currentUser = savedUser;
      }
      this.userText = savedUser;
    }
  },
  methods: {
    handleCommand(command) {
      switch (command) {
        case 'logout':
          this.logoutWithTips()
          break;
      }
    },
    //登录
    openLoginDialoag() {
      if (!this.$store.state.applicationInfo.currentUser) {
        this.$emit('userLogin');
      }
    },
    //退出
    logoutWithTips() {
      this.$store.state.applicationInfo.showConfigMenu = false;
      this.$store.state.applicationInfo.currentUser = null;
      this.$store.state.applicationInfo.userPermissions = null;

      // 重置导航可见性设置为默认值（都不显示）
      this.$store.dispatch('updateNavigationVisibility', {
        hardwareReg: false,
        softwareReg: false,
        touchSystem: false
      });

      localStorage.removeItem('currentUser');
      localStorage.removeItem('userPermissions');
      localStorage.setItem('showConfigMenu', 'false');

      this.$emit('userLogout');
    },
  },
}
</script>
<style lang="scss" scoped>
.user-avatar {
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 50%;
}

.el-popper {
  margin-top: 0px !important;
}

.el-popper[x-placement^=bottom] .popper__arrow::after {
  margin-left: -40px !important;
}

.icon-lbzndengluyonghuming:before {
  content: "\E653";
  font-size: 30px;
}

.avatar-dropdown {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  justify-items: center;
  height: 50px;
  padding: 0;
  position: relative;

  a {
    font-size: 14px !important;
    font-weight: 900;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    position: absolute;
    cursor: pointer;
  }

  i {
    font-size: 46px !important;
    color: #000000;
  }

  .user-name {
    position: relative;
    padding-left: 15px;
    cursor: pointer;
    color: #000000;
  }
}

.user-logout {
  display: flex;
  align-items: center;

  i {
    font-size: 22px !important;
  }

  span {
    font-size: 14px !important;
    font-weight: 900;
  }

  .icon-lbzntuichu {
    margin-left: 1px !important;
    margin-right: 2px !important;
  }
}

.el-dropdown-menu {
  padding: 0px !important;

  .el-dropdown-menu__item {

    &:hover {
      background: rgb(239, 244, 251) !important;
    }

    .el-dropdown {
      width: 100%;
    }
  }

  .el-dropdown-menu__item:not(.is-disabled):hover {
    background-color: #eaeaea !important;
    color: #000000 !important;
  }
}
</style>
