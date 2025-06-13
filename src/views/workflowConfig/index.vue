<template>
    <div>
        <div v-if="!delBol">
            <div class="workflowConfig-layout" :class="{ 'locked': isLocked && configId > 0 }">
                <div class="workFlow">
                    <div class="lock-btn" v-if="configId > 0">
                        <el-tooltip effect="dark" :content="isLocked ? '被锁定，用来防止意外修改页面，点击后可编辑' : '已解锁，用来修改页面，点击后可锁定'"
                            placement="bottom">
                            <el-button type="text" :disabled="isEnableLocked" @click="toggleLock" class="lock-button">
                                <i :class="['lock-icon', isLocked ? 'el-icon-lock' : 'el-icon-unlock']"></i>
                                {{ isLocked ? '页面已锁定' : '页面未锁定' }}
                            </el-button>
                        </el-tooltip>
                    </div>
                    <workFlow ref="workFlowRef" @flowInfo="setConfigFlowInfo" @clickExecuteHeader="clickExecuteHeader"
                        @clickHardwareLink="clickHardwareLink" @isEnableExecute="isEnableExecute"
                        @saveWorkFlowData="saveWorkFlowData" @flow="setFlow" @delWorkFlow="delWorkFlow"
                        @validateConfigs="validateConfigs" @updateWorkFlowName="updateWorkFlowName"
                        @isCurrentConfigLock="isCurrentConfigLock"></workFlow>
                </div>
                <div class="config-layout">
                    <configLayout v-if="!btnExecute" ref="configLayoutRef">
                    </configLayout>
                    <excuteMonitorView v-else-if="btnExecute && type == 'Monitor'" ref="excuteRef"></excuteMonitorView>
                    <excuteExecutorView v-else-if="btnExecute && type == 'Quality' && !hardwareType" ref="excuteRef">
                    </excuteExecutorView>
                    <noMaterialView ref="materialRef"
                        v-else-if="btnExecute && type == 'Quality' && hardwareType == 'noMaterial'"></noMaterialView>
                    <!-- <motorLinkView ref="motorRef"
                        v-else-if="btnExecute && type == 'Quality' && hardwareType == 'motorLink'"></motorLinkView> -->
                </div>
            </div>
        </div>
        <div v-else style="width: 100%;">
            <el-empty description="请选择一条配置流程"></el-empty>
        </div>
    </div>
</template>

<script>
import workFlow from './workflow.vue';
import configLayout from './config.vue';
import excuteMonitorView from './components/execute/monitor.vue'
import excuteExecutorView from './components/execute/executor.vue'
import noMaterialView from './components/hardware/noMaterial.vue'
// import motorLinkView from './components/hardware/motorLink.vue'
import { workFlowSave, getEecutorsList, getWorkConfigs, checkJsCode } from '@/api/workflowConfig.js'

