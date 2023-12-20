<template>
    <select class="form-select form-select-xl vips-selection w-50 bg-primary" aria-label=".form-select-sm example">
        <option class="" value="none" selected>Select vip</option>
        <option v-for="vip in vips_usernames" :value="vip">{{ vip }}</option>
    </select>
</template>

<style scoped>
.vips-selection {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
}
</style>

<script lang="ts">
export default {
    props: {
        vips_usernames: {
            type: Array,
            required: true
        }
    }
}

</script>