<template>
    <div class="app-wrapper">
        <Navbar />
        <div class="main-container">
            <Breadcrumb />
            <AppMain />
        </div>
    </div>
</template>

<script>

import { Navbar, Breadcrumb, AppMain } from './components'

export default {
    name: 'Layout',
    components: {
        Navbar,
        Breadcrumb,
        AppMain,
    },
    computed: {
    },
    methods: {
    }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
    position: relative;
    width: 100%;
    height: 100%;

    .main-container {
        width: 100%;
        height: 100%;
        min-width: 1000px;
        min-height: 600px;
        background: #f0f0f0;
    }
}
</style>
