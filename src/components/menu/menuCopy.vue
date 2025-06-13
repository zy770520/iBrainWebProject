<template>
    <div class="nav-container">
        <el-row class="box">
            <el-col :span="24">
                <el-menu :default-active="onRoutes" class="el-menu-vertical-demo" router unique-opened
                    :default-openeds="openeds">
                    <el-submenu index="1" class="navBox">
                        <template slot="title">
                            <span class="nav-configTitle">工作配置</span>
                            <!-- <i class="iconfont icon-lbzntianjia" @click.stop="addWorkConfig"></i> -->
                        </template>
                        <div class="navbox-children" style="border-color: #cb9953;">
                            <div class="search-class">
                                <el-input v-model="searchQuery" placeholder="搜索工作配置" size="mini" clearable></el-input>
                                <!-- <i class="iconfont icon-lbznshaixuan"></i> -->
                                <i class="iconfont icon-lbzntianjia" @click.stop="addWorkConfig"></i>
                            </div>
                            <div v-if="filteredConfigList.length === 0" class="emptyList-class">暂无数据</div>
                            <el-menu-item-group v-else>
                                <el-menu-item v-for="(item, index) in filteredConfigList" :key="index"
                                    :index="`/workflowConfig/index?id=${item.id}${item.id === 0 ? '&name=' + item.name : ''}&manualSwitch=true`"
                                    :class="{ 'is-active-custom': isItemActive(item) }" class="config-item">
                                    <el-tooltip effect="dark" :content="item.name" placement="top"
                                        v-if="item.name.length > 7">
                                        <a class="itemClass">{{ item.name }}</a>
                                    </el-tooltip>
                                    <a v-else class="itemClass">{{ item.name }}</a>
                                    <i class="el-icon-more more-icon" style="transform: rotate(90deg);"
                                        @click.stop="showContextMenu($event, item)"></i>
                                    <div class="context-menu" v-show="contextMenuVisible && selectedItem === item"
                                        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
                                        v-click-outside="hideContextMenu">
                                        <div class="menu-item" @click.stop="copyConfig(item)" v-if="item.id !== 0">复制
                                        </div>
                                        <div class="menu-item" @click.stop="deleteConfig(item, index);">删除</div>
                                    </div>
                                </el-menu-item>
                            </el-menu-item-group>
                        </div>
                    </el-submenu>
                    <el-submenu v-if="showHardwareReg" index="2" class="navBox">
                        <template slot="title">
                            <span class="nav-resgisterTitle">硬件注册</span>
                        </template>
                        <div class="navbox-children" style="border-color: #526c26;">
                            <el-tree ref="deviveTree" :data="treeData" :props="defaultProps" node-key="id"
                                :expand-on-click-node="false" :default-checked-keys="defaultCheckedKeys"
                                :default-expand-all="true" :check-on-click-node="true" :show-checkbox="false"
                                auto-expand-parent highlight-current @node-click="handleNodeClick">
                                <template #default="{ node, data }">
                                    <span class="label-class">
                                        {{ data.label }}
                                        <i class="iconfont icon-lbzntianjia" v-if="data.label === '飞拍组'"
                                            @click.stop="addDevice"></i>
                                    </span>
                                    <!-- <div v-if="data.children.length === 0" class="emptyList-class">暂无数据</div> -->
                                </template>
                            </el-tree>
                        </div>
                    </el-submenu>
                    <el-submenu v-if="showTouchSystem" index="3" class="navBox notconfig-menu">
                        <template slot="title">
                            <span class="nav-systemTitle">触发系统</span>
                        </template>
                        <div class="navbox-children" style="border-color: #bd9074;">
                            <el-menu-item-group v-show="systemData.length > 0">
                                <el-menu-item v-for="(item, index) in systemData" :key="index"
                                    :index="'/workflowConfig/system?id=' + item.id">{{
                                        item.systemName }}</el-menu-item>
                            </el-menu-item-group>
                        </div>
                    </el-submenu>
                    <el-submenu v-if="showSoftwareReg" index="4" class="navBox notconfig-menu">
                        <template slot="title">
                            <span class="nav-softwareTitle">软件注册</span>
                        </template>
                        <div class="navbox-children" style="border-color: #ce7f84;">
                            <el-menu-item-group>
                                <el-menu-item index="/softwareRegistration/sizeAlgorithm">尺寸算法</el-menu-item>
                            </el-menu-item-group>
                        </div>
                    </el-submenu>
                </el-menu>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { query_ctlrs } from "@/api/register.js";
