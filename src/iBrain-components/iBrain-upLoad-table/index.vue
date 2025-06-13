<template>
    <div class="iBrain-upLoad-table">
        <div class="iBrain-upLoad-header" v-if="!disabled">
            <iBrain-button type="primary" @click="onShowUpLoad">{{ buttonText }}</iBrain-button>
        </div>
        <div class="iBrain-upLoad-container">
            <iBrain-table-auto :data="tableList">
                <el-table-column prop="FILE_NAME" label="文件名称" min-width="100" show-overflow-tooltip sortable>
                    <template slot-scope="scope">
                        <iBrain-link type="primary" @click.stop="onCheckWord(scope.row, scope.$index)">{{
                            scope.row.FILE_NAME
                            }}</iBrain-link>
                    </template>
                </el-table-column>
                <el-table-column prop="UPLOAD_DATE" label="上传时间" width="200" show-overflow-tooltip sortable />
                <el-table-column prop="CREATEDUSER" label="上传人" show-overflow-tooltip sortable width="100" />
                <el-table-column label="操作" align="center" width="130">
                    <template slot-scope="scope">
                        <iBrain-link type="primary" @click.stop="onDownload(scope.row, scope.$index)">下载</iBrain-link>
                        <iBrain-link v-if="!disabled" type="danger"
                            @click.stop="onDelete(scope.row, scope.$index)">删除</iBrain-link>
                    </template>
                </el-table-column>
            </iBrain-table-auto>
        </div>

        <el-dialog title="上传附件" class="iBrain-upLoad-dialog" :close-on-click-modal="false" append-to-body
            :visible.sync="visible" lock-scroll width="400px">
            <el-upload drag ref="upload" :action="URL" :data="params" :headers="headers" :disabled="uploadDisabled"
                :before-upload="beforeUpload" :on-success="onSuccess" :on-error="onError" :on-change="onChange"
                :http-request="onUpLoad" :file-list="fileList" :multiple="true" :auto-upload="false"
                accept="application/pdf,application/vnd.ms-excel,image/jpeg,image/png,
                                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,
                                application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                    <span v-if="!uploadDisabled">点击上传</span>
                    <span v-if="uploadDisabled">附件上传中.....</span>
                </div>
                <div class="el-upload__tip" slot="tip">
                    只能上传pdf、jpg、png、jpeg、txt、doc、xls、xlsx、docx文件,且不超过10M
                </div>
            </el-upload>

            <template slot="footer">
                <iBrain-button @click="onHideUpLoad">{{ $t('common.cancelButton') }}</iBrain-button>
                <iBrain-button type="primary" @click="onSubmit" :loading="uploadDisabled">
                    {{ $t('common.confirmButton') }}
                </iBrain-button>
            </template>
        </el-dialog>
        <iBrain-preview-picture v-if="pictureVisible" ref="picture" @close="pictureVisible = false" />
    </div>
</template>

<script>
// import {
//     getAllMsg
// } from '@/api/comprehensiveBudget/budgeting.js'
// import { uploadHTTP, uploadHTTPBudget, downloadFile, uploadFild } from '@/api/iBrain-baseDelete'
// import mixinUtil from '@/mixins/mixinUtil'
// import { cryptoAesData } from '@/utils/encrypt.js'

