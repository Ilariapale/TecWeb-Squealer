<template>
    <div class="p-1">You're now managing:</div>
    <select class="form-select form-select-lg mb-1 clickable" aria-label=".form-select-lg example" v-on:change="updateVip">
        <option value="none" selected>Select a VIP</option>
        <option v-for="user in usernames" :value="user">{{ user }}</option>
    </select>
    <div v-if="selected_vip == 'none'" class="text-muted"><i class="bi bi-info-circle-fill"></i> Select a user to view
        squeals
    </div>
    <div v-else class="text-muted mt-2 mb-3"> </div>
</template>

<script lang=ts>
import { getUsername } from '@/services/user.service';
import { toRaw } from 'vue';


export default {
    data() {
        return {
            usernames: [] as any,
            selected_vip: "none"
        }
    },
    methods: {
        updateVip(event: any) {
            this.selected_vip = event.target.value;
            this.$emit('update-vip', event.target.value);
        },
        async getUsernames(val: any) {
            this.usernames = [];
            for (let i = 0; i < val.length; i++) {
                await getUsername(val[i]).then((response) => {
                    this.usernames.push(response.username);
                }).catch((error) => {
                    console.log(error);
                    return error;
                });
            }
        },

    },
    props: {
        vip_users: {
            type: Array,
            required: true
        }
    },
    watch: {
        vip_users: {
            handler: async function (val: any) {
                this.getUsernames(val);
            },
            deep: true
        }
    },

    mounted() {
    },
}

</script>