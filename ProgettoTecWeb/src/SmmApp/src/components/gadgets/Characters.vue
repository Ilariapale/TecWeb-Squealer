<template>
    <div class="d-flex flex-wrap p-0 ">
        <div class=" col-12 col-lg-12 pe-1 col-xl-7 pb-2 ">
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
        <div class="col-12 col-lg-12 col-xl-5 ps-1 pb-2">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title text-dark"><b>Buy more!</b></h5>
                    <div class="card-text">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Never run out!</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><b>Daily</b> <i class="bi bi-arrow-right"></i></td>
                                </tr>
                                <tr>
                                    <td><b>Weekly</b> <i class="bi bi-arrow-right"></i></td>
                                </tr>
                                <tr>
                                    <td><b>Monthly</b> <i class="bi bi-arrow-right"></i></td>
                                </tr>
                                <tr>
                                    <td><b>No extra!!</b></td>
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
export default {
    data() {

    },
    methods: {
    },
    props: {
        chars: {
            type: Object,
            required: true
        },

    },
}
</script>

<style></style>