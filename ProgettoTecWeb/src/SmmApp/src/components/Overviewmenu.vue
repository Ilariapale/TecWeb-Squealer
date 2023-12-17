<script lang="ts">
import VipSelector from './gadgets/VipSelector.vue';
import Characters from './gadgets/Characters.vue';
import Stats from './gadgets/Stats.vue';
import { toRaw } from 'vue';

export default {
    components: {
        VipSelector,
        Characters,
        Stats
    },
    methods: {
        updateVip(vip: any) {
            this.$emit('update-vip', vip);
        },
    },
    props: {
        user: {
            type: Object,
            required: true
        },
        vip: {
            type: Object,
            required: true
        }
    },
}


</script>

<template>
    <div class=" col px-3 pt-3 ">
        <div class="row m-0">
            <VipSelector :vip_users="user.managed_accounts" @update-vip="updateVip($event)"></VipSelector>
        </div>
        <hr>
        <div class="row m-0">
            <Characters :chars="vip?.char_quota"></Characters>
        </div>
        <div class="row m-0  ">
            <Stats :vip="vip" />
        </div>
    </div>
</template>

<style scoped></style>
