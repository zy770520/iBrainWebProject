<template>
    <div class="box box3">
        <div class="header">
            <i v-if="isEdit" class="iconfont icon-lbznjianshao" style="color: #eb2c14;margin-left: auto;"
                @click="handleRemove"></i>
        </div>
        <!-- 如果isEdit是可编辑状态，则显示el-input,否则直接显示 -->
        <div v-if="isEdit" class="totalTxtCard">
            <!-- 如果isEdit是可编辑状态，则显示el-input,否则直接显示 -->
            <el-input v-model="sampleTxt" />
            <el-input v-model="caseTxt" />
        </div>
        <div v-else class="totalTxtCard">
            <span>{{ sampleTxt }}</span>
            <span>{{ caseTxt }}</span>
        </div>
    </div>
</template>
<script>
export default {
    name: 'TotalTxtCard',
    props: {
        isCallEventSource: {
            type: Boolean,
            default: () => false,
        },
        isEdit: {
            type: Boolean,
            default: () => false,
        },
    },
    watch: {
        isCallEventSource: {
            handler(value) {
                if (value) {
                    this.sampleTxt = '本案例样本数量：';
                    this.caseTxt = '3';
                }
            },
            deep: true,
            immediate: true
        },
    },
    data() {
        return {
            sampleTxt: '本案例样本数量：',
            caseTxt: '3',
        }
    },
    mounted() {
    },
    methods: {
        handleRemove() {
            this.$emit('remove');
        }
    }
}
</script>
<style lang="scss">
.totalTxtCard {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    span {
        &:nth-child(1) {
            font-size: 26px;
            font-weight: 900;
            color: #828181;
        }

        &:nth-child(2) {
            font-size: 52px;
            font-weight: 900;
            color: #ae2619;
        }
    }
}
</style>