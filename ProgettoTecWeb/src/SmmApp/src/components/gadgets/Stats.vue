<template>
    <button class="btn btn-success" @click="getStatistics()"></button>
    <div class="card mb-2 stats h-auto">
        <div class="card-body p-2">
            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active fs-3 " id="pills-home-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home"
                        aria-selected="true">
                        <i class="bi bi-bar-chart-line"></i><!--Squeal stats-->
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3" id="pills-profile-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile"
                        aria-selected="false">
                        <i class="bi bi-trophy-fill"></i><!--Top squeals-->
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3" id="pills-contact-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact"
                        aria-selected="false">
                        <i class="bi bi-calendar2-week"></i><!--Monthly activity-->
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3" id="pills-disabled-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-disabled" type="button" role="tab" aria-controls="pills-disabled"
                        aria-selected="false">
                        <i class="bi bi-graph-up-arrow"></i><!--Overview-->
                    </button>
                </li>
            </ul>
            <div class="tab-content" id="pills-tabContent">
                <div class="tab-pane fade show active text-dark" id="pills-home" role="tabpanel"
                    aria-labelledby="pills-home-tab" tabindex="0">
                    <div class="h4 mb-0">Squeal stats</div>

                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th scope="col"><b>Type</b></th>
                                <th scope="col" class="text-center"><b>Emoji</b></th>
                                <th scope="col" class="text-end"><b>Count</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="reaction in reactionTotData" class="p-1">
                                <td class="p-1">
                                    <b>{{ reaction.name }}</b>
                                </td>
                                <td class="p-1 text-center">{{ reaction.emoji }}</td>
                                <td class="p-1 text-end">{{ reaction.count }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="tab-pane fade text-dark" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab"
                    tabindex="0">
                    <div class="h4">Top squeals</div>
                    <table class="squeals-table">
                        <thead>
                            <tr>
                                <th scope="col"><b>Type</b></th>
                                <th scope="col" class="text-center"><b>Emoji</b></th>
                                <th scope="col" class="text-end"><b>Count</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="reaction in reactionTotData" class="p-1">
                                <td class="p-1">
                                    <b>{{ reaction.name }}</b>
                                </td>
                                <td class="p-1 text-center">{{ reaction.emoji }}</td>
                                <td class="p-1 text-end">{{ reaction.count }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="tab-pane fade text-dark" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab"
                    tabindex="0">
                    <div class="h4">Monthly activity</div>
                    ...
                </div>
                <div class="tab-pane fade text-dark" id="pills-disabled" role="tabpanel"
                    aria-labelledby="pills-disabled-tab" tabindex="0">
                    <div class="h4">Overview</div>
                    <div class="charts row">
                        <div class="col-xl-6 col-lg-12">
                            <img class="img-fluid btn border-dark" :src="reactionsTotUrl" alt="PieChart of reactions"
                                @click="openChart(reactionsTotUrl)" />
                        </div>
                        <div class="col-xl-6 col-lg-12">
                            <img class="img-fluid btn border-dark" :src="dataDistributionUrl" alt="PieChart of reactions"
                                @click="openChart(dataDistributionUrl)" />
                        </div>
                        <div class="col-xl-6 col-lg-12">
                            <img class="img-fluid btn border-dark" :src="officialChannelInvolvementUrl"
                                alt="PieChart of reactions" @click="openChart(officialChannelInvolvementUrl)" />
                        </div>
                        <div class="col-xl-6 col-lg-12">
                            <img class="img-fluid btn border-dark" :src="squealsHistoryUrl" alt="PieChart of reactions"
                                @click="openChart(squealsHistoryUrl)" />
                        </div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { getUserStatistics } from '@/services/user.service';

export default {
    name: "Stats",
    props: {
        vip: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            reactionTotData: [] as any[],
            reactionsTotUrl: "",
            dataDistributionUrl: "",
            officialChannelInvolvementUrl: "",
            squealsHistoryUrl: "",
        };
    },
    methods: {
        async getStatistics() {
            console.log(this.vip._id);
            if (this.vip?._id == undefined) return;
            getUserStatistics(this.vip._id).then((response) => {
                this.dataDistributionUrl = response.dataDistribution;
                this.squealsHistoryUrl = response.squealsHistory;
                this.officialChannelInvolvementUrl = response.officialChannelInvolvement;
                this.reactionsTotUrl = response.reactionsTot;

                console.log(response);
            }).catch((error) => {
                console.log(error);
            });
        },
        openChart(url: string) {
            window.open(url, "_blank");
        },

    },
    async mounted() {
        await this.getStatistics();
    },
    watch: {
        vip: {
            handler: async function (val: any, oldVal: any) {
                await this.getStatistics();
            },
            deep: true
        }
    }
};
</script>

<style scoped>
.stats {
    height: 40vh;
}

.nav-item {
    padding-right: 8px !important;
}
</style>
