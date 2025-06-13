<template>
    <div class="code-validator">
        <el-form>
            <el-form-item label="输入JavaScript代码：">
                <el-input type="textarea" :rows="8" v-model="codeToCheck" placeholder="请输入需要验证的JavaScript代码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="validateJSCode">验证代码</el-button>
            </el-form-item>
        </el-form>

        <el-alert v-if="hasError" :title="errorMessage" type="error" show-icon></el-alert>

        <div v-if="hasError && errorLocation" class="error-details">
            <h4>错误位置：第 {{ errorLocation.line }} 行，第 {{ errorLocation.column }} 列</h4>
            <div class="code-preview">
                <div v-for="(line, index) in codeLines" :key="index"
                    :class="{ 'error-line': index + 1 === errorLocation.line, 'context-line': Math.abs(index + 1 - errorLocation.line) <= 2 }">
                    <span class="line-number">{{ index + 1 }}</span>
                    <span class="line-content">{{ line }}</span>
                    <span v-if="index + 1 === errorLocation.line" class="error-indicator">
                        <span class="error-pointer" :style="{ marginLeft: errorLocation.column + 'ch' }">^</span>
                        <span class="error-message">{{ errorDetails }}</span>
                    </span>
                </div>
            </div>
        </div>

        <el-alert v-if="!hasError && parseResult" title="代码语法正确" type="success" show-icon></el-alert>
    </div>
</template>

<script>
import * as acorn from 'acorn';

export default {
    name: 'CodeValidator',
    data() {
        return {
            codeToCheck: '',
            parseResult: null,
            hasError: false,
            errorMessage: '',
            errorLocation: null,
            errorDetails: '',
            codeLines: []
        }
    },
    methods: {
        validateJSCode() {
            if (!this.codeToCheck.trim()) {
                this.$message.warning('请输入需要验证的代码');
                return;
            }

            // 分割代码行用于显示
            this.codeLines = this.codeToCheck.split('\n');

            try {
                this.parseResult = acorn.parse(this.codeToCheck, {
                    ecmaVersion: 2020,
                    sourceType: 'module',
                    locations: true  // 启用位置信息
                });
                this.hasError = false;
                this.errorMessage = '';
                this.errorLocation = null;
                this.errorDetails = '';
                this.$message.success('代码语法检查通过！');
            } catch (error) {
                this.hasError = true;

                // 提取错误位置信息
                if (error.loc) {
                    this.errorLocation = {
                        line: error.loc.line,
                        column: error.loc.column
                    };
                    this.errorDetails = this.getErrorDetails(error);
                    this.errorMessage = `语法错误：第 ${error.loc.line} 行，第 ${error.loc.column} 列 - ${error.message}`;
                } else {
                    this.errorMessage = `语法错误：${error.message}`;
                    this.errorLocation = null;
                }

                this.$message.warning(this.errorMessage);
            }
        },

        // 获取更详细的错误信息
        getErrorDetails(error) {
            // 尝试提取更有意义的错误描述
            const messages = {
                'Unexpected token': '意外的标记',
                'Missing semicolon': '缺少分号',
                'Unexpected end of input': '代码意外结束',
                'Unexpected identifier': '意外的标识符',
                'Invalid or unexpected token': '无效或意外的标记',
                'Unexpected character': '意外的字符',
                'Missing }': '缺少右花括号',
                'Missing )': '缺少右括号',
                'Missing ]': '缺少右方括号'
            };

            for (const key in messages) {
                if (error.message.includes(key)) {
                    return messages[key] + '：' + error.message;
                }
            }

            return error.message;
        }
    }
}
</script>

<style scoped>
.code-validator {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.error-details {
    margin-top: 15px;
    border: 1px solid #f56c6c;
    border-radius: 4px;
    padding: 10px;
    background-color: #fef0f0;
}

.error-details h4 {
    color: #f56c6c;
    margin-top: 0;
}

.code-preview {
    font-family: monospace;
    white-space: pre;
    overflow-x: auto;
    background-color: #f8f8f8;
    border-radius: 3px;
    padding: 8px;
}

.line-number {
    color: #999;
    padding-right: 10px;
    text-align: right;
    user-select: none;
    display: inline-block;
    width: 30px;
}

.error-line {
    background-color: #ffebec;
    color: #ff4949;
    font-weight: bold;
}

.context-line {
    color: #606266;
}

.error-indicator {
    display: block;
    color: #f56c6c;
    font-weight: bold;
    margin-left: 30px;
}

.error-pointer {
    color: #f56c6c;
    display: inline-block;
}

.error-message {
    margin-left: 10px;
    font-size: 0.9em;
}
</style>