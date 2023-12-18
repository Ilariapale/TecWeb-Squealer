<template>
    <div class="p-1">You're now managing:</div>
    <select class="form-select form-select-lg mb-3 clickable" aria-label=".form-select-lg example" v-on:change="updateVip">
        <option value="none" selected>Select a VIP</option>
        <option v-for="user in usernames" :value="user">{{ user }}</option>
    </select>
</template>

<script lang=ts>
import { getUsername } from '@/services/user.service';
import { toRaw } from 'vue';


export default {
    data() {
        return {
            usernames: [] as any
        }
    },
    methods: {
        updateVip(event: any) {
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