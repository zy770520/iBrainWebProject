<template>
    <div class="sidebar-class">
        <img alt="" class="zmlogo" src="@/assets/imgs/leftLogo.png" />
        <!-- <div class="zmlogo"></div> -->
        <div class="startClass">
            <div class="selectClass" v-show="activeIndex == '1' && $store.state.applicationInfo.currentUser">
                <el-select v-model="ruleValue" placeholder="请选择" @change="ruleValueChange" :disabled="isSelected">
                    <el-option v-for="item in ruleValueData" :key="item.value" :label="item.name" :value="item">
                    </el-option>
                </el-select>
                <a v-if="systemTextShow">{{ systemText }}...</a>
                <div v-else>
                    <el-button :disabled="isDisabled" v-show="startShow" @click="sendStart">
                        <i class="iconfont icon-lbznqidong" style="color: darkgreen;cursor: pointer;"></i>
                    </el-button>
                    <el-button :disabled="isDisabled" v-show="endShow" @click="sendEnd">
                        <i class="iconfont icon-lbznstop-circle-full" style="color: brown;cursor: pointer;"></i>
                    </el-button>
                </div>
            </div>
            <div class="selectClass" v-show="activeIndex == '2'">
            </div>
            <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" background-color="#eaeaea"
                text-color="#a3a3a3" active-text-color="#ffffff" @select="handleSelect">
                <el-menu-item index="1" v-if="$store.state.applicationInfo.currentUser"
                    @click="$router.push('/console/index')">
                    运行
                </el-menu-item>
                <el-menu-item index="2" v-if="$store.state.applicationInfo.currentUser && showConfigTab"
                    @click="$router.push('/workflowConfig/index')">
                    配置
                </el-menu-item>
            </el-menu>
            <!-- 工作配置批次 -->
            <div class="batch-box" v-if="configBatch && activeIndex == '1' && $store.state.applicationInfo.currentUser">
                <a>批次：</a>
                <span>{{ configBatch }}</span>
            </div>
            <!-- 运行时长 -->
            <div class="duration-box"
                v-if="runningDuration && activeIndex == '1' && $store.state.applicationInfo.currentUser">
                <a>运行时长：</a>
                <span>{{ runningDuration }}</span>
            </div>
        </div>
        <!-- 暂不开发系统设置相关功能 -->
        <!-- <div class="settingClass">
            <i class="el-icon-setting" @click="settingClick"></i>
        </div> -->
        <div style="display: flex; align-items: center; margin-left: auto;">
            <div class="licenseClass">
                <span v-if="licenseText.includes('永久授权')" :class="licenseTextClass">
                    {{ currentLicenseStatus }}
                </span>
                <el-tooltip v-else :content="licenseText" placement="top">
                    <span :class="licenseTextClass">
                        {{ currentLicenseStatus }}
                    </span>
                </el-tooltip>
            </div>
            <!-- 暂不开发用户相关功能 -->
            <ht-avatar @userLogin="userLogin" @userLogout="userLogout" />
        </div>
        <!-- 添加系统设置弹窗 -->
        <el-dialog title="系统设置" :visible.sync="settingDialogVisible" width="800px" custom-class="setting-dialog"
            @close="handleClose" :close-on-click-modal="false" :modal-append-to-body="false">
            <div class="dialog-container">
                <!-- 左侧导航 -->
                <div class="dialog-sidebar">
                    <div class="sidebar-item" v-for="(tab, index) in tabs" :key="index"
                        :class="{ active: activeTab === tab.name }" @click="activeTab = tab.name">
                        {{ tab.label }}
                    </div>
                </div>
                <!-- 右侧内容 -->
                <div class="dialog-content">
                    <el-tabs v-model="activeTab" :class="{ 'hide-tabs': true }">
                        <el-tab-pane name="detection">
                            <div class="mode-section">
                                <div class="mode-item">
                                    <el-radio v-model="settings.detectionMode" label="original">质检模式</el-radio>
                                    <div class="mode-desc">(选择该模式后，在新建工作配置时只提供质检模式的工作流配置)</div>
                                </div>
                                <div class="mode-item">
                                    <el-radio v-model="settings.detectionMode" label="mixed">监控模式</el-radio>
                                    <div class="mode-desc">(选择该模式后，在新建工作配置时只提供监控模式的工作流配置)</div>
                                </div>
                                <div class="mode-item">
                                    <el-radio v-model="settings.detectionMode" label="mixed2">混合模式</el-radio>
                                    <div class="mode-desc">(选择该模式后，在新建工作配置时通过下拉菜单配置"质检模式"或"监控模式")</div>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="visibility">
                            <div class="switch-section">
                                <el-switch v-model="settings.hardwareReg" active-text="硬件注册"
                                    @change="handleVisibilityChange('hardwareReg')">
                                </el-switch>
                                <el-switch v-model="settings.softwareReg" active-text="软件注册"
                                    @change="handleVisibilityChange('softwareReg')">
                                </el-switch>
                                <el-switch v-model="settings.touchSystem" active-text="触发系统"
                                    @change="handleVisibilityChange('touchSystem')">
                                </el-switch>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="personalization">
                            <div class="personalization-section">
                                <div class="input-item">
                                    <span class="label">名称设置：</span>
                                    <el-input v-model="settings.name" placeholder="请输入系统名称"></el-input>
                                </div>
                                <div class="input-item">
                                    <span class="label">Logo设置：</span>
                                    <el-upload class="logo-uploader" action="#" :show-file-list="false"
                                        :before-upload="beforeLogoUpload">
                                        <img v-if="settings.logoUrl" :src="settings.logoUrl" class="logo">
                                        <i v-else class="el-icon-plus logo-uploader-icon"></i>
                                    </el-upload>
                                    <div class="upload-tip">（只能上传png/jpg文件，且不超过500kb）</div>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="license">
                            <div class="license-section">
                                <div class="licenseClass">
                                    <span :class="licenseTextClass">{{ licenseText }}</span>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </el-dialog>
        <!-- 登录页面弹窗 -->
        <!-- 登录页 -->
        <el-dialog title="" class="loginDialogClass" :visible.sync="loginDialogVisible" width="800px"
            :close-on-click-modal="true" :modal-append-to-body="false">
            <div class="logindata">
                <div class="loginLogo">
                    <img src="../../assets/imgs/logo.png" alt="" />
                </div>
                <div class="loginText">
                    <a>欢迎使用领邦智能!</a>
                    <el-form ref="loginForm" :model="loginForm" :rules="loginRules">
                        <el-form-item prop="username">
                            <i class="iconfont icon-lbznzhanghao"></i>
                            <el-select v-model="loginForm.username" placeholder="请选择账号" @change="handleUserChange">
                                <el-option v-for="(item, key) in validUsers" :key="key" :label="key"
                                    :value="key"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item prop="password">
                            <i class="iconfont icon-lbznziyuanxhdpi"></i>
                            <el-input v-model="loginForm.password" placeholder="密码" show-password :disabled="true"
                                @keyup.native.enter="login('loginForm')"></el-input>
                        </el-form-item>
                    </el-form>
                    <div class="loginBtn">
                        <iBrain-button type="primary" @click.native.prevent="login('loginForm')">立即登录</iBrain-button>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import SidebarItem from './SidebarItem';
