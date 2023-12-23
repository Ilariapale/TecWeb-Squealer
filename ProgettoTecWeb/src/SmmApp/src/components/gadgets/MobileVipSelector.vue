<template>
    <select v-model="select_form" class="form-select form-select-xl vips-selection w-50 bg-primary"
        aria-label=".form-select-sm example" v-on:change="updateVip">
        <option :value="'none'" selected>Select vip</option>
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
    data() {
        return {
            //selected_vip: "none",
            select_form: "none",
        }
    },
    methods: {
        updateVip() {
            this.$emit('update-vip', this.select_form)
        },
    },
    props: {
        vips_usernames: {
            type: Array,
            required: true
        },
        selected_vip_out: {
            type: String,
            required: true
        }
    },
    watch: {
        selected_vip_out: {
            handler: function (vip: any) {
                this.select_form = vip;
            },
            deep: true
        }
    }
}

</script>