<template>
    <div class="card mb-2 stats h-auto" id="stats-card">
        <div class="card-body p-2">
            <ul class="nav nav-pills mb-2" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3 " title="overview tab" id="pills-overview-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-overview" type="button" role="tab" aria-controls="pills-overview"
                        aria-selected="true">
                        <i class="bi bi-bar-chart-line"></i><!--Squeal stats-->
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3" title="top squeals tab" id="pills-top-squeals-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-top-squeals" type="button" role="tab" aria-controls="pills-top-squeals"
                        aria-selected="false">
                        <i class="bi bi-trophy-fill"></i><!--Top squeals-->
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3" title="histoy tab" id="pills-history-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-history" type="button" role="tab" aria-controls="pills-history"
                        aria-selected="false">
                        <i class="bi bi-calendar2-week"></i><!--Yearly activity-->
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3" title="charts tab" id="pills-charts-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-charts" type="button" role="tab" aria-controls="pills-charts"
                        aria-selected="false">
                        <i class="bi bi-graph-up-arrow"></i><!--Overview-->
                    </button>
                </li>
            </ul>
            <div class="tab-content" id="pills-tabContent" v-if="vip?._id != undefined">
                <div class="tab-pane fade text-dark" id="pills-overview" role="tabpanel"
                    aria-labelledby="pills-overview-tab" tabindex="0">
                    <div class="h4 mb-0">Squeal stats</div>
                    <div class="row">
                        <table class="stats-table col-xl-6 col-lg-12">
                            <thead>
                                <tr>
                                    <th scope="col"><b>Type</b></th>
                                    <th scope="col" class="text-center"><b>Emoji</b></th>
                                    <th scope="col" class="text-end"><b>Count</b></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="reaction in reactionsTotData" class="p-1">
                                    <td class="p-1">
                                        <b>{{ reaction.reaction }}</b>
                                    </td>
                                    <td class="p-1 text-center">{{ reaction.emoji }}</td>
                                    <td class="p-1 text-end">{{ reaction.count }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="col-xl-6 col-lg-12">
                            <img v-if="reactionsTotUrl" class="img-fluid btn py-0" :src="reactionsTotUrl"
                                alt="PieChart of reactions" @click="openChart(reactionsTotUrl)" />
                            <div v-else class="d-flex align-items-center justify-content-center text-center">
                                Select a VIP to see stats ...
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade text-dark" id="pills-top-squeals" role="tabpanel"
                    aria-labelledby="pills-top-squeals-tab" tabindex="0">
                    <div class="h4">Top squeals</div>
                    <div class="row  d-flex align-items-center justify-content-center">
                        <div class="col-xxl-5 col-xl-10">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col"><b>Top</b></th>
                                        <th scope="col" class="text-center"><b>Hex</b></th>
                                        <th scope="col" class="text-end"><b>Impressions</b></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(squeal, index) in top3ByImpressions" class="p-1">
                                        <td class="p-1">
                                            <b>{{ index + 1 }}</b>
                                        </td>
                                        <td class="p-1 text-center">{{ squeal.hex_id }}</td>
                                        <td class="p-1 text-end">{{ squeal.impressions }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="col-auto d-xl-none d-xxl-block"></div>
                        <div class="col-xxl-5 col-xl-10">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col"><b>Top</b></th>
                                        <th scope="col" class="text-center"><b>Hex</b></th>
                                        <th scope="col" class="text-end"><b>Reactions</b></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(squeal, index) in top3ByTotalReactions" class="p-1">
                                        <td class="p-1">
                                            <b>{{ index + 1 }}</b>
                                        </td>
                                        <td class="p-1 text-center">{{ squeal.hex_id }}</td>
                                        <td class="p-1 text-end">{{ squeal.totalReactions }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade text-dark" id="pills-history" role="tabpanel" aria-labelledby="pills-history-tab"
                    tabindex="0">
                    <div class="h4">Yearly activity</div>
                    <img class="img-fluid btn border-dark" :src="squealsHistoryUrl" alt="Line chart of yearly activity"
                        @click="openChart(squealsHistoryUrl)" />
                </div>
                <div class="tab-pane fade text-dark" id="pills-charts" role="tabpanel" aria-labelledby="pills-charts-tab"
                    tabindex="0">
                    <div class="h4">Overview</div>
                    <div class="charts row">
                        <div class="col-xl-6 col-lg-12 pb-1">
                            <img class="img-fluid btn border-dark" :src="tagsDistributionUrl" alt="Pie chart of squeal tags"
                                @click="openChart(tagsDistributionUrl)" />
                        </div>
                        <div class="col-xl-6 col-lg-12 pb-1">
                            <img class="img-fluid btn border-dark" :src="dataDistributionUrl"
                                alt="Bar chart of squeal types" @click="openChart(dataDistributionUrl)" />
                        </div>
                        <div class="col-xl-6 col-lg-12 pb-1">
                            <img class="img-fluid btn border-dark" :src="officialChannelInvolvementUrl"
                                alt="Bar chart of squeals impressions in official and unofficial channels"
                                @click="openChart(officialChannelInvolvementUrl)" />
                        </div>
                        <div class="col-xl-6 col-lg-12 pb-1">
                            <img class="img-fluid btn border-dark" :src="interactionsImpressionsUrl"
                                alt="Pie chart of reactions and comments over interactions"
                                @click="openChart(interactionsImpressionsUrl)" />
                        </div>
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
            reactionsTotData: [
                { reaction: "like", emoji: "👍", count: "no data" },
                { reaction: "laugh", emoji: "😂", count: "no data" },
                { reaction: "love", emoji: "😍", count: "no data" },
                { reaction: "dislike", emoji: "👎", count: "no data" },
                { reaction: "disagree", emoji: "🙅", count: "no data" },
                { reaction: "disgust", emoji: "🤮", count: "no data" },
            ] as any[],
            reactionsTotUrl: "",
            dataDistributionUrl: "",
            officialChannelInvolvementUrl: "",
            squealsHistoryUrl: "",
            tagsDistributionUrl: "",
            interactionsImpressionsUrl: "",
            top3ByTotalReactions: [] as any[],
            top3ByImpressions: [] as any[],
        };
    },
    methods: {
        async getStatistics() {
            if (this.vip?._id == undefined) {
                this.reactionsTotData = [
                    { reaction: "like", emoji: "👍", count: "no data" },
                    { reaction: "laugh", emoji: "😂", count: "no data" },
                    { reaction: "love", emoji: "😍", count: "no data" },
                    { reaction: "dislike", emoji: "👎", count: "no data" },
                    { reaction: "disagree", emoji: "🙅", count: "no data" },
                    { reaction: "disgust", emoji: "🤮", count: "no data" },
                ] as any[];
                this.reactionsTotUrl = "";
                this.dataDistributionUrl = "";
                this.officialChannelInvolvementUrl = "";
                this.squealsHistoryUrl = "";
                return;
            }
            getUserStatistics(this.vip._id).then((response) => {
                this.dataDistributionUrl = response.dataDistribution;
                this.squealsHistoryUrl = response.squealsHistory;
                this.officialChannelInvolvementUrl = response.officialChannelInvolvement;
                this.reactionsTotUrl = response.reactionsTot;
                this.reactionsTotData = response.reactionsTotData;
                this.tagsDistributionUrl = response.tagsDistribution;
                this.interactionsImpressionsUrl = response.interactionsImpressions;
                this.top3ByTotalReactions = response.top3ByTotalReactions;
                this.top3ByImpressions = response.top3ByImpressions;
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