import htAvatar from "../HtAvatar/index.vue";
import { getWorkConfigs, getLicense, getWorkflows } from '@/api/workflowConfig.js';
import _ from 'lodash';
export default {
    components: { SidebarItem, htAvatar },
    computed: {
        routes() {
            return this.$router.options.routes;
        },
    },
    data() {
        return {
            activeIndex: this.$route.path.includes('/console') ? '1' : '2',
            ruleValueData: null,
            selectRuleId: null,
            systemText: null,
            startShow: true,
            endShow: false,
            isDisabled: false,
            isSelected: false,
            settingShow: false,
            settingDialogVisible: false,
            systemTextShow: false,
            loginDialogVisible: false,
            activeTab: 'detection',
            ruleValue: '',
            licenseText: '',
            licenseTextClass: '',
            currentLicenseStatus: '',
            settings: {
                detectionMode: 'original',
                hardwareReg: true,
                softwareReg: true,
                touchSystem: true,
                name: '',
                logoUrl: '',
            },
            tabs: [
                { label: '全局检测模式设定', name: 'detection' },
                { label: '导航栏可见性设定', name: 'visibility' },
                { label: '个性化设置', name: 'personalization' },
                { label: '软件许可', name: 'license' }
            ],
            loginForm: {
                username: '运维员',
                password: 'iBrainLeaderTech',
            },
            loginRules: {
                username: [
                    { required: true, message: "请输入用户名", trigger: "blur" },
                    { max: 255, message: "不能大于255个字符", trigger: "blur" },
                ],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                    { max: 255, message: "不能大于255个字符", trigger: "blur" },
                ],
            },
            checked: false,
            redirect: undefined,
            showConfigTab: true,
            validUsers: {
                "运维员": "iBrainLeaderTech",
                "管理员": "admin123",
                "操作员": "123456"
            },
            configBatch: null,
            runningDuration: null,
        }
    },
    methods: {
        ruleValueChange(value) {
            this.selectRuleId = value.value;
            this.getCermaData(value.value);
        },
        async getCermaData(config_id) {
            console.log("🚀 ~ getCermaData ~ config_id:", config_id)
            // 清空之前的数据
            this.$sessionStorage.removeItem('workflowData');
            // 查询工作流
            const workflow = await getWorkflows(config_id);
            // 将 config_id 和 workflow 存储到一起
            const workflowData = {
                configId: config_id,
                workflow: workflow
            };
            // 获取工作配置类型
            let config_type = workflow.type;
            // 获取工作配置批次
            this.configBatch = workflow.batch;
            this.$sessionStorage.setItem('workflowData', JSON.stringify(workflowData));
            // 发送事件
            this.$baseEventBus.$emit("$Bus_workflowConfig", config_id, config_type, workflow);
        },
        handleSelect(key, keyPath) {
            this.activeIndex = key;
            if (key == '1') {
                this.getConfigData();
            }
        },
        getConfigData(config_id) {
            getWorkConfigs().then(res => {
                let arr1 = res.map(item => {
                    return {
                        value: item.id, // 将 id 属性值复制到 value
                        name: item.name, // 将 name 属性值复制到新数组
                    };
                });
                this.ruleValueData = arr1;
                if (config_id) {
                    this.ruleValue = this.ruleValueData.find(item => item.value === config_id);
                } else {
                    // 判断 selectRuleId 是否存在且在 ruleValueData 中
                    if (this.selectRuleId && this.ruleValueData.some(item => item.value === this.selectRuleId)) {
                        this.getCermaData(this.selectRuleId);
                    } else {
                        // 如果不存在，清空 ruleValue和相关其他数据
                        this.ruleValue = '';
                    }
                }
            })
        },
        sendStart: _.debounce(function () {
            this.$baseEventBus.$emit("$Bus_start", 'start', this.selectRuleId);
        }, 100),
        sendEnd: _.debounce(function () {
            this.$baseEventBus.$emit("$Bus_end", 'end', this.selectRuleId);
        }, 300),
        // 获取授权信息
        getLicense() {
            getLicense().then(res => {
                // 解析返回的字符串
                const licenseInfo = res.split('，');
                const status = licenseInfo[0];
                const endTimeStr = licenseInfo[3] ? licenseInfo[3].match(/剩余(.+)/) ? licenseInfo[3].match(/剩余(.+)/)[1] : '' : '';
                const endTimeStrs = licenseInfo[1] ? licenseInfo[1].match(/剩余(.+)/) ? licenseInfo[1].match(/剩余(.+)/)[1] : '' : '';
                switch (status) {
                    case '永久':
                        this.licenseText = '永久授权';
                        this.currentLicenseStatus = '永久授权';
                        this.licenseTextClass = 'license-normal';
                        break;
                    case '已使用':
                        this.currentLicenseStatus = '已授权';
                        const remainingParts = endTimeStr.match(/(\d+)天(\d+)小时(\d+)分钟/);
                        const remainingMs = (parseInt(remainingParts[1]) * 24 * 60 * 60 * 1000) +
                            (parseInt(remainingParts[2]) * 60 * 60 * 1000) +
                            (parseInt(remainingParts[3]) * 60 * 1000);

                        const oneWeek = 7 * 24 * 60 * 60 * 1000;

                        if (remainingMs > oneWeek) {
                            this.licenseText = `已授权，剩余授权时间${endTimeStr}`;
                            this.licenseTextClass = 'license-normal';
                        } else {
                            this.licenseText = `已授权，剩余授权时间${endTimeStr}，请联系销售顾问进行授权`;
                            this.licenseTextClass = 'license-warning';
                        };
                        break;
                    case '已过期':
                        this.currentLicenseStatus = '已过期';
                        this.licenseText = '已过期，请联系销售顾问进行授权';
                        this.licenseTextClass = 'license-warning';
                        break;
                    case '未使用':
                        this.currentLicenseStatus = '已授权';
                        this.licenseText = `已授权，剩余授权时间${endTimeStrs}`;
                        this.licenseTextClass = 'license-normal';
                        break;
                }
            })
        },
        settingClick() {
            this.settingDialogVisible = true;
            this.activeTab = 'detection';
        },
        handleClose() {
            // 在这里处理设置的保存逻辑
            this.settingDialogVisible = false;
        },
        beforeLogoUpload(file) {
            const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
            const isLt500K = file.size / 1024 < 500;

            if (!isImage) {
                this.$message.warning('只能上传 JPG 或 PNG 格式的图片!');
                return false;
            }
            if (!isLt500K) {
                this.$message.warning('图片大小不能超过 500KB!');
                return false;
            }

            // 这里应该添加实际的上传逻辑
            return false;
        },
        handleVisibilityChange(key) {
            const payload = {
                [key]: this.settings[key]
            }
            this.$store.dispatch('updateNavigationVisibility', payload)
        },
        userLogin() {
            this.loginDialogVisible = true;
        },
        userLogout() {
            if (this.activeIndex == '2') {
                this.$router.push('/console/index');
                this.activeIndex = '1';
            }
        },
        login(form) {
            this.$refs[form].validate((valid) => {
                if (valid) {
                    const username = this.loginForm.username;

                    // 获取权限配置
                    const userPermissions = {
                        "运维员": {
                            showHardwareReg: true,
                            showSoftwareReg: true,
                            showTouchSystem: true,
                            showConfigMenu: true
                        },
                        "管理员": {
                            showHardwareReg: false,
                            showSoftwareReg: false,
                            showTouchSystem: false,
                            showConfigMenu: true
                        },
                        "操作员": {
                            showHardwareReg: false,
                            showSoftwareReg: false,
                            showTouchSystem: false,
                            showConfigMenu: false
                        }
                    };

                    this.$message({
                        message: "登录成功!",
                        type: "success",
                        showClose: true
                    });

                    // 保存登录状态和用户名
                    this.$store.state.applicationInfo.showConfigMenu = userPermissions[username].showConfigMenu;
                    this.$store.state.applicationInfo.currentUser = username;
                    this.$store.state.applicationInfo.userPermissions = userPermissions[username];

                    // 根据用户权限设置导航可见性
                    this.$store.dispatch('updateNavigationVisibility', {
                        hardwareReg: userPermissions[username].showHardwareReg,
                        softwareReg: userPermissions[username].showSoftwareReg,
                        touchSystem: userPermissions[username].showTouchSystem
                    });

                    // 保存用户登录状态
                    localStorage.setItem('showConfigMenu', JSON.stringify(userPermissions[username].showConfigMenu));
                    localStorage.setItem('currentUser', username);
                    localStorage.setItem('userPermissions', JSON.stringify(userPermissions[username]));

                    this.loginDialogVisible = false;

                    // 如果是操作员，确保在"运行"页面
                    if (username === "操作员" && !this.$route.path.includes('/console')) {
                        this.$router.push('/console/index');
                        this.activeIndex = '1';
                    }
                } else {
                    return false;
                }
            });
        },
        // 更新导航配置项显示状态
        updateNavConfigDisplay() {
            const currentUser = this.$store.state.applicationInfo.currentUser;
            // 如果是"操作员"或未登录，则不显示配置选项
            this.showConfigTab = currentUser !== "操作员";

            // 如果当前在配置页面但用户是操作员，需要跳转到运行页面
            if (currentUser === "操作员" && this.$route.path.includes('/workflowConfig')) {
                this.$router.push('/console/index');
                this.activeIndex = '1';
            }
        },
        handleUserChange(value) {
            this.loginForm.password = this.validUsers[value];
        },
    },
    mounted() {
        // 初始化时设置当前路由和展开的子菜单
        this.openeds = [this.activeSubmenu];

        // 检查当前用户角色，决定是否显示配置选项
        this.updateNavConfigDisplay();

        // 清空之前的数据
        this.$sessionStorage.removeItem('workflowData');
        this.getConfigData();
        this.getLicense();

        // 监听用户权限变化
        this.$watch('$store.state.applicationInfo.currentUser', this.updateNavConfigDisplay);

        this.$baseEventBus.$on("$start_Success", (isDisabled, startShow, endShow, systemStatus, systemTextShow, isSelectedStatus) => {
            this.isDisabled = isDisabled;
            this.startShow = startShow;
            this.endShow = endShow;
            this.isSelected = isSelectedStatus;
            this.systemTextShow = systemTextShow;
            if (systemStatus !== '') {
                if (systemStatus.status == "Initializing") {
                    this.systemText = '设备初始化中'
                } else if (systemStatus.status == "Running") {
                    this.systemText = '设备运行中'
                }
            }
        });
        this.$baseEventBus.$on("$start_Fail", (isDisabled, startShow, endShow, systemStatus, systemTextShow) => {
            this.isDisabled = isDisabled;
            this.startShow = startShow;
            this.endShow = endShow;
            this.isSelected = false;
            this.systemTextShow = systemTextShow;
            if (systemStatus !== '') {
                if (systemStatus.status == "Stopping") {
                    this.systemText = '设备停止中'
                } else if (systemStatus.status == "Stopped") {
                    this.systemText = '设备已停止'
                }
            }
        });
        this.$baseEventBus.$on("$Bus_currentConfigId", (config_id) => {
            if (config_id) {
                // 根据 config_id 从 ruleValueData 数组中筛选出对应配置对象
                this.getConfigData(config_id);
                this.selectRuleId = config_id;
            }
        });
        this.$baseEventBus.$on("$Bus_isShowEditing", (isShowEditing) => {
            this.isDisabled = isShowEditing;
        });

        // 添加运行时长更新事件监听
        this.$baseEventBus.$on('updateRunningDuration', (duration) => {
            this.runningDuration = duration;
        });
    },
    beforeDestroy() {
        this.$baseEventBus.$off("$start_Success");
        this.$baseEventBus.$off("$start_Fail");
        this.$baseEventBus.$off("$Bus_isShowEditing");
        this.$baseEventBus.$off('updateRunningDuration');
    },
    created() {
        // 初始化时从 store 或 localStorage 获取设置
        const savedVisibility = JSON.parse(localStorage.getItem('navigationVisibility'))
        if (savedVisibility) {
            this.settings = {
                ...this.settings,
                ...savedVisibility
            }
        }
    },
    beforeDestroy() {
        this.$baseEventBus.$off("$Bus_saveSuccess");
    },
}
</script>
<style lang="scss">
.sidebar-class {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    background-color: #ffffff;
    padding: 0px 30px;
    box-shadow: 0px -5px 18px 0px rgba(0, 0, 0, 0.33);
    border-radius: 0px 0px 10px 10px;

    .zmlogo {
        display: flex;
        align-items: center;
        width: 40px;
        height: 40px;
        margin-right: 600px;

        img {
            width: 100%;
            height: 100%;
        }
    }

    .startClass {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;

        .el-select {
            width: 150px;
        }

        .selectClass {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            flex-direction: row;
            margin-right: 20px;
            width: 285px;

            i {
                font-size: 20px;
                margin-left: 10px;
            }

            a {
                display: flex;
                color: #727990;
                font-weight: 900;
                font-size: 18px;
            }

            .icon-lbznqidong {
                font-size: 32px !important;
            }

            .icon-lbznstop-circle-full {
                font-size: 32px !important;
            }

            .el-select {
                margin-right: 5px;

                .el-input__inner {
                    height: 36px !important;
                    line-height: 36px !important;
                }
            }

            .el-button {
                border: none;
                padding: 0 12px 0px 0px;

                &:active {
                    color: #000000;
                    background-color: #ffffff;
                }

                &:hover {
                    color: #000000;
                    background-color: #ffffff;
                }

                &:focus {
                    background-color: #ffffff;
                }
            }
        }

        .batch-box {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-right: 20px;
            margin-left: 20px;

            a {
                margin-right: 10px;
                font-weight: bold;
            }

            span {
                font-size: 18px;
                color: #ea9a5c;
                font-weight: bold;
            }
        }

        .duration-box {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-right: 20px;

            a {
                margin-right: 10px;
                font-weight: bold;
            }

            span {
                font-size: 18px;
                color: #ea9a5c;
                font-weight: bold;
            }
        }

        .menuClass {
            height: 40px;
            line-height: 40px;
            padding: 0px 10px 0px 10px;
            border-radius: 10px;
            background-color: rgba(237, 237, 237, 1);
            color: rgba(17, 17, 17, 1);
            font-size: 18px;
            text-align: center;
            display: flex;
            flex-direction: row;
            align-items: center;
        }
    }

    .el-menu {
        display: flex;
        justify-content: flex-start;
        border-bottom: none !important;
        border-radius: 10px;

        .el-menu-item {
            display: block;
            font-size: 16px !important;
            padding: 0 20px;
            height: 36px;
            line-height: 36px;
            border-radius: 10px;
        }

        .el-submenu__title {
            font-size: 16px !important;
        }

        .el-menu-item.is-active {
            background: #000000 !important;
            height: 36px;
            line-height: 36px;
        }

        .el-menu-item:not(.is-disabled):hover {
            background: #000000 !important;
            color: #ffffff !important;
            height: 36px;
            line-height: 36px;
        }

        .el-submenu .el-submenu__title:hover {
            background: #000000 !important;
        }

        .el-submenu.is-active .el-submenu__title {
            background: #000000 !important;
        }

        .el-menu--horizontal .el-menu .el-menu-item {
            color: rgb(48, 86, 211) !important;
            background-color: #ffffff !important;
        }
    }

    .licenseClass {
        margin-right: 20px;
        font-size: 16px;
        font-weight: 900;
        cursor: pointer;

        span {
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 16px;
        }

        .license-normal {
            // color: #2f760b; // 绿色
            background: #4c6026;
        }

        .license-warning {
            // color: #b57f2f; // 橙色
            background: #f4ac45;
        }
    }

    .settingClass {
        margin-left: auto;
        font-size: 28px;
        cursor: pointer;
    }

    a {
        text-decoration: none;
    }

    .router-link-active {
        text-decoration: none;
    }

    .setting-dialog {
        .el-dialog__body {
            padding: 0;
            min-height: 400px;
        }

        .dialog-container {
            display: flex;
            height: 100%;
        }

        .dialog-sidebar {
            width: 200px;
            background-color: #f5f7fa;
            border-right: 1px solid #e6e6e6;

            .sidebar-item {
                padding: 16px 20px;
                cursor: pointer;
                font-size: 14px;
                color: #606266;

                &:hover {
                    background-color: #ecf5ff;
                    color: #409eff;
                }

                &.active {
                    background-color: #fff;
                    color: #409eff;
                    font-weight: 500;
                }
            }
        }

        .dialog-content {
            flex: 1;
            padding: 20px;
            background-color: #fff;
        }

        .mode-section {
            .mode-item {
                margin-bottom: 15px;

                .mode-desc {
                    color: #999;
                    margin-left: 24px;
                    font-size: 12px;
                }
            }
        }

        .switch-section {
            .el-switch {
                display: block;
                margin-bottom: 15px;
            }
        }

        .personalization-section {
            .input-item {
                margin-bottom: 20px;

                .label {
                    display: inline-block;
                    width: 80px;
                }

                .el-input {
                    width: 300px;
                }
            }

            .logo-uploader {
                .logo-uploader-icon {
                    font-size: 28px;
                    color: #8c939d;
                    width: 100px;
                    height: 100px;
                    line-height: 100px;
                    text-align: center;
                    border: 1px dashed #d9d9d9;
                }

                .logo {
                    width: 100px;
                    height: 100px;
                    display: block;
                }
            }

            .upload-tip {
                color: #999;
                font-size: 12px;
                margin-top: 5px;
            }
        }

        .license-section {
            .license-item {
                margin-bottom: 10px;
                padding: 10px;
                border-radius: 4px;

                &.authorized {
                    color: #67C23A;
                    background-color: #f0f9eb;
                }

                &.unauthorized {
                    color: #F56C6C;
                    background-color: #fef0f0;
                }
            }
        }
    }

    .loginDialogClass {
        .el-dialog {
            background: none;
            box-shadow: none;

            .el-dialog__headerbtn {
                display: none;
            }

            .el-dialog__body {
                display: flex;
                justify-content: center;

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
                        display: flex;
                        flex-direction: column;

                        a {
                            font-size: 20px;
                            font-weight: 900;
                            color: #000000;
                            display: block;
                            float: inline-start;
                            margin-bottom: 20px;
                        }

                        .el-form {
                            .el-form-item {
                                .el-form-item__content {
                                    display: flex;
                                    flex-direction: row;
                                    align-items: center;

                                    i {
                                        font-size: 22px !important;
                                        margin-right: 8px;
                                    }

                                    .el-input,
                                    .el-select {
                                        width: 270px;
                                    }
                                }
                            }
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
        }
    }
}


.hide-tabs {
    .el-tabs__header {
        display: none;
    }
}
</style>
