<script setup lang="ts">
import VipSelector from './gadgets/VipSelector.vue';
import Characters from './gadgets/Characters.vue';
import Stats from './gadgets/Stats.vue';


</script>

<template>
    <div class="bg-primary elements-height col px-3 pt-3 ">
        <div class="row m-0">
            <VipSelector></VipSelector>
        </div>
        <hr>
        <div class="row m-0">
            <Characters></Characters>
        </div>
        <div class="row m-0 ">
            <Stats />
        </div>
    </div>
</template>

<style scoped></style>