import { getWorkConfigs, cloneWorkFlow, getDelete } from '@/api/workflowConfig.js';
export default {
    name: 'config',
    data() {
        return {
            openeds: ['1'],
            flag: 0,
            configName: '',
            hardName: '',
            systemData: [],
            configList: [],
            // onRoutes: this.$route.path,
            contextMenuVisible: false,
            contextMenuX: 20,
            contextMenuY: 30,
            selectedItem: null,
            searchQuery: '',
            newNumber: "未配置编号",
            treeData: [{
                id: 1,
                label: '飞拍组',
                children: []
            }],
            defaultProps: {
                children: 'children',
                label: 'label',
            },
            defaultCheckedKeys: [],
            showHardwareReg: false,
            showTouchSystem: false,
            showSoftwareReg: false,
        }
    },
    computed: {
        filteredConfigList() {
            return this.configList.filter(item =>
                item.name.includes(this.searchQuery)
            );
        },
        onRoutes() {
            // 统一处理激活状态匹配逻辑
            const route = this.$route;

            // 工作配置页面
            if (route.path.includes('/workflowConfig/index')) {
                const id = route.query.id;
                // 如果是ID为0的新建项，同时匹配name
                if (id === '0' && route.query.name) {
                    return `/workflowConfig/index?id=0&name=${route.query.name}`;
                }
                // 其他情况只匹配ID
                return `/workflowConfig/index?id=${id}`;
            }

            // 系统页面
            if (route.path.includes('/workflowConfig/system')) {
                return `/workflowConfig/system?id=${route.query.id}`;
            }

            // 硬件注册相关路由
            if (route.path.includes('/workflowConfig/register') ||
                route.path.includes('/workflowConfig/camera') ||
                route.path.includes('/workflowConfig/light') ||
                route.path.includes('/workflowConfig/station') ||
                route.path.includes('/workflowConfig/electric') ||
                route.path.includes('/workflowConfig/solenoid') ||
                route.path.includes('/workflowConfig/feeder') ||
                route.path.includes('/workflowConfig/stop') ||
                route.path.includes('/workflowConfig/triColor')) {
                return route.fullPath;
            }

            return route.path;
        },
        // 获取当前选中的工作配置ID
        currentWorkConfigId() {
            return this.$route.query.id;
        },
        // 计算当前应该展开的菜单
        activeSubmenu() {
            const path = this.$route.path;
            if (path.includes('/workflowConfig/index')) return '1';
            if (path.includes('/workflowConfig/register') ||
                path.includes('/workflowConfig/camera') ||
                path.includes('/workflowConfig/light') ||
                path.includes('/workflowConfig/station') ||
                path.includes('/workflowConfig/electric') ||
                path.includes('/workflowConfig/solenoid') ||
                path.includes('/workflowConfig/feeder') ||
                path.includes('/workflowConfig/stop') ||
                path.includes('/workflowConfig/triColor')) return '2';
            if (path.includes('/workflowConfig/system')) return '3';
            if (path.includes('/softwareRegistration')) return '4';
            return '1';
        }
    },
    watch: {
        '$route'(to, from) {

            // 保存工作配置的选中状态
            // if (to.path.includes('/workflowConfig/index') && to.query.id) {
            //     localStorage.setItem('selectedWorkConfig', JSON.stringify({
            //         id: to.query.id,
            //         name: to.query.name || ''
            //     }));
            // }

            // 如果不是硬件注册相关的路由，清除树状态
            if (!to.path.includes('/workflowConfig/register') &&
                !to.path.includes('/workflowConfig/camera') &&
                !to.path.includes('/workflowConfig/light') &&
                !to.path.includes('/workflowConfig/station') &&
                !to.path.includes('/workflowConfig/electric') &&
                !to.path.includes('/workflowConfig/solenoid') &&
                !to.path.includes('/workflowConfig/feeder') &&
                !to.path.includes('/workflowConfig/stop') &&
                !to.path.includes('/workflowConfig/triColor')) {
                localStorage.removeItem('hardwareTreeState');
                // 清除树的选中状态
                if (this.$refs.deviveTree) {
                    this.$refs.deviveTree.setCurrentKey(null);
                }
            } else {
                if (this.$route.path.includes('/workflowConfig/station')) {
                    this.$nextTick(() => {
                        // 展开父节点
                        const parentNode = this.$refs.deviveTree.getNode(1);
                        if (parentNode) {
                            parentNode.expand();
                        }
                        // 最后设置当前选中节点
                        this.$refs.deviveTree.setCurrentKey(6);
                        // 保存当前节点状态和路由信息
                        localStorage.setItem('hardwareTreeState', JSON.stringify({
                            currentNodeId: 6,
                            parentNodeId: 1,
                            route: '/workflowConfig/station'
                        }));
                    });
                } else {
                    // 从localStorage恢复树的状态
                    const savedTreeState = JSON.parse(localStorage.getItem('hardwareTreeState') || '{}');
                    if (savedTreeState.currentNodeId) {
                        this.$nextTick(() => {
                            // 展开父节点
                            if (savedTreeState.parentNodeId) {
                                const parentNode = this.$refs.deviveTree.getNode(savedTreeState.parentNodeId);
                                if (parentNode) {
                                    parentNode.expand();
                                }
                            }
                            // 最后设置当前选中节点
                            this.$refs.deviveTree.setCurrentKey(savedTreeState.currentNodeId);
                        });
                    }
                }
            }
        },
        activeSubmenu: {
            immediate: true,
            handler(newVal) {
                this.openeds = [newVal];
            }
        },
        '$store.state.applicationInfo.menuWorkFlowRefresh'(nv, ov) {
            if (nv) {
                // 获取配置列表
                getWorkConfigs().then((data) => {
                    this.configList = data || [];

                    // 只有当前在工作配置相关页面时，才考虑执行自动选中逻辑
                    if (this.$route.path.includes('/workflowConfig/index')) {
                        let { id = 0, name = '', reloadAfterSave, newConfig } = this.$route.query;

                        // 判断是否是用户主动切换配置（只有用户主动点击菜单项才会有这个标记）
                        const isManualConfigSwitch = id && this.$route.query.manualSwitch === 'true';

                        // 判断是否是保存后的重载（保存完新配置后的特殊标记）
                        const isReloadAfterSave = reloadAfterSave === 'true';

                        // 判断是否是新增配置操作（有特殊的newConfig标记）
                        const isNewConfigAction = newConfig === 'true';

                        // 如果是用户主动切换配置，跳过自动选中逻辑
                        if (isManualConfigSwitch) {
                            console.log('用户主动切换配置，跳过自动选中逻辑');
                            return;
                        }

                        // 如果是保存后的重载，跳过自动选中逻辑
                        if (isReloadAfterSave && id) {
                            console.log('保存后的重载，跳过自动选中逻辑');
                            return;
                        }

                        // 如果是新增配置操作，跳过自动选中逻辑
                        if (isNewConfigAction && id === '0') {
                            console.log('新增配置操作，跳过自动选中逻辑');
                            return;
                        }

                        // 检查当前路由是否已经有工作配置ID
                        const hasWorkConfigId = id && id !== '0';

                        // 当saveData成功后触发的刷新，跳过自动选中逻辑
                        const currentIdValid = hasWorkConfigId && this.configList.some(c => c.id.toString() === id);
                        if (currentIdValid) {
                            console.log('当前ID有效，跳过自动选中逻辑');
                            return;
                        }

                        // 只有在以下情况才执行自动选中逻辑:
                        // 1. 没有当前配置ID (可能是初次访问或刚删除配置)
                        // 2. 当前配置ID在列表中找不到 (配置已被删除)
                        // 3. 不是用户手动切换 (没有manualSwitch标记)
                        // 4. 不是保存后的重载 (没有reloadAfterSave标记)
                        // 5. 不是新增配置操作 (没有newConfig标记)
                        if (!hasWorkConfigId || !this.configList.some(c => c.id.toString() === id)) {
                            // 如果配置列表不为空，自动选中第一个配置
                            if (this.configList.length > 0) {
                                // 再次检查是否有新增配置操作标记，确保不干扰新增流程
                                if (isNewConfigAction) {
                                    console.log('新增配置操作标记存在，跳过自动选中逻辑');
                                    return;
                                }

                                const firstConfig = this.configList[0];
                                console.log('自动选中第一个工作配置:', firstConfig.name);

                                // 导航到第一个配置的详情页面，不添加manualSwitch标记
                                this.$router.replace({
                                    path: '/workflowConfig/index',
                                    query: {
                                        id: firstConfig.id,
                                        name: firstConfig.name,
                                        StorId: `${Date.now()}-${firstConfig.id}`
                                    }
                                });

                                // 更新选中状态
                                localStorage.setItem('selectedWorkConfig', JSON.stringify({
                                    id: firstConfig.id,
                                    name: firstConfig.name
                                }));
                            }
                            // else if (this.configList.length === 0) {
                            //     // 如果配置列表为空，展示空状态
                            //     this.$router.push({
                            //         path: '/workflowConfig/index',
                            //         query: { delete: true }
                            //     });
                            // }
                        }
                    }
                    // 如果不在工作配置页面，只更新列表不做路由跳转
                });
            }
        },
        // 监听用户权限变化
        '$store.state.applicationInfo.userPermissions': {
            handler(newVal) {
                this.updateMenuPermissions();
            },
            immediate: true
        },
        '$store.state.settings.navigationVisibility': {
            handler(newVal) {
                this.updateMenuPermissions();
            },
            deep: true,
            immediate: true
        }
    },
    created() {
        // 初始化时从 store 或 localStorage 获取设置
        const savedVisibility = JSON.parse(localStorage.getItem('navigationVisibility'));
        if (savedVisibility) {
            this.settings = {
                ...this.settings,
                ...savedVisibility
            };
        }

        // 从localStorage加载用户权限
        const userPermissions = JSON.parse(localStorage.getItem('userPermissions'));
        if (userPermissions) {
            this.showHardwareReg = userPermissions.showHardwareReg;
            this.showSoftwareReg = userPermissions.showSoftwareReg;
            this.showTouchSystem = userPermissions.showTouchSystem;
        } else {
            // 默认加载store中的设置
            this.updateMenuPermissions();
        }
    },
    mounted() {
        // 初始化时设置当前路由和展开的子菜单
        this.openeds = [this.activeSubmenu];

        // 添加初始化状态恢复
        // const savedConfig = JSON.parse(localStorage.getItem('selectedWorkConfig') || '{}');

        // 先初始化数据
        this.initData().then(() => {
            // 如果当前不在工作配置页面但有保存的配置，尝试激活对应的菜单项
            // if (savedConfig.id && !this.$route.path.includes('/workflowConfig/index')) {
            //     // 通过查找配置项保持一致性
            //     const targetConfig = this.configList.find(item =>
            //         item.id.toString() === savedConfig.id.toString() &&
            //         (!savedConfig.name || item.name === savedConfig.name)
            //     );

            //     if (targetConfig) {
            //         // 仅标记选中状态，不进行导航
            //         this.$nextTick(() => {
            //             // 手动激活菜单项
            //             document.querySelectorAll('.config-item').forEach(el => {
            //                 if (el.textContent.includes(targetConfig.name)) {
            //                     el.classList.add('is-active-custom');
            //                 }
            //             });
            //         });
            //     }
            // }
        });

        this.$nextTick(() => {
            this.$baseEventBus.$on("$Bus_delete", (data) => {
                this.initData()
            });
            this.$baseEventBus.$on("$Bus_ctlr", (data) => {
                if (data == 'true') {
                    this.initData()
                }
            })
        })
    },
    methods: {
        //初始化
        async initData() {
            try {
                const data = await getWorkConfigs();
                this.configList = data;
                const res = await query_ctlrs();

                if (res) {
                    //整合触发系统数据
                    res.forEach(item => {
                        this.$set(item, 'systemName', item.number + '号飞拍触发系统');
                    })
                    this.systemData = res;
                    //整合硬件注册数据
                    let treeData = this.generateTreeData(res);
                    this.treeData = treeData;

                    // 数据加载完成后恢复状态
                    await this.$nextTick();

                    // 处理硬件注册树状态
                    const savedTreeState = JSON.parse(localStorage.getItem('hardwareTreeState') || '{}');
                    if (savedTreeState.currentNodeId && this.$refs.deviveTree) {
                        // 确保树已经渲染
                        // 先展开根节点
                        const rootNode = this.$refs.deviveTree.getNode(1); // 使用固定的根节点ID 1
                        if (rootNode) {
                            rootNode.expand();
                        }
                        // 最后设置当前选中节点
                        this.$refs.deviveTree.setCurrentKey(savedTreeState.currentNodeId);

                        // 恢复路由，使用 replace 而不是 push 来避免导航错误
                        if (savedTreeState.route && this.$route.fullPath !== savedTreeState.route) {
                            this.$router.replace(savedTreeState.route);
                        }
                    }

                    // 工作配置自动选中逻辑 - 需要更加谨慎
                    if (this.$route.path.includes('/workflowConfig/index')) {
                        // 当前路由中的工作配置ID和其他标记
                        const currentId = this.$route.query.id;
                        const isNewConfigAction = this.$route.query.newConfig === 'true';

                        // 如果是新增配置操作，不执行自动选中逻辑
                        if (isNewConfigAction && currentId === '0') {
                            console.log('initData: 新增配置操作，跳过自动选中逻辑');
                            return Promise.resolve(true);
                        }

                        // 如果用户正在切换配置（有manualSwitch标记）或者已有配置ID，不干预
                        if (this.$route.query.manualSwitch === 'true' || (currentId && currentId !== '0')) {
                            return Promise.resolve(true);
                        }

                        // 只在以下情况执行自动选中:
                        // 1. 没有当前配置ID
                        // 2. 配置列表不为空
                        // 3. 不是新增配置操作
                        if ((!currentId || currentId === '0') && this.configList.length > 0 && !isNewConfigAction) {
                            const firstConfig = this.configList[0];
                            console.log('initData: 自动选中第一个工作配置:', firstConfig.name);

                            // 导航到第一个配置的详情页面，使用replace避免历史堆积
                            this.$router.replace({
                                path: '/workflowConfig/index',
                                query: {
                                    id: firstConfig.id,
                                    name: firstConfig.name,
                                    StorId: `${Date.now()}-${firstConfig.id}`
                                }
                            });
                        }
                    }
                }

                return Promise.resolve(true); // 成功完成初始化
            } catch (error) {
                console.error('初始化数据失败:', error);
                return Promise.reject(error); // 初始化失败
            }
        },
        //处理硬件注册数据方法
        generateTreeData(arr) {
            // 初始化 treeData 结构
            let treeData = [{
                id: 1,
                label: '飞拍组',
                children: []
            }];

            // 遍历 arr 数组，为每个元素创建对应的子树结构
            arr.forEach(item => {
                // 创建飞拍子节点
                let feipaiNode = {
                    label: `飞拍(${item.number})`,
                    id: item.id,
                    number: item.number,
                    port: item.port,
                    children: [
                        { label: '相机', id: 2 },
                        { label: '光源', id: 4 },
                        { label: '工位', id: 6 },
                        { label: '电机', id: 8 },
                        { label: '电磁阀', id: 10 },
                        { label: '上料器', id: 12 },
                        { label: '急停、气压', id: 14 },
                        { label: '三色灯', id: 16 },
                    ]
                };

                // 将飞拍子节点添加到飞拍组的 children 中
                treeData[0].children.push(feipaiNode);
            });

            return treeData;
        },
        // 新增工作配置 
        addWorkConfig: _.debounce(async function () {

            // 检查是否已存在id为0的配置
            const existingNewConfig = this.configList.find(config => config.id === 0);

            if (existingNewConfig) {
                // 如果已存在，提示用户
                this.$message.warning('当前有正在新增的工作配置，请勿重复添加！');
                return;
            }
            // 如果不存在，则添加新配置
            const newConfig = {
                id: 0,
                name: '未命名工作配置'
            };
            this.configList.unshift(newConfig);

            // 添加一个特殊标记newConfig=true，用于区分是新建配置而不是自动选择第一个
            this.$router.push(`/workflowConfig/index?id=${newConfig.id}&name=${newConfig.name}&newConfig=true&time=${Date.now()}`);
        }, 300),
        //新增飞拍
        addDevice() {
            let idIndex = 0;
            const newDevice = {
                label: `飞拍(${this.newNumber})`,
                id: idIndex,
                number: "未配置",
                port: "未配置",
                children: [{
                    label: '相机',
                    id: idIndex += 4,
                },
                {
                    label: '光源',
                    id: idIndex += 4,
                },
                {
                    label: '工位',
                    id: idIndex += 4,
                },
                {
                    label: '电机',
                    id: idIndex += 4,
                },
                {
                    label: '电磁阀',
                    id: idIndex += 4,
                },
                {
                    label: '上料器',
                    id: idIndex += 4,
                },
                {
                    label: '急停、气压',
                    id: idIndex += 4,
                },
                {
                    label: '三色灯',
                    id: idIndex += 4,
                },
                ],
            };
            this.treeData[0].children.unshift(newDevice);
            this.$nextTick(() => {
                this.$refs.deviveTree.getNode(this.treeData[0].id).expand();
                this.$refs.deviveTree.setCurrentKey(newDevice.id);
            })
            this.$router.push(`/workflowConfig/register?id=${newDevice.id}&number=${newDevice.number}&port=${newDevice.port}`); // 路由跳转
        },
        //点击节点事件
        handleNodeClick(node) {
            let route = '';
            let parentNodeId = null;

            if (node.children && node.label !== '飞拍组') {
                route = `/workflowConfig/register?id=${node.id}&number=${node.number}&port=${node.port}`;
                if (this.$route.fullPath !== route) {
                    this.$router.push(route);
                }
            } else {
                let parentData = this.$refs.deviveTree.getNode(node).parent.data;
                if (parentData.id !== 0) {
                    parentNodeId = parentData.id;
                    switch (node.label) {
                        case '相机':
                            route = `/workflowConfig/camera?id=${parentData.id}`;
                            break;
                        case '光源':
                            route = `/workflowConfig/light?id=${parentData.id}`;
                            break;
                        case '工位':
                            route = `/workflowConfig/station?id=${parentData.id}`;
                            break;
                        case '电机':
                            route = `/workflowConfig/electric?id=${parentData.id}`;
                            break;
                        case '电磁阀':
                            route = `/workflowConfig/solenoid?id=${parentData.id}`;
                            break;
                        case '上料器':
                            route = `/workflowConfig/feeder?id=${parentData.id}`;
                            break;
                        case '急停、气压':
                            route = `/workflowConfig/stop?id=${parentData.id}`;
                            break;
                        case '三色灯':
                            route = `/workflowConfig/triColor?id=${parentData.id}`;
                            break;
                    }
                    if (this.$route.fullPath !== route) {
                        this.$router.push(route);
                    }
                }
            }

            // 保存当前节点状态和路由信息
            localStorage.setItem('hardwareTreeState', JSON.stringify({
                currentNodeId: node.id,
                parentNodeId: parentNodeId,
                route: route
            }));
        },
        //显示右键菜单
        showContextMenu(event, item) {
            this.contextMenuVisible = true;
            this.contextMenuX = event.clientX;
            this.contextMenuY = event.clientY;
            this.selectedItem = item;
            // 添加全局点击监听
            document.addEventListener('click', this.handleClickOutside);
        },
        //隐藏右键菜单
        hideContextMenu() {
            this.contextMenuVisible = false;
            this.selectedItem = null;
            // 移除全局点击监听
            document.removeEventListener('click', this.handleClickOutside);
        },
        // 新增处理全局点击的方法
        handleClickOutside(event) {
            const contextMenu = document.querySelector('.context-menu');
            if (contextMenu && !contextMenu.contains(event.target)) {
                this.hideContextMenu();
            }
        },
        //复制配置  
        copyConfig(value) {
            cloneWorkFlow({ id: value.id }).then(res => {
                this.$message({
                    type: 'success',
                    message: `复制成功!`
                });

                // 复制成功后获取最新的配置列表
                getWorkConfigs().then((data) => {
                    this.configList = data || [];

                    // 只有当前在工作配置相关页面时，才执行自动选中逻辑
                    if (this.$route.path.includes('/workflowConfig/index') && this.configList.length > 0) {
                        // 复制时应该优先选中新复制的配置（通常是列表中的第一个）
                        const firstConfig = this.configList[0];
                        console.log('复制后自动选中第一个工作配置:', firstConfig.name);

                        // 导航到第一个配置的详情页面 - 使用 replace 而不是 push
                        this.$router.replace({
                            path: '/workflowConfig/index',
                            query: {
                                id: firstConfig.id,
                                name: firstConfig.name,
                                StorId: `${Date.now()}-${firstConfig.id}`,
                                // 不添加 manualSwitch 标记，允许自动选中逻辑
                            }
                        });

                        // 更新选中状态
                        localStorage.setItem('selectedWorkConfig', JSON.stringify({
                            id: firstConfig.id,
                            name: firstConfig.name
                        }));
                    }
                });
            })
        },
        // 判断菜单项是否应该被激活
        isItemActive(item) {
            // 获取当前路由信息
            const currentId = this.$route.query.id;
            const currentName = this.$route.query.name;

            // 如果当前路由不是工作配置页面，则不激活任何项
            if (!this.$route.path.includes('/workflowConfig/index')) {
                return false;
            }

            // 对于ID为0的新建项，同时匹配ID和name
            if (item.id === 0 && currentId === '0') {
                return item.name === currentName;
            }

            // 其他情况只匹配ID
            return item.id.toString() === currentId;
        },
        //删除配置
        deleteConfig(value, index) {
            this.$confirm('要删除该条配置流程?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                getDelete(value.id).then(res => {
                    this.$message({
                        type: 'success',
                        message: `删除成功!`
                    });

                    // 从列表中移除当前项
                    this.configList.splice(index, 1);

                    // 如果还有配置项，自动选中第一个配置
                    if (this.configList.length > 0) {
                        const firstConfig = this.configList[0];
                        // 使用 replace 而不是 push，以避免在历史记录中堆积
                        this.$router.replace({
                            path: '/workflowConfig/index',
                            query: {
                                id: firstConfig.id,
                                name: firstConfig.name,
                                StorId: `${Date.now()}-${firstConfig.id}`,
                                // 不添加 manualSwitch 标记，允许自动选中逻辑
                            }
                        });
                    } else {
                        // 如果没有配置项了，显示空状态
                        this.$router.replace({
                            path: '/workflowConfig/index',
                            query: { delete: true, time: Date.now() }
                        });
                    }

                    // 清空之前的数据
                    this.$sessionStorage.clear();
                    this.$sessionStorage.removeItem('workflowData');
                })
            });
        },
        // 新增方法，根据用户权限更新导航可见性
        updateMenuPermissions() {
            const userPermissions = this.$store.state.applicationInfo.userPermissions;
            const navVisibility = this.$store.state.settings.navigationVisibility;

            // 如果有用户权限设置，优先使用用户权限
            if (userPermissions) {
                this.showHardwareReg = userPermissions.showHardwareReg;
                this.showSoftwareReg = userPermissions.showSoftwareReg;
                this.showTouchSystem = userPermissions.showTouchSystem;
            } else {
                // 否则使用全局导航可见性设置
                this.showHardwareReg = navVisibility && navVisibility.hardwareReg;
                this.showSoftwareReg = navVisibility && navVisibility.softwareReg;
                this.showTouchSystem = navVisibility && navVisibility.touchSystem;
            }
        },
    },
    beforeDestroy() {
        this.$baseEventBus.$off('Bus_delete');
        // 清除硬件树状态缓存
        localStorage.removeItem('hardwareTreeState');
        // 添加移除全局点击监听器
        document.removeEventListener('click', this.handleClickOutside);
    }
}
</script>

