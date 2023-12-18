
<script lang="ts">
import NewSquealVue from '@/components/gadgets/NewSqueal.vue';
import Squeal from '@/components/gadgets/Squeal.vue';
import { isProxy, toRaw } from 'vue';

export default {
    data() {
        return {
            squeals: ["squeal1", "squeal2", "squeal3"]
        };
    },
    components: {
        Squeal,
        NewSquealVue,
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
    <div class="container text-center col">
        <h1 class="row justify-content-center">Dashboard</h1>
        <div v-if="vip" class="row justify-content-center">
            <h3>{{ vip?.username }}</h3>
            <i class="bi bi-plus-circle-fill clickable h4" data-bs-toggle="collapse" href="#newSqueal" role="button"
                aria-expanded="false" aria-controls="newSqueal"></i>
            <NewSquealVue :vip=vip class="collapse" id="newSqueal"></NewSquealVue>
        </div>
    </div>

    <div class="justify-content-center">
        <div v-for="squeal of vip?.squeals?.posted" :key="squeal">
            <Squeal :squeal_id="squeal"></Squeal>
        </div>
    </div>
</template>

<style scoped></style>
 