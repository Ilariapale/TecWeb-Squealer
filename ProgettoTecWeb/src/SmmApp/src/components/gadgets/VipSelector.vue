<template>
    <div class="p-1">You're now managing:</div>
    <select class="form-select form-select-lg mb-1 clickable" v-model="select_form" aria-label=".form-select-lg example"
        v-on:change="updateVip">
        <option :value="'none'" selected>Select a VIP</option>
        <option v-for="user in usernames" :value="user">{{ user }}</option>
    </select>
    <div v-if="select_form == 'none'" class="text-muted"><i class="bi bi-info-circle-fill"></i> Select a user to view
        squeals
    </div>
    <div v-else class="text-muted mt-2 mb-3"> </div>
</template>

<script lang=ts>
import { getUsername } from '@/services/user.service';


export default {
    data() {
        return {
            select_form: "none",
            usernames: [] as any,
            //selected_vip: "none"
        }
    },
    methods: {
        updateVip() {
            console.log("vip_selector", this.select_form);
            //this.selected_vip = event.target.value;
            this.$emit('update-vip', this.select_form)//event.target.value);
        },
        async getUsernames(vips_ids: any) {
            this.usernames = [];
            for (let i = 0; i < vips_ids.length; i++) {
                await getUsername(vips_ids[i]).then((response) => {
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
        }, selected_vip_out: {
            type: String,
            required: true
        }
    },
    watch: {
        vip_users: {
            handler: async function (vips_ids: any) {
                await this.getUsernames(vips_ids);
                this.$emit('update-vips-array', this.usernames);
            },
            deep: true
        },
        selected_vip_out: {
            handler: function (vip: any) {
                console.log("Mobile_vip_selector - watcher", vip);
                //this.selected_vip = vip;
                this.select_form = vip;
            },
            deep: true
        }
    },

    mounted() {
    },
}

</script>