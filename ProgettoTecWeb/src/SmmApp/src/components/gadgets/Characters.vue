<template>
    <div class="d-flex flex-wrap p-0 ">
        <div class=" col-12 col-lg-12 pe-0 pe-xl-1 col-xl-7 pb-2 ">
            <div class="card ">
                <div class="card-body">
                    <h5 class="card-title text-dark"><b>Chars available</b></h5>
                    <div class="card-text">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col"><b>Type</b></th>
                                    <th scope="col"><b>Remaining</b></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><b>Daily</b></td>
                                    <td>{{ chars?.daily || "none" }}</td>
                                </tr>
                                <tr>
                                    <td><b>Weekly</b></td>
                                    <td>{{ chars?.weekly || "none" }}</td>
                                </tr>
                                <tr>
                                    <td><b>Monthly</b></td>
                                    <td>{{ chars?.monthly || "none" }}</td>
                                </tr>
                                <tr>
                                    <td><b>Extra</b></td>
                                    <td>{{ chars?.extra_daily || "none" }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
        <div class="col-12 col-lg-12 col-xl-5 ps-1 ps-lg-0 pb-2 overflow-hidden">
            <div class="card h-100 pb-1">
                <div class="card-body">
                    <h5 class="card-title text-dark"><b>Buy more!</b></h5>
                    <div class="card-text">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th class="p-2 px-0" scope="col">Never run out!</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="p-2 px-0" style="white-space: pre;"><b>Daily</b>{{ '\t' }}<i
                                            class="bi bi-arrow-right"></i> <button :disabled="vip.username == undefined"
                                            class="btn btn-primary p-1 px-2" @click="buyChars('daily')">Buy 50</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 px-0" style="white-space: pre;"><b>Weekly</b>{{ '\t' }}<i
                                            class="bi bi-arrow-right"></i> <button :disabled="vip.username == undefined"
                                            class="btn btn-primary p-1 px-2" @click="buyChars('weekly')">Buy 150</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 px-0" style="white-space: pre;"><b>Monthly</b>{{ '\t' }}<i
                                            class="bi bi-arrow-right"></i> <button :disabled="vip.username == undefined"
                                            class="btn btn-primary p-1 px-2" @click="buyChars('monthly')">Buy 500</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { addCharacters } from '@/services/user.service';

export default {
    data() {

    },
    methods: {
        async buyChars(type: string) {
            let link = "";
            switch (type) {
                case "daily":
                    link = "https://www.sandbox.paypal.com/instantcommerce/checkout/VLK8VFRDYQ4MG"
                    break;
                case "weekly":
                    link = "https://www.sandbox.paypal.com/instantcommerce/checkout/8C7G9FA4KQ49J"
                    break;
                case "monthly":
                    link = "https://www.sandbox.paypal.com/instantcommerce/checkout/NLYTA9FV3MM3N"
                    break;
            }window.open(link, "_blank", 'width=500,height=600');
            await addCharacters(type + "tier1", this.vip.username).then((res) => {
                this.$emit('updateChars', type + "tier1");
            })


        }
    },
    props: {
        chars: {
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

<style></style>