<style lang="scss">
.nav-container {
    background: #f0f0f0;
    padding: 0 10px;

    .box {
        width: 100%;

        .itemClass {
            display: inline-block;
            max-width: 107px;
            min-width: 107px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #515C71;
        }

        .context-menu {
            position: fixed;
            background: #fff;
            border: 1px solid #e4e7ed;
            border-radius: 4px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
            padding: 5px 0;
            z-index: 2000;
        }

        .menu-item {
            padding: 0px 30px;
            height: 40px;
            line-height: 40px;
            cursor: pointer;
            font-size: 14px;
            color: #606266;
        }

        .menu-item:hover {
            background: #f5f7fa;
            color: #1f2326;
            font-weight: 900;
            font-size: 14px;
        }

        .el-col {
            .el-menu {
                background: #f0f0f0;
                border-right: 0;

                .el-menu {
                    background: #fff;
                    border-radius: 10px;

                    .el-menu-item-group {
                        .el-menu-item-group__title {
                            padding: 0px;
                        }

                        .el-menu-item {
                            text-align: center;
                            padding: 0 !important;
                            min-width: 0px !important;
                            border-bottom: 1px solid #f5f5f5;

                            &:hover {
                                color: #38445B;
                                background-color: #f3f3f3;
                            }

                            &:focus {
                                color: #38445B !important;
                                font-weight: 900;
                                font-size: 15px;
                                background-color: #f3f3f3 !important;
                            }
                        }

                        // .el-menu-item.is-active,
                        // .el-menu .el-menu-item.is-active,
                        // .el-menu-item.is-active-custom {
                        //     color: #38445B !important;
                        //     font-weight: 900;
                        //     font-size: 15px;
                        //     background-color: #f3f3f3 !important;
                        // }

                        // .el-menu-item.is-active:hover,
                        // .el-menu .el-menu-item.is-active:hover,
                        // .el-menu-item.is-active-custom:hover {
                        //     background-color: #f3f3f3;
                        //     color: #38445B;
                        // }
                        .el-menu,
                        .el-menu-item.is-active-custom {
                            color: #38445B !important;
                            font-weight: 900;
                            font-size: 15px;
                            background-color: #f3f3f3 !important;
                        }

                        .el-menu,
                        .el-menu-item.is-active-custom:hover {
                            background-color: #f3f3f3;
                            color: #38445B;
                        }
                    }
                }
            }

            .el-tree {
                .el-tree-node__content {
                    height: 42px;
                    color: #515C71;
                    font-size: 15px;

                    .label-class {

                        i {
                            top: 5px;
                        }
                    }
                }

                .el-tree-node.is-current>.el-tree-node__content {
                    background-color: #f3f3f3 !important;
                    color: #38445B;
                    font-weight: 900;
                    font-size: 17px !important;
                }
            }
        }

        .el-submenu__title {
            text-align: center;

            .el-submenu__icon-arrow {
                display: none !important;
            }
        }

        .navBox {
            width: 192px;
            margin: 10px 0;
            border-radius: 10px;
            background: #fff;

            .nav-configTitle {
                color: #cb9953;
                font-weight: 900;
                font-size: 18px;
            }

            .icon-lbzntianjia {
                position: absolute;
                right: 10px;
                font-size: 32px !important;
            }

            .nav-resgisterTitle {
                color: #526c26;
                font-weight: 900;
                font-size: 18px;
            }

            .nav-systemTitle {
                color: #bd9074;
                font-weight: 900;
                font-size: 18px;
            }

            .nav-softwareTitle {
                color: #ce7f84;
                font-weight: 900;
                font-size: 18px;
            }

            .navbox-children {
                // width: 192px;
                height: calc(100vh - 347px);
                max-height: calc(100vh - 347px);
                overflow-y: auto;
                border-radius: 0px 0px 10px 10px;
                border-top: 2px solid;

                .search-class {
                    padding: 10px;
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    position: relative;

                    .el-input {
                        margin-right: 35px;
                    }
                }

                .emptyList-class {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #b4b4b4;
                    margin-top: 20px;
                }
            }
        }

        .notconfig-menu {

            .el-menu-item.is-active,
            .el-menu .el-menu-item.is-active {
                color: #38445B !important;
                font-weight: 900;
                font-size: 15px;
                background-color: #f3f3f3 !important;
            }

            .el-menu-item.is-active:hover,
            .el-menu .el-menu-item.is-active:hover {
                background-color: #f3f3f3;
                color: #38445B;
            }
        }

        .navInput {
            width: 50%;
        }

        .navBtn {
            display: inline-block;
            width: 30px;
            height: 30px;
            line-height: 30px;
            background: #FFB145;
            text-align: center;
            border-radius: 2px;
            color: #FFFFFF;
            font-size: 26px;
            cursor: pointer;
        }

        a {
            text-decoration: none;
        }

        .router-link-active {
            text-decoration: none;
        }

        .config-item {
            position: relative;

            .more-icon {
                display: none;
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%) rotate(90deg) !important;
            }

            &:hover {
                .more-icon {
                    display: inline-block;
                }
            }
        }
    }
}
</style>