
<script lang="ts">
import Squeal from '@/components/gadgets/Squeal.vue';
import { isProxy, toRaw } from 'vue';

export default {
    data() {
        return {
            squeals: ["squeal1", "squeal2", "squeal3"]
        };
    },
    components: {
        Squeal
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
    methods: {
        vipSquealsObject() {
            const raw = toRaw(this.vip);
            return raw.squeals.posted;
        },
        proxyToRaw(obj: any) {
            const raw = toRaw(obj);
            return raw;
        }
    },
    mounted() {
    }
}

</script>
<template>
    <div class="justify-content-center">
        <h1>Dashboard</h1>
        <div v-for="squeal of vip?.squeals?.posted" :key="squeal">
            <Squeal :squeal_id="squeal"></Squeal>
        </div>
    </div>
</template>

<style scoped></style>
 