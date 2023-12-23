<script lang="ts">
import VipSelector from './gadgets/VipSelector.vue';
import Characters from './gadgets/Characters.vue';
import Stats from './gadgets/Stats.vue';

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
        updateVipsArray(vips: any) {
            this.$emit('update-vips-array', vips);
        },
        updateCharacters(tier: string) {
            this.$emit('updateChars', tier);
        },
        removeVIP() {
            this.$emit('remove-vip');
        }
    },
    props: {
        user: {
            type: Object,
            required: true
        },
        vip: {
            type: Object,
            required: true
        },
    },
    emits: ['update-vip', 'update-vips-array', 'updateChars', 'remove-vip']// 
}


</script>

<template>
    <div class="unselectable col px-3 pt-3">
        <div class="row m-0">
            <VipSelector :vip_users="user.managed_accounts" @update-vip="updateVip($event)" @remove-vip="removeVIP()"
                @update-vips-array="updateVipsArray($event)" :selected_vip_out="vip.username || 'none'"></VipSelector>
        </div>
        <hr class="mt-1">
        <div class="row m-0">
            <Characters :chars="vip?.char_quota" :vip="vip" @updateChars="updateCharacters($event)"></Characters>
        </div>
        <div class="row m-0  ">
            <Stats :vip="vip" />
        </div>
    </div>
</template>

<style scoped></style>