export default {
    name: 'iBrain-upLoad-table',
    components: {
    },
    mixins: [
        // mixinUtil
    ],
    data() {
        return {
            visible: false,
            tableList: [],
            fileList: [],
            fileListCopy: [],
            uploadDisabled: false,
            pictureVisible: false,
        }
    },
    props: {
        baseURL: {
            //附件上传路径前缀
            type: String,
            default: '',
        },
        uploadURL: {
            //附件上传路径
            type: String,
            default: '/budgeting/uploadFile',
        },
        downloadURL: {
            //附件模板下载路径
            type: String,
            default: '/segment/downloadFile',
        },
        previewURL: {
            //图片查看路径
            type: String,
            default: '/segment/image',
        },
        params: {
            //参数
            type: Object,
            default: () => { },
        },
        buttonText: {
            type: String,
            default: '附件上传'
        },
        disabled: {
            type: Boolean,
            default: false
        },
        documentId: {
            type: [String, Number],
            default: ''
        },
        saveType: {
            //保存模块类别
            type: String,
            default: '',
        },
    },
    computed: {
        URL() {
            return this.baseURL + this.uploadURL
        },
        downURL() {
            return this.baseURL + this.downloadURL
        },
        prevURL() {
            return this.baseURL + this.previewURL
        },
        headers() {
            const stampTime = this.$store.getters['user/stampTime']
            let time = ''
            if (stampTime) {
                time = new Date().getTime()
                time = time + stampTime
                let randomNumber = ''//随机数
                for (let i = 0; i < 6; i++) {
                    randomNumber = randomNumber + parseInt(Math.random() * 10)
                }
                time = time + '-' + randomNumber
                // time = cryptoAesData(time)
            }
            return {
                Authorization: `Bearer ${this.$store.state.user.accessToken}`,
                // 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                stamp: time
            }
        },
    },
    watch: {
        documentId(val, old) {
            if (!old && !!val) {
                this.saveFilesHandle()
            }
        }
    },
    methods: {
        onUpLoad(file) {
            let formDate = new FormData()
            formDate.append('file', file.file)
            // return uploadFild(this.URL, formDate)
        },
        init(data) {
            // getAllMsg({
            //     sqlId: "47",
            //     jsonMap: {
            //         documentType: this.saveType,
            //         documentId: this.documentId ? this.documentId : data
            //     }
            // }).then(res => {
            //     if (res.code === 200 && res.state) {
            //         this.tableList = res.value.rows

            //         if (this.disabled) {
            //             if (this.tableList.length && this.tableList.length > 0) {
            //                 this.$emit('fileShow', true)
            //             } else {
            //                 this.$emit('fileShow', false)
            //             }
            //         }
            //     }
            // })
        },
        crossPlatformFiles(data) {
            //跨平台附件
            data.forEach((item) => {
                var obj = {
                    DOCUMENT_TYPE: this.saveType,
                    URL: item.url,
                    DOC_SIZE: 0,
                    FILE_NAME: item.url.split('/').pop(),
                    UPLOAD_DATE: this.getTime(),
                    CREATEDUSER: this.$store.state.user.usiBrainerson[0].personName || '',
                    // createdBy:this.$store.state.iBrain.iBrain_userInfo.personId,
                    // createdUser:this.$store.state.iBrain.iBrain_userInfo.personName,
                    crossFile: true,
                }
                this.tableList.push(obj)
            })
            this.$emit('changeFile', this.tableList.length, this.tableList)
        },
        onHideUpLoad() {
            this.visible = false
        },
        onShowUpLoad() {
            //附件弹窗打开
            this.fileList = []
            this.fileListCopy = []
            this.uploadDisabled = false
            this.visible = true
        },
        getTime() {
            var date = new Date();
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();
            var h = date.getHours();
            var minute = date.getMinutes();
            var s = date.getSeconds();

            m < 10 && (m = '0' + m)
            d < 10 && (d = '0' + d)
            h < 10 && (h = '0' + h)
            minute < 10 && (minute = '0' + minute)
            s < 10 && (s = '0' + s)
            return `${y}-${m}-${d} ${h}:${minute}:${s}`
        },
        beforeUpload(file) {
            if (
                [
                    'application/pdf',
                    'application/vnd.ms-excel',
                    'image/jpeg',
                    'image/png',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/msword',
                ].indexOf(file.type) < 0
            ) {
                this.$message.warning(file.name + ':上传文件类型错误')
                return false
            }
            if (file.size / 1024 / 1024 / 10 > 1) {
                this.$message.warning(file.name + ":文件大小已超过10M")
                return false
            }
            this.uploadDisabled = true
        },
        onSuccess(res, file, fileList) {
            //上传成功

            var obj = {
                DOCUMENT_TYPE: this.saveType,
                DOCUMENT_ID: this.documentId,
                URL: res.value,
                DOC_SIZE: file.size,
                FILE_NAME: file.name,
                FILE_TYPE: file.name.split('.')[1],
                UPLOAD_DATE: this.getTime(),
                CREATEDUSER: this.$store.state.user.usiBrainerson[0].personName || '',
            }
            console.log(obj, '123123');

            this.tableList.push(obj)
            this.$emit('changeFile', this.tableList.length, this.tableList)

            let status = fileList.every(item => {
                let isConfirm = item.response && item.response.code === 200
                if (!isConfirm) {
                    this.$message.warning(item.response.msg)
                }
                return isConfirm
            })
            if (status) {
                this.saveFilesHandle()
                this.visible = false
                this.uploadDisabled = false
            }
        },
        onError(err, file, files) {
            this.uploadDisabled = false
            if (err.message) {
                let res = JSON.parse(err.message)
                if (res.data || res.msg) {
                    this.$message.warning(res.data || res.msg)
                } else {
                    this.$message.warning('上传失败')
                }
            } else {
                this.$message.warning(file.name + '：上传失败')
            }
        },
        onChange(file, files) {
            //附件状态变化
            this.fileListCopy = files
        },
        onDelete(row, index) {
            //附件删除
            if (!row.LINE_ID) {
                this.tableList.splice(index, 1)
                return
            }
            /**
             * @desc 删除行请求函数
             * @params postData.LINE_ID 附件id
             */
            this.$_mixin_deleteLineHandle({
                LINE_ID: row.LINE_ID
            }, '49').then(() => {
                this.tableList.splice(index, 1)
            })
        },
        onCheckWord(row, index) {
            //附件预览
            let file = row.FILE_NAME.split('.')
            let str = file[file.length - 1]
            let params = {
                imageUrl: row.URL
            }
            let url = this.setUrl(this.prevURL, params, 'LOOK')
            if (['png', 'jpg', 'jpeg', 'JPG', 'PNG', 'JPEG'].indexOf(str) > -1) {
                this.pictureVisible = true
                this.$nextTick(() => {
                    this.$refs['picture'].init(url)
                })
            } else if (str === 'pdf' || str === 'PDF') {
                window.open(url)
            } else {
                this.onDownload(row)
            }
        },
        setUrl(url, data, type) {
            let params = []
            for (var key in data) {
                params.push(`${key}=${data[key]}`)
            }
            let query = params.join('&')
            return `${url}?${query}`
        },
        onDownload(row, index) {
            //附件下载
            let url = ''
            if (row.FILE_ID) {
                url = `${this.downURL}?fileId=${row.FILE_ID}`
            } else {
                url = `${this.downURL}?url=${row.URL}&fileName=${encodeURI(row.FILE_NAME)}`
            }
            // downloadFile(url, row.FILE_NAME).then(res => {
            //     console.log(res, 'res');
            // })
        },
        verifyRepeat(defList) {
            let list = [].concat(this.fileListCopy)
            if (!list.length) return Promise.resolve()

            return new Promise((resolve, reject) => {
                for (var i = 0; i < list.length; i++) {
                    let index = i
                    let item = list[i]
                    let oldList = [].concat(defList || list)

                    if (!oldList.length) {
                        resolve()
                        break
                    }
                    if (!defList) {
                        oldList.splice(index, 1)
                    }
                    let status = oldList.some(bar => bar.name == item.name || bar.FILE_NAME == item.name)

                    if (status) {
                        let tips = `上传文件中"${item.name}"${!defList ? '重复' : '已存在'}请检查附件!`
                        this.$message.warning(tips)

                        reject()
                        break
                    }
                    resolve()
                }
            })
        },
        onSubmit() {
            //附件上传确定
            this.verifyRepeat()
                .then(() => this.verifyRepeat(this.tableList))
                .then(() => this.$refs.upload.submit())
                .catch(() => { })
        },
        saveFilesHandle() {
            if (!this.documentId) return
            if (!this.tableList.length) return

            let params = this.tableList.map(item => {
                !item.DOCUMENT_ID && (item.DOCUMENT_ID = this.documentId)
                return item
            })

            /**
             * @desc 保存附件函数
             * @params sqlId 查询id
             * @params params 保存参数集合
             */
            return this.$_mixin_saveLineHandle({
                sqlId: '50',
                jsonMap: params,
            })
                .then(() => {
                    this.init()
                })
                .catch(msg => {
                    this.$message.warning(msg)
                })
        }
    },
    mounted() {
        this.init()
    },
}
</script>

<style lang="scss">
.iBrain-upLoad-dialog {
    .el-dialog .el-dialog__header {
        background: #6F7E95FF;
    }

    .el-dialog .el-dialog__body {
        padding: 20px;
    }

    .el-dialog__title,
    .el-dialog__headerbtn .el-dialog__close {
        color: #fff;
    }

    .el-dialog__footer {
        text-align: right;
    }
}
</style>
<style lang="scss" scoped>
.iBrain-upLoad-table {
    background-color: #fff;

    .iBrain-upLoad-header {
        &+.iBrain-upLoad-container {
            margin-top: 10px;
        }
    }
}

::v-deep .el-table .el-table__body-wrapper {
    overflow-x: hidden !important;
}
</style>