export default {
    name: 'workflowConfig',
    components: {
        workFlow, configLayout, excuteMonitorView, excuteExecutorView, noMaterialView,
        // motorLinkView
    },
    data() {
        return {
            delBol: this.$store.state.applicationInfo.delBol,
            flow: {},
            objinfo: {},
            workInfo: {
                id: 0,
                name: '',
                batch: '',
            },
            btnExecute: false,
            type: 'Monitor',    //Monitor,Quality
            isLocked: true,
            isEnableLocked: false,
            configId: null,
            initialFlow: null, // 添加初始值存储
            hasChanges: true, // 添加数据变更标记
            hardwareType: null,
        }
    },
    watch: {
        // 监听 flow 的变化
        flow: {
            handler(newVal) {
                console.log("🚀 ~ handler ~ 监听flow的变化newVal:", JSON.parse(JSON.stringify(newVal)))
                console.log('🚀 ~ handler ~ this.initialFlow:', JSON.parse(JSON.stringify(this.initialFlow)));
                if (!this.initialFlow) return;

                // 获取两个对象共同的字段并比较值
                const compareFields = (obj1, obj2, path = '') => {
                    // 1. 添加更详细的日志，帮助定位问题
                    if (path === 'root') {
                        console.log('比较开始，路径:', path);
                    }

                    // 2. 增强数据类型处理
                    if (obj1 === obj2) return true;

                    // 3. 改进数值比较逻辑
                    if ((typeof obj1 === 'number' || !isNaN(Number(obj1))) &&
                        (typeof obj2 === 'number' || !isNaN(Number(obj2)))) {
                        const num1 = Number(obj1);
                        const num2 = Number(obj2);
                        const equal = num1 === num2;
                        if (!equal) {
                            console.log(`数值不匹配 ${path}: ${num1} !== ${num2}`);
                        }
                        return equal;
                    }

                    // 4. 扩展需要忽略的字段列表
                    const ignoreFields = [
                        '_camera',
                        '_timeAnchor',
                        'activeIds',
                        'activeIndex',
                        'comFlowList',
                        '_minAreaActive',
                    ];

                    // 5. 改进对象比较逻辑
                    if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
                        const str1 = String(obj1);
                        const str2 = String(obj2);
                        const equal = str1 === str2;
                        if (!equal) {
                            console.log(`字符串不匹配 ${path}: ${str1} !== ${str2}`);
                        }
                        return equal;
                    }

                    // 6. 数组比较逻辑优化
                    if (Array.isArray(obj1)) {
                        if (!Array.isArray(obj2) || obj1.length !== obj2.length) {
                            console.log(`数组长度不一致 ${path}: ${obj1.length} !== ${obj2.length}`);
                            return false;
                        }
                        return obj1.every((item, index) => compareFields(item, obj2[index], `${path}[${index}]`));
                    }

                    // 7. 改进共同键的比较
                    const commonKeys = Object.keys(obj1).filter(key =>
                        Object.keys(obj2).includes(key) && !ignoreFields.includes(key)
                    );

                    for (const key of commonKeys) {
                        if (ignoreFields.includes(key)) continue;

                        // 特殊处理电机相关字段
                        if (key === 'motor') {
                            const motorFields = ['camera_move_motor', 'loading_motor', 'unloading_motor'];
                            for (const motorKey of motorFields) {
                                // 首先检查两个对象是否都有motor属性
                                if (typeof obj1[key] === 'object' && obj1[key] !== null &&
                                    typeof obj2[key] === 'object' && obj2[key] !== null) {

                                    // 检查motorKey是否在两个对象中都存在且不为null
                                    if (Object.prototype.hasOwnProperty.call(obj1[key], motorKey) &&
                                        Object.prototype.hasOwnProperty.call(obj2[key], motorKey) &&
                                        obj1[key][motorKey] !== null &&
                                        obj2[key][motorKey] !== null) {

                                        // 检查motor_id是否存在且不为空字符串
                                        if (Object.prototype.hasOwnProperty.call(obj1[key][motorKey], 'motor_id') &&
                                            Object.prototype.hasOwnProperty.call(obj2[key][motorKey], 'motor_id') &&
                                            obj1[key][motorKey].motor_id &&
                                            obj2[key][motorKey].motor_id) {

                                            // 只有当所有条件都满足时，才进行比较
                                            if (!compareFields(obj1[key][motorKey], obj2[key][motorKey], `${path}.${key}.${motorKey}`)) {
                                                return false;
                                            }
                                        }
                                    }
                                }
                            }
                            continue; // 跳过motor字段的常规比较
                        }

                        // 8. 特殊字段处理优化
                        if (['exposure_time', 'gain'].includes(key)) {
                            const val1 = Number(obj1[key] || 0);
                            const val2 = Number(obj2[key] || 0);
                            if (val1 !== val2 && !isNaN(val1) && !isNaN(val2)) {
                                console.log(`特殊字段不匹配 ${path}.${key}: ${val1} !== ${val2}`);
                                return false;
                            }
                            continue;
                        }

                        if (!compareFields(obj1[key], obj2[key], `${path}.${key}`)) {
                            return false;
                        }
                    }

                    return true;
                };

                // 比较并设置变更状态，忽略UI状态相关的变化
                const ignoreUIChanges = (oldObj, newObj) => {
                    // 创建深拷贝以避免修改原对象
                    const oldCopy = JSON.parse(JSON.stringify(oldObj));
                    const newCopy = JSON.parse(JSON.stringify(newObj));

                    // 移除UI状态相关字段
                    ['activeIds', 'activeIndex'].forEach(field => {
                        delete oldCopy[field];
                        delete newCopy[field];
                    });

                    // 如果有comFlowList，确保只比较实际参数
                    if (oldCopy.comFlowList && newCopy.comFlowList) {
                        oldCopy.comFlowList.forEach(item => {
                            // 保留state和step，移除list
                            if (item.list) delete item.list;
                        });

                        newCopy.comFlowList.forEach(item => {
                            // 保留state和step，移除list
                            if (item.list) delete item.list;
                        });
                    }

                    // 在workflow中处理特殊字段
                    if (oldCopy.workflow && newCopy.workflow) {
                        // 遍历每个工作流项
                        oldCopy.workflow.forEach((item, index) => {
                            // 确保对应的新工作流项存在
                            if (newCopy.workflow[index]) {
                                // 统一数值类型字段的格式
                                ['exposure_time', 'gain'].forEach(field => {
                                    if (item[field] !== undefined) {
                                        item[field] = Number(item[field]);
                                    }
                                    if (newCopy.workflow[index][field] !== undefined) {
                                        newCopy.workflow[index][field] = Number(newCopy.workflow[index][field]);
                                    }
                                });
                            }
                        });
                    }

                    const result = compareFields(oldCopy, newCopy, 'root');
                    console.log('----compareFields结果----', result);

                    return result;
                };

                this.hasChanges = ignoreUIChanges(this.initialFlow, newVal);
                console.log("🚀 ~ compareFields结果handler ~ this.hasChanges:", this.hasChanges)

            },
            deep: true,
        },
        '$route.query': {
            async handler(newQuery, oldQuery) {
                console.log('newQuery', newQuery);
                console.log('oldQuery', oldQuery);
                // 在工作配置之间切换时检查是否有未保存的更改
                if ((oldQuery && newQuery) && (oldQuery.id && newQuery.id) && (oldQuery.id !== newQuery.id)) {
                    console.log(23333);
                    //如果是新增工作配置，也需要使用通用的未保存更改检查方法
                    // if (newQuery.newConfig == 'true') {
                    //     //使用通用的未保存方法
                    //     await this.checkUnsavedChanges(result => {
                    //         if (result.proceed) {
                    //             // 用户选择保存或不保存，继续加载新的工作配置
                    //             this.loadWorkConfig(newQuery);
                    //         }
                    //     })
                    // }
                    // 如果是系统自动选择的第一个配置，且没有manualSwitch标记，直接加载
                    if (!newQuery.manualSwitch) {
                        this.loadWorkConfig(newQuery);
                        return;
                    }

                    // 暂存新的查询参数，以便在用户做出选择后使用
                    const pendingQuery = { ...newQuery };

                    // 清除manualSwitch标记，以便后续的路由操作不会带上这个标记
                    if (pendingQuery.manualSwitch) {
                        delete pendingQuery.manualSwitch;
                    }

                    // 使用通用的未保存更改检查方法
                    await this.checkUnsavedChanges(result => {
                        console.log(4545);
                        if (result.proceed) {
                            console.log('用户确认切换配置，加载新配置');
                            // 用户选择保存或不保存，继续加载新的工作配置
                            this.loadWorkConfig(pendingQuery);
                        } else {
                            console.log('用户取消切换配置，恢复到原配置');
                            // 用户取消或出错，恢复原查询参数
                            this.$router.replace({
                                path: this.$route.path,
                                query: oldQuery
                            });
                        }
                    });
                } else {
                    console.log(33545454);
                    // 没有未保存的更改或不是在配置之间切换，直接加载新的工作配置
                    this.loadWorkConfig(newQuery);
                }
            },
            immediate: true,
            deep: true
        }
    },
    created() {
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        if (window.history && window.history.pushState) {
            window.addEventListener('popstate', this.goBack, false);
        }
    },
    computed: {

    },
    mounted() {
    },
    beforeDestroy() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        window.removeEventListener('popstate', this.goBack, false);
    },
    methods: {
        handleBeforeUnload(event) {
            const message = '系统可能不会保存您所做的更改!';
            event.returnValue = message;
            return message;
        },
        goBack() {
            // 获取url历史记录
            if (confirm('系统可能不会保存您所做的更改!')) {
                window.removeEventListener('popstate', this.goBack, false);
                window.history.go(-1);
            } else {
                window.history.pushState('forward', null, '');
                window.history.forward(1);
            }
        },
        init(id) {
            console.log("🚀 ~ index----init ~ id:", id)
            // 设置配置ID和删除标志
            this.configId = id;
            this.delBol = false;

            // 检查是否是新建配置操作
            const isNewConfigAction = this.$route.query.newConfig === 'true';

            // 对于ID为0（新建）或非数字的情况，设为解锁状态；其他情况设为锁定状态
            const numId = parseInt(id);
            if (isNaN(numId) || numId === 0) {
                this.isLocked = false; // 新建时解锁，允许编辑

                if (isNewConfigAction) {
                    console.log("新建配置操作，初始化解锁状态");
                }
            } else {
                this.isLocked = true; // 已有配置锁定，防止意外编辑

                // 添加锁定状态提示（对于新建配置不显示提示）
                if (!isNewConfigAction) {
                    this.$message({
                        type: 'warning',
                        message: '页面已锁定'
                    });
                }
            }

            // 确保UI立即更新
            this.$forceUpdate();

            // 重置刷新标志
            this.$store.state.applicationInfo.menuWorkFlowRefresh = false;

            // 确保workInfo的name字段有值（避免工作流名称丢失）
            if (this.workInfo.name === '' && this.$route.query.name) {
                this.workInfo.name = this.$route.query.name;
            }

            // 在下一个DOM更新周期初始化工作流
            let that = this;
            this.$nextTick(() => {
                if (that.$refs.workFlowRef) {
                    // 确保工作流组件拿到正确的工作流名称
                    that.$refs.workFlowRef.init(id);
                } else {
                    console.warn('工作流组件引用不存在，可能还未渲染');

                    // 延迟尝试初始化
                    setTimeout(() => {
                        if (that.$refs.workFlowRef) {
                            that.$refs.workFlowRef.init(id);
                        } else {
                            console.error('工作流组件引用仍不存在，初始化失败');
                        }
                    }, 300);
                }
            });
        },
        //设置当前流程整体数据结构
        setFlow(flow) {
            console.log("🚀 ~ setFlow ~ flow:", flow)
            this.flow = flow;
            this.flow['id'] = this.workInfo['id'];
            this.flow['name'] = this.workInfo['name'];
            // this.flow['_lStorId'] = this.workInfo['lStorId'];

            // 创建深拷贝并排除UI状态相关字段
            const initialFlowCopy = JSON.parse(JSON.stringify(this.flow));
            // 移除UI状态相关字段
            ['activeIds', 'activeIndex'].forEach(field => {
                delete initialFlowCopy[field];
            });

            // 如果有comFlowList，确保只保存实际参数
            if (initialFlowCopy.comFlowList) {
                initialFlowCopy.comFlowList = initialFlowCopy.comFlowList.map(item => {
                    if (item.list) {
                        item.list = item.list.map(listItem => {
                            // 移除UI状态相关字段
                            const { active, ...rest } = listItem;
                            return rest;
                        });
                    }
                    return item;
                });
            }

            // 保存初始值的深拷贝
            this.initialFlow = initialFlowCopy;
            // 重置变更标记
            this.hasChanges = true;
        },
        //设置流程参数值配置
        setConfigFlowInfo(objinfo) {
            console.log("🚀 ~ setConfigFlowInfo ~ objinfo:", objinfo)
            this.objinfo = objinfo;
            this.btnExecute = false;
            let { comFlow, type } = objinfo;
            if (type == '') {
                this.$message.warning('请选择配置类型');
                return false;
            }
            this.type = type;
            this.$nextTick(() => {
                if (this.$refs.configLayoutRef) {
                    this.$refs.configLayoutRef.init(objinfo)
                }
            })
        },
        //点击执行按钮显示执行页面配置
        clickExecuteHeader(flowList) {
            this.btnExecute = true;
            // 重置硬件联动类型，确保切换到电磁阀视图
            this.hardwareType = null;
            this.$nextTick(() => {
                this.$refs.excuteRef.init(flowList)
            })
        },
        //点击无料/电机联动按钮显示无料/电机联动页面配置
        clickHardwareLink(data) {
            console.log("🚀 ~ clickHardwareLink ~ data:", data)
            this.btnExecute = true;
            this.hardwareType = data.type;
            let that = this;

            // 使用双重nextTick确保组件已挂载
            this.$nextTick(() => {
                // 第一个nextTick确保状态已更新，条件渲染已触发
                that.$nextTick(() => {
                    // 第二个nextTick确保组件已完全挂载
                    if (data.type === 'noMaterial' && that.$refs.materialRef) {
                        that.$refs.materialRef.init(data.flowList);
                    }
                    // else if (data.type === 'motorLink' && that.$refs.motorRef) {
                    //     that.$refs.motorRef.init(data.flowList);
                    // } else {
                    //     console.error(`无法初始化硬件联动组件: ${data.type}`);
                    // }
                });
            });
        },
        //启用/禁用工作流
        isEnableExecute(flowList) {
            console.log("🚀 ~ isEnableExecute ~ flowList:", flowList)
            this.$nextTick(() => {
                if (this.$refs.configLayoutRef) {
                    this.$refs.configLayoutRef.init(flowList)
                }
            })
        },
        //流程整体保存
        async saveWorkFlowData(flowObj) {
            let _flowObj = JSON.parse(JSON.stringify(flowObj));
            console.log("🚀 ~ saveWorkFlowData ~ _flowObj:", _flowObj)
            let postData = {}
            this.$store.state.applicationInfo.menuWorkFlowRefresh = false;
            try {
                if (_flowObj.executing && !_flowObj.executing.inner) {
                    console.log('走这里00000');
                    // 等待 getEecutorsList 执行完成
                    await this.$nextTick(() => {
                        this.getEecutorsList();
                    })
                } else {
                    if (this.$refs['excuteRef']) {
                        console.log('走这里11111');
                        const res = await this.$refs.excuteRef.configFormSubmit();
                        let { data } = res;
                        this.flow['executing'] = data;
                        _flowObj['executing'] = data;
                        let { id, name, batch, workflow, type, executing, alarm, motor } = JSON.parse(JSON.stringify(_flowObj));
                        if (executing && executing['type'] == 'Monitor') {
                            ['red', 'yellow', 'green', 'buzzer'].forEach(v => {
                                if (executing[v]) {
                                    if (executing[v]['default_state']['frequency'] !== '') {
                                        executing[v]['default_state']['frequency'] = parseInt(executing[v]['default_state']['frequency']);
                                        executing[v]['default_state']['state'] = 'Open';
                                    } else {
                                        executing[v]['default_state']['frequency'] = 0;
                                    }
                                    if (executing[v]['executing_state']['frequency'] !== '') {
                                        executing[v]['executing_state']['frequency'] = parseInt(executing[v]['executing_state']['frequency']);
                                    } else {
                                        executing[v]['executing_state']['frequency'] = 0;
                                    }
                                    if (executing[v]['executing_state']['limit'] !== '') {
                                        executing[v]['executing_state']['limit'] = `${executing[v]['executing_state']['limit']}ms`;
                                    } else {
                                        executing[v]['executing_state']['limit'] = null;
                                    }
                                    //频闪,定时频闪,定时点亮
                                    if (['Strobing', 'timerStrobing', 'timerOpen'].includes(executing[v]['executing_state']['state'])) {
                                        executing[v]['executing_state']['state'] = 'Open'
                                    }
                                }
                            })
                        }
                        if (executing && executing['type'] == 'Executor') {
                            executing.inner.forEach(item => {
                                delete item._executorObj;
                                delete item.ruleSetting;
                                item.priority = parseInt(item.priority);
                            })
                        }
                        if (motor) {
                            if (motor.camera_move_motor && motor.camera_move_motor.motor_id == '') {
                                console.log(111111111);
                                motor.camera_move_motor = null;
                            }
                            if (motor.loading_motor && motor.loading_motor.motor_id == '') {
                                motor.loading_motor = null;
                            }
                            if (motor.unloading_motor && motor.unloading_motor.motor_id == '') {
                                motor.unloading_motor = null;
                            }
                        }
                        workflow = this.integrationWorkflow(workflow);
                        postData = { id: parseInt(id), name, batch, workflow, type, executing, alarm, motor };
                        if (postData.type == 'Monitor') {
                            delete postData.executing;
                        }
                        return this.saveData(postData);
                    } else {
                        console.log('走这里22222');
                        //这里需要验证每个执行机构中的规则优先级是否唯一，以及自定义规则代码是否为空
                        try {
                            // 只有校验通过才继续执行
                            await this.validateExecutingRules();
                            if (type == 'Monitor') {
                                delete _flowObj.alarm;
                                delete _flowObj.motor;
                            }
                            let { id, name, batch, workflow, type, executing, alarm, motor } = JSON.parse(JSON.stringify(_flowObj));
                            //     // 如果是执行类型为Executor，则检查是否有新的电磁阀需要添加
                            console.log("🚀 ~ saveWorkFlowData ~ motor:", motor)
                            if (executing && executing['type'] == 'Executor') {
                                try {
                                    // 导入getEecutorsList函数
                                    const { getEecutorsList } = await import('@/api/workflowConfig.js');
                                    // 获取最新电磁阀列表
                                    const latestExecutors = await getEecutorsList();

                                    if (latestExecutors && latestExecutors.length > 0) {
                                        // 创建一个已存在的电磁阀ID集合
                                        const existingExecutorIds = new Set(
                                            executing.inner.map(item => item.executor_id)
                                        );

                                        // 遍历最新电磁阀列表，找出新增的电磁阀
                                        for (const executor of latestExecutors) {
                                            if (!existingExecutorIds.has(executor.id)) {
                                                console.log('添加新电磁阀:', executor.id);
                                                // 添加新电磁阀到executing.inner
                                                executing.inner.push({
                                                    executor_id: executor.id, // 电磁阀id
                                                    enable: false, // 是否启用
                                                    priority: parseInt(executor.slot.replace(/[^0-9]/g, '')), // 从slot中提取数字作为优先级
                                                    name: '全部合格',
                                                    description: '', // 默认规则描述为空
                                                    ruleSetting: 'Qualified', // 默认设置为全部合格
                                                    code: `var qualified = true;
                                                        for (var element of packets) {
                                                            if (element.result.camera_result !== "Qualified") {
                                                                qualified = false;
                                                                break;
                                                            }
                                                        }
                                                        qualified`, // 默认自定义代码为全部合格
                                                });
                                            }
                                        }
                                    }
                                } catch (error) {
                                    console.error('获取最新电磁阀列表失败:', error);
                                }

                                // 继续原有处理逻辑
                                executing.inner.forEach(item => {
                                    delete item._executorObj;
                                    delete item.ruleSetting;
                                    item.priority = parseInt(item.priority);
                                });
                            } else if (executing && executing['type'] == 'Monitor') {
                                ['red', 'yellow', 'green', 'buzzer'].forEach(v => {
                                    if (executing[v]) {
                                        if (executing[v]['default_state']['frequency'] !== '') {
                                            executing[v]['default_state']['frequency'] = parseInt(executing[v]['default_state']['frequency']);
                                            executing[v]['default_state']['state'] = 'Open';
                                        } else {
                                            executing[v]['default_state']['frequency'] = 0;
                                        }
                                        if (executing[v]['executing_state']['frequency'] !== '') {
                                            executing[v]['executing_state']['frequency'] = parseInt(executing[v]['executing_state']['frequency']);
                                        } else {
                                            executing[v]['executing_state']['frequency'] = 0;
                                        }
                                        if (executing[v]['executing_state']['limit'] !== '') {
                                            executing[v]['executing_state']['limit'] = `${executing[v]['executing_state']['limit']}ms`;
                                        } else {
                                            executing[v]['executing_state']['limit'] = null;
                                        }
                                        //频闪,定时频闪,定时点亮
                                        if (['Strobing', 'timerStrobing', 'timerOpen'].includes(executing[v]['executing_state']['state'])) {
                                            executing[v]['executing_state']['state'] = 'Open'
                                        }
                                    }
                                });
                            }
                            if (motor) {
                                if (motor.camera_move_motor && motor.camera_move_motor.motor_id == '') {
                                    console.log(111111111);
                                    motor.camera_move_motor = null;
                                }
                                if (motor.loading_motor && motor.loading_motor.motor_id == '') {
                                    motor.loading_motor = null;
                                }
                                if (motor.unloading_motor && motor.unloading_motor.motor_id == '') {
                                    motor.unloading_motor = null;
                                }
                            }
                            workflow = this.integrationWorkflow(workflow);
                            postData = { id: parseInt(id), name, batch, workflow, type, executing, alarm, motor };
                            console.log("🚀 ~ saveWorkFlowData ~ postData:", postData);
                            if (postData.type == 'Monitor') {
                                delete postData.executing;
                            }
                            return this.saveData(postData);
                        } catch (error) {
                            return Promise.reject(error);
                        }
                    }
                }
            }
            catch (error) {
                console.error('保存工作流数据失败:', error);
                this.$message.warning('保存工作流数据失败');
                return Promise.reject(error);
            }
        },
        saveData(postData) {
            console.log("🚀 ~ saveData ~ postData:", postData)
            const loading = this.$loading({
                lock: true,
                text: '数据提交中...',
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255, 255, 0.7)'
            });
            return workFlowSave(postData).then(res => {
                this.$message.success('配置保存成功!');

                // 创建深拷贝并排除UI状态相关字段
                const initialFlowCopy = JSON.parse(JSON.stringify(this.flow));
                // 移除UI状态相关字段
                ['activeIds', 'activeIndex'].forEach(field => {
                    delete initialFlowCopy[field];
                });

                // 如果有comFlowList，确保只保存实际参数
                if (initialFlowCopy.comFlowList) {
                    initialFlowCopy.comFlowList = initialFlowCopy.comFlowList.map(item => {
                        if (item.list) {
                            item.list = item.list.map(listItem => {
                                // 移除UI状态相关字段
                                const { active, ...rest } = listItem;
                                return rest;
                            });
                        }
                        return item;
                    });
                }

                // 保存成功后，更新初始值和变更标记
                this.initialFlow = initialFlowCopy;
                this.hasChanges = true;

                // 记录当前保存的ID
                const savedConfigId = parseInt(this.flow.id);
                const savedConfigName = this.flow.name;

                // 确保锁定状态为锁定
                this.isLocked = true;

                // 检查是否是新增配置操作
                const isNewConfigAction = this.$route.query.newConfig === 'true';

                // 如果是ID为0的新配置，需要特殊处理
                const isNewConfig = savedConfigId === 0;

                // 延迟关闭loading并触发刷新
                setTimeout(() => {
                    loading.close();

                    // 重要：触发菜单刷新以获取新的配置列表
                    this.$store.state.applicationInfo.menuWorkFlowRefresh = true;

                    // 如果是新配置，等待列表刷新后，手动初始化配置
                    if (isNewConfig) {
                        setTimeout(() => {
                            // 获取最新配置列表，查找刚保存的配置
                            getWorkConfigs().then(configs => {
                                if (configs && configs.length > 0) {
                                    // 尝试找到刚才保存的配置（通常会是第一个）
                                    const firstConfig = configs[0];

                                    // 确保工作配置名称不丢失
                                    if (firstConfig && savedConfigName) {
                                        firstConfig.name = savedConfigName;
                                    }

                                    // 如果当前路由与刚保存的配置不符，进行重定向
                                    if (this.$route.query.id !== firstConfig.id.toString()) {
                                        this.$nextTick(() => {
                                            console.log("重定向到新保存的配置:", firstConfig.name);

                                            // 保留原有的newConfig标记，如果存在的话
                                            const query = {
                                                id: firstConfig.id,
                                                name: firstConfig.name || "未命名工作配置",
                                                reloadAfterSave: 'true', // 标记这是保存后的重载
                                                StorId: `${Date.now()}-${firstConfig.id}`
                                            };

                                            // 如果原来有newConfig标记，保留它
                                            if (isNewConfigAction) {
                                                query.newConfig = 'true';
                                            }

                                            // 使用replace而不是push，避免在历史堆栈中创建多余记录
                                            this.$router.replace({
                                                path: '/workflowConfig/index',
                                                query
                                            });
                                        });
                                    } else {
                                        // 已经在正确的配置页面，只需要重新初始化
                                        this.$nextTick(() => {
                                            this.workInfo.name = firstConfig.name || savedConfigName || "未命名工作配置";
                                            this.isLocked = true;
                                            this.init(firstConfig.id);
                                        });
                                    }
                                }
                            });
                        }, 300); // 给菜单刷新一点时间
                    } else {
                        // 如果是编辑现有配置，重置锁定状态
                        this.isLocked = true;
                        this.$nextTick(() => {
                            console.log("重新初始化现有配置:", this.workInfo.name);
                            // 重新初始化当前配置，确保所有状态正确
                            this.init(savedConfigId);
                        });
                    }
                }, 300);

                return res;
            }).catch(error => {
                console.error('保存工作流数据失败:', error);
                this.$message.warning('配置保存失败!');
                loading.close();
                this.$store.state.applicationInfo.menuWorkFlowRefresh = false;
                return Promise.reject(error);
            }).finally(() => {
                // 确保loading被关闭
                setTimeout(() => {
                    if (loading) {
                        loading.close();
                    }
                }, 500);
            });
        },
        //获取执行配置列表
        getEecutorsList() {
            console.log('走这里55555');
            getEecutorsList().then(res => {
                let arr = {
                    "type": "Executor",
                    "inner": res.map(item => ({
                        executor_id: item.id,
                        enable: false,
                        priority: parseInt(item.slot.replace(/[^0-9]/g, '')), // 修改：将默认优先级设置为电磁阀slot
                        name: '全部合格',
                        description: '',
                        code: `var qualified = true;
                            for (var element of packets) {
                                if (element.result.camera_result !== "Qualified") {
                                    qualified = false;
                                    break;
                                }
                            }
                            qualified`, // 默认自定义代码为全部合格
                    }))
                };
                this.flow.executing = { ...arr };
                this.flow.id = parseInt(this.flow.id);
                this.flow.workflow = this.integrationWorkflow(this.flow.workflow);
                if (this.flow.type == 'Monitor') {
                    delete this.flow.executing;
                    delete this.flow.motor;
                    delete this.flow.alarm;
                }
                if (this.flow.type == 'Quality') {
                    let { motor } = JSON.parse(JSON.stringify(this.flow));
                    // 初始化执行机构
                    if (motor) {
                        if (this.flow.motor.camera_move_motor && this.flow.motor.camera_move_motor.motor_id == '') {
                            this.flow.motor.camera_move_motor = null;
                        }
                        if (this.flow.motor.loading_motor && this.flow.motor.loading_motor.motor_id == '') {
                            this.flow.motor.loading_motor = null;
                        }
                        if (this.flow.motor.unloading_motor && this.flow.motor.unloading_motor.motor_id == '') {
                            this.flow.motor.unloading_motor = null;
                        }
                    }
                }
                this.saveData(this.flow);
            })
        },
        //整合workflow
        integrationWorkflow(workflow) {
            console.log(3333);
            workflow.forEach((v, k) => {
                delete v['algorithm_type'];
                if (v['_timeAnchor']) {
                    localStorage.removeItem(v['_timeAnchor']);
                    delete workflow[k]['_timeAnchor'];
                }
                if (v['_camera']) {
                    delete workflow[k]['_camera'];
                }
                // 删除 _minAreaActive 属性，它只用于前端控制
                if (v['_minAreaActive'] !== undefined) {
                    delete workflow[k]['_minAreaActive'];
                }
                if (v['min_area']) {
                    workflow[k]['min_area'] = parseInt(v['min_area']);
                }
                // 确保exposure_time和gain是字符串格式
                if (v['exposure_time'] !== undefined) {
                    workflow[k]['exposure_time'] = String(v['exposure_time']);
                }
                if (v['gain'] !== undefined) {
                    workflow[k]['gain'] = String(v['gain']);
                }
                if (v['classes'] && v['classes']['classes'] && v['classes']['classes'].length > 0) {
                    v['classes']['classes'].forEach((cv, ck) => {
                        if (v['classes'].type == 'Stage') {
                            workflow[k]['classes']['classes'][ck]['parameter']['continuous'] = `${cv.parameter.continuous}ms`;
                        }
                        if (v['classes'].type == 'Surface') {
                            workflow[k]['classes']['classes'][ck]['parameter']['ratio'] = `${cv.parameter.ratio + ""}`;
                        }
                    })
                }
                if (v['lights'] && v.lights.length == 0) {
                    workflow[k]['lights'] = [];
                } else if (v['lights']) {
                    let lights = [];
                    v.lights.forEach((lv, lk) => {
                        lights.push({
                            // id: 0, //光源id 新增时传0 多条光源的时候也是0
                            // workflow_id: 0,
                            light_id: parseInt(lv['light_id'] || lv.id),
                            brightness: parseInt(lv.brightness),
                        })
                    })
                    workflow[k]['lights'] = lights;
                }
                if (v['classes'] && (v['classes'].type == 'Size' || v['classes'].type == 'Thick')) {
                    v['classes'] = this.parsingObjectFloatToString(v['classes']);
                }
            })
            return workflow;
        },
        //解析尺寸算法输入输出
        parsingObjectFloatToString(obj) {
            Object.keys(obj).map(index => {
                if (obj[index] instanceof Object) {
                    obj[index] = this.parsingObjectFloatToString(obj[index])
                } else {
                    if (index == 'value') {
                        if (typeof obj[index] == 'boolean') {
                            console.log('indexindexindex', obj[index])
                        } else {
                            obj[index] = `${obj[index]}`;
                        }
                    }
                }
            })
            return obj;
        },
        //删除流程配置----已失效
        delWorkFlow(bol) {
            this.delBol = true;
            this.$store.state.applicationInfo.menuWorkFlowRefresh = false;
            setTimeout(() => {
                this.$store.state.applicationInfo.menuWorkFlowRefresh = true;
            }, 200)
        },
        toggleLock() {
            this.isLocked = !this.isLocked;
            this.$message({
                type: 'warning',
                message: this.isLocked ? '页面已锁定' : '页面已解锁'
            });
        },
        // 添加校验方法
        async validateConfigs(callback) {
            try {
                //如果没有选择配置类型
                if (this.flow.type == '') {
                    this.$message.warning('请选择配置类型');
                    return false;
                }
                //如果没有选择批次
                if (this.flow.batch == '') {
                    this.$message.warning('请输入工作配置批次');
                    return false;
                }
                //如果没有选择模型或算法
                // if (this.flow.workflow[0].model_path == '' && !this.flow.workflow[0].hasOwnProperty('algorithm_id')) {
                //     this.$message.warning('没有选择模型或算法，无法保存工作配置！');
                //     return false;
                // }
                //如果工作配置名称与已有的工作配置名称重复
                // 获取所有工作配置并检查名称是否重复
                if (this.flow.name && this.flow.name.trim() !== '') {
                    try {
                        // 获取所有工作配置列表
                        const configsList = await getWorkConfigs();
                        // 过滤掉当前正在编辑的配置
                        const otherConfigs = configsList.filter(config => config.id !== parseInt(this.flow.id));
                        // 检查名称是否与其他配置重复
                        const isDuplicate = otherConfigs.some(config =>
                            config.name.trim().toLowerCase() === this.flow.name.trim().toLowerCase()
                        );

                        if (isDuplicate) {
                            this.$message.warning('工作配置名称与已有的工作配置名称重复');
                            return false;
                        }
                    } catch (error) {
                        console.error('获取工作配置列表失败:', error);
                        this.$message.warning('验证工作配置名称失败，请重试');
                        return false;
                    }
                }
                // 如果既没有 configLayout 组件又没有执行组件，则认为组件未初始化
                // if (!this.$refs.configLayoutRef && !this.$refs.excuteRef && !this.$refs.noMaterialRef && !this.$refs.lowSpeedAlarmRef) {
                //     this.$message.warning('配置组件未初始化');
                //     callback && callback(false);
                //     return false;
                // }
                // 保存当前激活节点信息，用于校验完后还原
                const currentActiveIds = this.$refs.workFlowRef.activeIds;
                const [parentIndex, originalIndex] = currentActiveIds.split('-');
                const comFlowList = this.flow.comFlowList;

                // 标记是否需要切换回相机配置页
                let needSwitchToCamera = false;

                // 当配置布局存在,当前选中节点不为"电机联动"时，校验【相机】【阈值】
                if (this.$refs.configLayoutRef && this.hardwareType !== 'motorLink') {
                    // 校验相机配置
                    const cameraComponent = this.$refs.configLayoutRef.$refs.cameraConfigRef;
                    if (!cameraComponent) {
                        console.log('相机组件不存在');
                        // 强制切换到相机节点并等待组件挂载
                        this.$refs.workFlowRef.getFlowItem(comFlowList[parentIndex].list[0], 0, parentIndex);
                        await this.$nextTick();
                    }

                    // 重新获取相机组件引用
                    const updatedCameraComponent = this.$refs.configLayoutRef.$refs.cameraConfigRef;
                    if (updatedCameraComponent && updatedCameraComponent.$refs.workflowForm) {
                        // 如果相机数据未初始化，则赋值当前工作流数据
                        if (!updatedCameraComponent.workflow) {
                            updatedCameraComponent.workflow = this.flow.workflow[parentIndex];
                        }
                        await this.$nextTick();
                        const cameraValid = await new Promise(resolve => {
                            updatedCameraComponent.$refs.workflowForm.validate(valid => {
                                resolve(valid);
                            });
                        });
                        if (!cameraValid) {
                            this.$message.warning('相机配置校验未通过，请检查');
                            needSwitchToCamera = true;
                            callback && callback(false);
                            return false;
                        }
                    }

                    // 校验阈值配置
                    if (!this.$refs.configLayoutRef.$refs.thresholdRef) {
                        this.$refs.workFlowRef.getFlowItem(comFlowList[parentIndex].list[2], 2, parentIndex);
                        await this.$nextTick();
                    }
                    const thresholdComponent = this.$refs.configLayoutRef.$refs.thresholdRef;
                    if (thresholdComponent && thresholdComponent.type === 2) {
                        let isValid = true;
                        if (thresholdComponent.form.algorithm_type === 'Ai') {
                            thresholdComponent.resClasses.forEach(item => {
                                if (item.name === '') {
                                    isValid = false;
                                }
                                switch (thresholdComponent.parameterIndex) {
                                    case 'Stage':
                                        if (item.parameter.continuous === '') {
                                            isValid = false;
                                        }
                                        break;
                                    case 'Speed':
                                        if (item.parameter.speed === null) {
                                            isValid = false;
                                        }
                                        break;
                                    case 'Surface':
                                        if (
                                            item.parameter.area === null ||
                                            item.parameter.area === 0 ||
                                            item.parameter.count === null ||
                                            item.parameter.length === null ||
                                            item.parameter.width === null ||
                                            item.parameter.ratio === undefined
                                        ) {
                                            isValid = false;
                                        } else {
                                            if (
                                                !Number.isInteger(item.parameter.area) ||
                                                !Number.isInteger(item.parameter.count) ||
                                                !Number.isInteger(item.parameter.length) ||
                                                !Number.isInteger(item.parameter.width)
                                            ) {
                                                isValid = false;
                                                this.$message.warning("请输入整数!");
                                            }
                                        }
                                        break;
                                }
                            });
                            if (!isValid) {
                                this.$message.warning('阈值配置校验未通过，请检查');
                                this.$refs.workFlowRef.getFlowItem(comFlowList[parentIndex].list[2], 2, parentIndex);
                                callback && callback(false);
                                return false;
                            }
                        }
                    }
                }

                // 校验执行机构配置（当执行组件存在时）
                if (this.$refs.excuteRef && this.$refs.excuteRef.configFormSubmit) {
                    await this.$nextTick();
                    const executeValid = await this.$refs.excuteRef.configFormSubmit();
                    if (!executeValid) {
                        this.$message.warning('执行机构配置校验未通过，请检查');
                        callback && callback(false);
                        return false;
                    }
                }

                // 如果需要切换到相机配置页，则切换
                if (needSwitchToCamera) {
                    this.$refs.workFlowRef.getFlowItem(comFlowList[parentIndex].list[0], 0, parentIndex);
                    return false;
                }

                // 恢复回原来激活的节点（仅在 configLayout 存在时恢复）
                if (this.$refs.configLayoutRef && this.hardwareType !== 'motorLink') {
                    this.$refs.workFlowRef.getFlowItem(
                        comFlowList[parentIndex].list[originalIndex],
                        parseInt(originalIndex),
                        parseInt(parentIndex)
                    );
                }

                callback && callback(true);
                return true;
            } catch (error) {
                console.error('配置校验时发生错误:', error);
                this.$message.warning('配置校验失败，请检查配置是否正确');
                callback && callback(false);
                return false;
            }
        },
        // 添加一个新方法用于加载工作配置
        loadWorkConfig(query) {
            let { id = 0, name = '', lStorId, reloadAfterSave, newConfig } = query;

            // 明确设置工作信息，包括ID和名称
            this.workInfo = { id, name };
            console.log(`加载工作配置: id=${id}, name=${name}, newConfig=${newConfig}`);

            // 新建配置操作特殊处理
            const isNewConfigAction = newConfig === 'true';

            // 查询最新配置信息 - 只对非新建操作进行查询和验证
            if (!isNewConfigAction) {
                getWorkConfigs().then((data) => {
                    // 根据id查找对应的工作流配置名称
                    if (data && data.length > 0) {
                        const config = data.find(item => item.id === Number(query.id));
                        if (config) {
                            // 更新工作配置名称
                            this.workInfo.name = config.name;
                            console.log("从API获取的工作配置名称:", config.name);
                        }
                    }

                    // 确保name不为空
                    if (!this.workInfo.name && name) {
                        this.workInfo.name = name;
                    }

                    // 确保有ID时初始化
                    if (id) {
                        this.$nextTick(() => {
                            this.init(id);
                        });
                    }
                }).catch(err => {
                    console.error("获取工作配置列表失败:", err);
                    // 发生错误时也尝试使用查询参数中的信息初始化
                    if (id) {
                        this.$nextTick(() => {
                            this.init(id);
                        });
                    }
                });
            } else {
                // 新建配置直接初始化，不需要查询API
                console.log("新建配置操作，直接初始化");
                if (id) {
                    this.$nextTick(() => {
                        this.init(id);
                    });
                }
            }

            let StorageFlowList = localStorage.getItem('flowList');
            if (StorageFlowList) {
                StorageFlowList = JSON.parse(StorageFlowList);
            }

            if (query.delete) {
                this.delBol = true;
            }
        },
        // 添加一个统一的检查未保存更改的方法
        async checkUnsavedChanges(callback) {
            console.log(1313);
            console.log('this.flow.id', this.flow.id);
            console.log('this.hasChanges', this.hasChanges);
            // 如果没有修改或者没有选择工作配置，直接继续
            if (!this.flow.id || this.hasChanges) {
                console.log('isWatchFlow123');
                callback({ proceed: true });
                return;
            } else {
                console.log('isWatchFlow456');
                try {
                    // 弹出确认框询问用户是否保存
                    const result = await this.$confirm('当前有正在编辑未保存的参数，是否进行保存？', '提示', {
                        confirmButtonText: '保存',
                        cancelButtonText: '不保存',
                        type: 'warning',
                        distinguishCancelAndClose: true,
                        closeOnClickModal: false
                    }).catch(action => action);

                    if (result === 'confirm') {
                        // 用户选择保存
                        try {
                            // 校验配置
                            const isValid = await new Promise(resolve => {
                                this.validateConfigs(valid => {
                                    resolve(valid);
                                });
                            });

                            if (!isValid) {
                                this.$message.warning('配置校验未通过，无法保存');
                                callback({ proceed: false, reason: 'validation-failed' });
                                return;
                            }

                            // 保存工作流数据
                            await this.saveWorkFlowData(this.flow);
                            callback({ proceed: true, saved: true });
                        } catch (error) {
                            console.error('保存过程发生错误:', error);
                            this.$message.warning('保存失败，将留在当前页面');
                            callback({ proceed: false, reason: 'save-failed' });
                        }
                    } else if (result === 'cancel') {
                        // 用户选择不保存，直接继续
                        callback({ proceed: true, saved: false });
                    } else if (result === 'close') {
                        // 用户点击X关闭对话框，也按不保存处理(继续操作)
                        callback({ proceed: true, saved: false });
                    } else {
                        // 用户关闭弹窗，留在当前页面
                        callback({ proceed: false, reason: 'user-cancelled' });
                    }
                } catch (error) {
                    console.error('检查未保存更改时发生错误:', error);
                    callback({ proceed: false, reason: 'error' });
                }
            }
        },
        //更新工作流名称
        updateWorkFlowName(name) {
            // 确保 flow 对象存在
            if (this.flow) {
                // 更新 flow 对象的名称
                this.flow.name = name;
                // 同时更新 workInfo 对象的名称，确保各处显示一致
                this.workInfo.name = name;
                // 标记数据已更改，需要保存
                this.hasChanges = false;
            }
        },
        // 验证执行机构规则
        async validateExecutingRules() {
            if (!this.flow.executing || !this.flow.executing.inner || this.flow.executing.inner.length === 0) {
                return true; // 没有需要验证的内容，直接返回成功
            }

            // 1. 检查规则优先级是否唯一
            const priorityMap = new Map();
            let hasDuplicatePriority = false;
            let duplicateItems = [];

            // 存储所有需要验证的代码检查promises
            const codeValidationPromises = [];

            for (const item of this.flow.executing.inner) {
                // 自动设置空优先级为执行机构ID
                if (!item.priority || item.priority.toString().trim() === '') {
                    item.priority = item.executor_id.toString();
                }

                const priority = Number(item.priority);
                if (!isNaN(priority)) {
                    if (priorityMap.has(priority)) {
                        hasDuplicatePriority = true;
                        duplicateItems.push({
                            name: `ID为${item.executor_id}的电磁阀`,
                            otherName: priorityMap.get(priority),
                            priority
                        });
                    } else {
                        priorityMap.set(priority, `ID为${item.executor_id}的电磁阀`);
                    }
                }

                // 2. 检查自定义规则代码是否为空
                if (!item.code || item.code.trim() === '') {
                    this.$message.warning(`ID为${item.executor_id}的电磁阀}的规则代码不能为空`);
                    throw new Error('规则代码不能为空');
                }

                // 3. 检查自定义规则代码的语法
                if (item.code && item.code.trim() !== '') {
                    try {
                        // 使用Function构造函数尝试解析代码，检查语法错误
                        // eslint-disable-next-line no-new-func
                        new Function('packets', item.code);
                    } catch (error) {
                        this.$message.warning(`ID为${item.executor_id}的电磁阀}的规则代码有语法错误`);
                        throw new Error('规则代码有语法错误');
                    }

                    // 添加代码验证Promise到待验证列表
                    if (item.ruleSetting === 'custom') {
                        const validationPromise = checkJsCode(item.code)
                            .catch(error => {
                                this.$message.warning(`ID为${item.executor_id}的电磁阀}的规则代码验证失败`);
                                throw new Error('规则代码验证失败');
                            });
                        codeValidationPromises.push(validationPromise);
                    }
                }
            }

            // 如果发现重复优先级，显示详细错误信息
            if (hasDuplicatePriority) {
                const errorMsg = duplicateItems.map(item =>
                    `${item.name}与${item.otherName}的规则优先级${item.priority}重复`
                ).join('；');
                this.$message.warning(`执行机构配置校验未通过: ${errorMsg}`);
                throw new Error('规则优先级重复');
            }

            // 等待所有代码验证完成
            if (codeValidationPromises.length > 0) {
                try {
                    await Promise.all(codeValidationPromises);
                    // 所有代码验证成功
                    console.log('所有规则代码验证通过');
                } catch (error) {
                    // 验证过程中已经显示了具体错误信息
                    throw error;
                }
            }

            return true; // 所有验证通过
        },
        // 锁定当前工作配置
        isCurrentConfigLock(value) {
            this.isEnableLocked = value;
        },
    },
    async beforeRouteLeave(to, from, next) {
        // 使用通用的未保存更改检查方法
        await this.checkUnsavedChanges(result => {
            if (result.proceed) {
                // 用户选择保存或不保存，继续导航
                next();
            } else {
                console.log('取消');
                // 用户取消或出错，停留在当前页面
                next(false);
            }
        });
    }
}
</script>
<style></style>
<style lang="scss" scoped>
.workflowConfig-layout {
    float: right;
    display: flex;
    width: calc(100% - 1.2rem);
    height: calc(100vh - 0.26rem);

    .workFlow {
        flex: 1;
        height: 100%;
        position: relative;

        .lock-button {
            color: #9a9999;
            font-size: 18px;
        }
    }

    .config-layout {
        width: 781px;
        height: 100%;
    }
}

.lock-btn {
    position: absolute;
    top: 20px;
    left: 0px;
    z-index: 1000;
}

.locked {
    pointer-events: none;
    opacity: 0.8;

    // 允许锁定按钮可以点击
    .lock-btn {
        pointer-events: auto;
    }
}
</style>
