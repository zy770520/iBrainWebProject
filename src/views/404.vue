<template>
    <div class="http404-container">
        Please check that the URL you entered is correct, or click the button below
        to return to the homepage.
    </div>
</template>

<script>

export default {
    name: 'Page404',
    computed: {
    }
}
</script>

<style lang="scss" scoped>
.http404-container {
    transform: translate(-50%, -50%);
    position: absolute;
    top: 40%;
    left: 50%;
}
</style>
