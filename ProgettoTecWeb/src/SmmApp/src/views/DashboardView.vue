
<script lang="ts">
import NewSquealVue from '@/components/gadgets/NewSqueal.vue';
import Squeal from '@/components/gadgets/Squeal.vue';

export default {
    data() {
        return {
            squeals: [],
            showedSqueals: [],
            showLoadMore: false,
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
        },
        prices: {
            type: Object,
            required: true
        }
    },
    methods: {
        loadMore() {
            if (this.showedSqueals.length + 10 > this.squeals.length) {
                this.showedSqueals = this.squeals.slice();
                this.showLoadMore = false;
            }
            else {
                this.showedSqueals = this.squeals.slice(0, this.showedSqueals.length + 10);
                this.showLoadMore = true;
            }
        },
        squealPosted(event: Event) {
            this.$emit("squeal-posted", event);
        }
    },
    mounted() {
    },
    watch: {
        vip: {
            handler: function (val: any) {
                let squealsArray = val?.squeals?.posted || [];
                this.squeals = squealsArray.slice().reverse();
                this.showedSqueals = this.squeals.slice(0, 10);
                this.showLoadMore = this.squeals.length > 10;
            },
            deep: true
        }
    }

}

</script>
<template>
    <div class="container unselectable text-center col">
        <h1 class="row justify-content-center">Dashboard</h1>
        <div v-if="vip" class="row justify-content-center">
            <h3>{{ vip?.username }}</h3>
            <i class="bi bi-plus-circle-fill clickable h4" data-bs-toggle="collapse" href="#newSqueal" role="button"
                aria-expanded="false" aria-controls="newSqueal"></i>
            <NewSquealVue :prices="prices" :vip=vip class="collapse" id="newSqueal" @squeal-posted="squealPosted($event)">
            </NewSquealVue>
            <!--loadmore button-->
        </div>
    </div>

    <div class="justify-content-center text-center">
        <div v-for="squeal of showedSqueals" :key="squeal">
            <Squeal :squeal_id="squeal"></Squeal>
        </div>

        <button class="btn btn-secondary rounded-pill m-3" v-if="showLoadMore" name="load more" type="button"
            @click="loadMore"> <i class="bi bi-arrow-clockwise"></i> </button>
    </div>
</template>

<style scoped></style>
 