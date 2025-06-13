<template>
    <div class="iBrain-query-container">
        <div class="iBrain-query-head">
            <span class="title">
                | 条件搜索
            </span>
        </div>
        <transition name="fade">
            <div class="iBrain-query-inner" v-show="show">
                <slot></slot>
            </div>
        </transition>
    </div>
</template>
<script>
export default {
    name: 'iBrain-query-container',
    data() {
        return {
            show: true,
        }
    },
    props: {
    },
    watch: {
    },
    computed: {
    },
    methods: {
        init() {
        }
    },
    destroyed() {
    },
    mounted() {
        this.init()
    }
}
</script>
<style lang="scss" scoped>
@import '@/styles/boxflex.scss';

.iBrain-query-container {
    background-color: #fff;

    .iBrain-query-head {
        padding: 0 20px;
        height: 50px;
        @include dis_flex;
        @include align-items;

        .title {
            line-height: 50px;
            font-size: 16px;
            font-weight: 500;
        }

        .more {
            margin-left: 10px;
            text-align: center;
            line-height: 22px;
            font-size: 14px;
            color: #178fd2;
            cursor: pointer;
        }
    }

    .iBrain-query-inner {
        padding: 10px 20px 10px;

        ::v-deep .iBrain-query {
            margin: 10px 0 0;
        }

        ::v-deep .el-form-item {
            margin-bottom: 10px !important;
        }
    }
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: all .15s;
    -moz-transition: all .15s;
    -webkit-transition: all .15s;
}

.fade-enter,
.fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}
</style>
