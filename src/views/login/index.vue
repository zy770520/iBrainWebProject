<template>
  <div class="loginbody">
    <!-- 登录页 -->
    <div class="logindata">
      <div class="loginLogo">
        <img src="../../assets/imgs/logo.png" alt="" />
      </div>
      <div class="loginText">
        <a>欢迎使用领邦智能</a>
        <el-form ref="form" :model="form" :rules="rules">
          <el-form-item prop="username">
            <el-input v-model="form.username" clearable placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" clearable placeholder="请输入" show-password
              @keyup.native.enter="login('form')"></el-input>
          </el-form-item>
        </el-form>
        <div class="loginBtn">
          <iBrain-button type="primary" @click.native.prevent="login('form')">立即登录</iBrain-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userLogin } from '@/api/login.js'

export default {
  name: 'Login',
  components: {},
  directives: {},
  props: {},
  data() {
    return {
      form: {
        password: "",
        username: "",
      },
      checked: false,
      redirect: undefined,
      rules: {
        username: [
          { required: true, message: "请输入用户账号", trigger: "blur" },
          { max: 255, message: "不能大于255个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { max: 255, message: "不能大于255个字符", trigger: "blur" },
        ],
      },
    }
  },
  computed: {
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
  },
  mounted() {

  },
  methods: {
    login(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          userLogin({
            "account": this.form.username,
            "password": this.form.password
          }).then(res => {
            if (res !== 'admin') {
              this.$message({
                message: '账号密码有误,请重新填写！',
                type: "error",
                showClose: true,
              })
            } else {
              // 记录token
              localStorage.setItem("Admin", res)
              this.$message({
                message: "登录成功",
                type: "success",
                showClose: true
              })
              // 验证成功跳转到上次访问页面或首页
              this.$router.push(this.redirect || '/fatherHome')
            }
          }).catch(err => {
            this.$message({
              message: "登录请求发生错误，请刷新重试",
              type: "error"
            })
          })
        } else {
          return false;
        }
      });
    },
  },

  beforeDestroy() {
  },
}
</script>


<style lang="scss" scoped>
.el-input {
  .el-input__inner {
    height: 34px !important;
    line-height: 34px !important;
  }
}

.el-form-item {
  display: flex;
  align-items: center;
  width: 100%;

  div {
    display: flex;
    align-items: center;
  }

  .el-form-item__label {
    text-align: left;
  }

  .el-form-item__content {
    display: flex;
    align-items: center;
    margin-left: 0px !important;

    .el-input {
      width: 300px;
    }
  }

  .el-form-item__error {
    left: 25px;
  }


}

::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #44a5f4;
  border-color: #44a5f4;
}

::v-deep .el-checkbox__input.is-checked+.el-checkbox__label {
  color: #44a5f4;
}

.loginbody {
  width: 100%;
  height: 100vh;
  min-width: 1000px;
  background-image: url('../../assets/imgs/bg.png');
  background-size: 100% 100%;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;

  .logindata {
    width: 700px;
    height: 469px;
    background: #FFFFFF;
    box-shadow: 0px 10px 50px 0px rgba(41, 55, 89, 0.5);
    border-radius: 40px;
    display: flex;

    .loginLogo {
      width: 306px;
      height: 469px;

      img {
        width: 100%;
        height: 100%;
        display: inline-block;
      }
    }

    .loginText {
      flex: 1;
      padding: 125px 40px 125px 40px;

      a {
        font-size: 18px;
        font-weight: 500;
        display: block;
        float: inline-start;
        margin-bottom: 20px;
      }

      .loginBtn {
        width: 300px;

        .el-button {
          width: 300px;
        }
      }
    }
  }
}



.tool {
  display: flex;
  justify-content: space-between;
}

.butt {
  margin-top: 10px;
  text-align: center;
}

.shou {
  cursor: pointer;
  color: #44a5f4;
}
</style>
