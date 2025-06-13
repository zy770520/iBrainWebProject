<template>
    <el-container class="iBrain-main">
        <el-aside class="iBrain-main-aside" :width="showAside ? asideWidth : '40px'" v-if="$slots.aside">
            <div class="aside-head" v-if="showAside">
                <span class="aside-title">{{ asideTitle }}</span>
                <span class="aside-icon" @click="changShow">
                    <i class="el-icon-s-fold"></i>
                </span>
            </div>
            <div class="aside-nav" @click="changShow" v-else>
                <span class="aside-icon">
                    <i class="el-icon-s-unfold"></i>
                </span>
                <span class="aside-title">{{ asideTitle }}</span>
            </div>
            <slot name="aside" v-if="showAside"></slot>
        </el-aside>

        <el-main class="iBrain-main-container">
            <slot></slot>
        </el-main>
    </el-container>
</template>

<script>
export default {
    name: 'iBrain-main',
    data() {
        return {
            showAside: true
        };
    },
    props: {
        value: {
            type: Boolean,
            default: true
        },
        asideTitle: {
            type: String,
            default: '预算项目'
        },
        asideWidth: {
            type: String,
            default: '20%'
        }
    },
    watch: {
        value(val) {
            this.showAside = val
        },
        showAside(val) {
            this.$emit('input', val)
        }
    },
    mounted() {

    },
    methods: {
        changShow() {
            this.showAside = !this.showAside
            this.$emit('changeShow', this.showAside)
        }
    },
};
</script>

<style lang="scss" scoped>
@import '@/styles/boxflex.scss';

.iBrain-main {
    width: 100%;

    .iBrain-main-aside {
        padding: 0;
        background-color: #fff;
        height: 100%;
        @include dis_flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        overflow: hidden;

        &::-webkit-scrollbar {
            width: 13px;
            height: 13px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.4);
            background-clip: padding-box;
            border: 3px solid transparent;
            border-radius: 7px;
        }

        &::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0, 0, 0, 0.5);
        }

        &::-webkit-scrollbar-track {
            background-color: transparent;
        }

        &::-webkit-scrollbar-track:hover {
            background-color: #f8fafc;
        }

        .iBrain-tree {
            @include boxflex(1);
        }

        .aside-head {
            padding: 0 0 10px;
            line-height: 20px;
            height: 32px;
            line-height: 32px;
            @include dis_flex;

            .aside-title {
                font-weight: bold;
                @include boxflex(1);
            }

            .aside-icon {
                font-size: 18px;
                color: #333;
                color: #178fd2;
                cursor: pointer;
            }
        }

        .aside-nav {
            padding: 10px 0;
            line-height: 20px;
            border: 1px solid #e6e6e6;
            border-radius: 2px;
            cursor: pointer;

            .aside-title {
                display: block;
                padding: 0 10px;
                text-align: center;
                font-weight: bold;
                @include boxflex(1);
            }

            .aside-icon {
                display: block;
                font-size: 18px;
                color: #333;
                color: #178fd2;
                text-align: center;
            }
        }
    }

    .iBrain-main-container {
        position: relative;
        padding: 0;
        margin: 0;
        margin-left: 10px;
        height: 100%;
        background-color: #fff;
        @include dis_flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        overflow: hidden;

        .el-main {
            padding: 0;
        }

        ::v-deep .el-table__body-wrapper {
            overflow: auto;
        }
    }
}
</style>