<template>
    <div class="p-1">You're now managing:</div>
    <div class="d-flex input-group">
        <select class="form-select form-select-lg  clickable" v-model="select_form" aria-label=".form-select-lg example"
            v-on:change="updateVip">
            <option :value="'none'" selected>Select a VIP</option>
            <option v-for="user in usernames" :value="user">{{ user }}</option>
        </select>
        <button class="btn btn-danger text-white input-group-text" @click="removeVIPfromSMM"> Remove VIP</button>
    </div>
    <div v-if="select_form == 'none'" class="text-muted"><i class="bi bi-info-circle-fill"></i> Select a user to view
        squeals
    </div>
    <div v-else class="text-muted mt-2 mb-3"> </div>
</template>

<script lang=ts>
import { getUsername, removeVIP } from '@/services/user.service';


export default {
    data() {
        return {
            select_form: "none",
            usernames: [] as any,
        }
    },
    methods: {
        updateVip() {
            this.$emit('update-vip', this.select_form)
        },
        async getUsernames(vips_ids: any) {
            this.usernames = [];
            for (let i = 0; i < vips_ids.length; i++) {
                await getUsername(vips_ids[i]).then((response) => {
                    this.usernames.push(response.username);
                }).catch((error) => {
                    return error;
                });
            }
        },
        async removeVIPfromSMM() {
            if (this.select_form == "none") return;
            await removeVIP(this.select_form).then((response) => {
                this.select_form = "none";
                this.$emit('update-vip', "none");
                this.$emit('remove-vip')
            }).catch((error) => {
                return error;
            })
            this.select_form = "none";
        }

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
                this.select_form = vip;
            },
            deep: true
        }
    },
    emits: ['update-vip', 'update-vips-array', 'remove-vip'],

    mounted() {
        this.getUsernames(this.vip_users);
        this.$emit('update-vips-array', this.usernames);
    },
}

</script>