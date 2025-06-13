<template>
    <div class="iBrain-module">
        <div class="iBrain-module-title" v-if="title" :class="{ 'border' : showBorder}">{{title}}</div>
        <div class="iBrain-module-container">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'iBrain-module',
    props: {
        title: {
            type: String,
            default: ''
        },
        showBorder: {
            type: Boolean,
            default: true
        }
    }
}
</script>

<style lang="scss" scoped>
    .iBrain-module{
        background-color: #fff;
        padding: 0 20px;

        & + .iBrain-module {
            border-top: 5px solid #f5f5f5;
        }

        .iBrain-module-title{
            font-weight: 500;
            font-style: normal;
            font-size: 16px;
            line-height: 40px;

            &.border{
                border-bottom: 1px solid #dcdcdc;
            }
        }
        .iBrain-module-container{
            padding: 10px 0;

            .el-form{
                margin-top: 10px;

                &:first-child{
                    margin-top: 0;
                }
            }
        }
    }
</style>
