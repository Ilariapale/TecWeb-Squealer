
<template>
    <div class="card mt-3 stats">
        <div class="card-body">
            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active fs-3" id="pills-home-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home"
                        aria-selected="true"><i class="bi bi-bar-chart-line"></i><!--Squeal stats--></button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3" id="pills-profile-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile"
                        aria-selected="false">
                        <i class="bi bi-trophy-fill"></i><!--Top squeals--></button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3" id="pills-contact-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact"
                        aria-selected="false"><i class="bi bi-calendar2-week"></i><!--Monthly activity--></button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fs-3" id="pills-disabled-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-disabled" type="button" role="tab" aria-controls="pills-disabled"
                        aria-selected="false"><i class="bi bi-graph-up-arrow"></i><!--Overview--></button>
                </li>
            </ul>
            <div class="tab-content" id="pills-tabContent">
                <div class="tab-pane fade show active text-dark" id="pills-home" role="tabpanel"
                    aria-labelledby="pills-home-tab" tabindex="0">
                    <div class="h4 mb-0">Squeal stats</div>

                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col"><b>Type</b></th>
                                <th scope="col" class="text-center"><b>Emoji</b></th>
                                <th scope="col" class="text-end"><b>Count</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="reaction in reactionsArray" class="p-1">
                                <td class="p-1"><b>{{ reaction.name }}</b></td>
                                <td class="p-1 text-center">{{ reaction.emoji }}</td>
                                <td class="p-1 text-end">{{ reaction.count }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="tab-pane fade text-dark" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab"
                    tabindex="0">
                    <div class="h4">Top squeals</div>...
                </div>
                <div class="tab-pane fade text-dark" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab"
                    tabindex="0">
                    <div class="h4">Monthly activity</div>...
                </div>
                <div class="tab-pane fade text-dark" id="pills-disabled" role="tabpanel"
                    aria-labelledby="pills-disabled-tab" tabindex="0">
                    <div class="h4">Overview</div>...
                </div>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'Stats',
    //props: {},
    data() {
        return {
            reactionsArray: [
                {
                    name: 'like',
                    emoji: '👍',
                    count: 0
                },
                {
                    name: 'love',
                    emoji: '😍',
                    count: 0
                },
                {
                    name: 'laugh',
                    emoji: '😂',
                    count: 0
                },
                {
                    name: 'dislike',
                    emoji: '👎',
                    count: 0
                },
                {
                    name: 'disgust',
                    emoji: '🤮',
                    count: 0
                },
                {
                    name: 'disagree',
                    emoji: '🙅',
                    count: 0
                },
            ],

            chartUrl: ""
        }
    },
    methods: {
        async getReactions() {
            const response = await fetch('https://api.smm.org.uk/reactions');
            const data = await response.json();
            console.log(data);
            this.reactionsArray = data;
        },
        async getChart() {
            const response = await fetch('https://api.smm.org.uk/chart');
            const data = await response.json();
            console.log(data);
            this.chartUrl = data;
        }

    },


}
</script>

<style scoped>
.stats {
    height: 40vh
}

.nav-item {
    padding-right: 8px !important;
}
</style>