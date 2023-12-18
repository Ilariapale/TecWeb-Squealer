<template>
    <form onsubmit="postSqueal()">
        <ul class="nav justify-content-center nav-pills mb-3 " id="pills-tab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active text-white" id="pills-text-squeal-tab" data-bs-toggle="pill"
                    data-bs-target="#pills-text-squeal" type="button" role="tab" aria-controls="pills-text-squeal"
                    aria-selected="true">Text</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link text-white" id="pills-image-squeal-tab" data-bs-toggle="pill"
                    data-bs-target="#pills-image-squeal" type="button" role="tab" aria-controls="pills-image-squeal"
                    aria-selected="false">Image</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link text-white" id="pills-video-squeal-tab" data-bs-toggle="pill"
                    data-bs-target="#pills-video-squeal" type="button" role="tab" aria-controls="pills-video-squeal"
                    aria-selected="false">Video</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link text-white" id="pills-position-squeal-tab" data-bs-toggle="pill"
                    data-bs-target="#pills-position-squeal" type="button" role="tab" aria-controls="pills-position-squeal"
                    aria-selected="false">Position</button>
            </li>
        </ul>

        <div class="row justify-content-center tab-content" id="pills-tabContent">

            <div class="tab-pane fade show justify-content-center active mb-2 col-8 conta" id="pills-text-squeal"
                role="tabpanel" aria-labelledby="pills-text-squeal-tab" tabindex="0">
                <!-- text squeal -->
                <textarea v-model="squeal_input" class="form-control p-4 py-3" id="exampleFormControlTextarea1" rows="3"
                    @input="updateCharacterCount"></textarea>
                <small class="position-absolute end-2 p-1 text-primary topright"><b>{{ charCount }}</b></small>
                <!-- fine text squeal -->
            </div>
            <div class="tab-pane fade justify-content-center col-8" id="pills-image-squeal" role="tabpanel"
                aria-labelledby="pills-image-squeal-tab" tabindex="0">
                <!-- image squeal -->
                <div class="input-group mb-3">
                    <input type="file" class="form-control" accept="image/*" name="image" id="inputGroupFile02">
                    <label class="input-group-text" for="inputGroupFile02">Upload</label>
                </div>
                <!-- fine image squeal -->
            </div>
            <div class="tab-pane fade justify-content-center col-8" id="pills-video-squeal" role="tabpanel"
                aria-labelledby="pills-video-squeal-tab" tabindex="0">
                <!-- video squeal -->
                <div class="input-group mb-3">
                    <input type="file" class="form-control" accept="video/*" name="video" id="inputGroupFile02">
                    <label class="input-group-text" for="inputGroupFile02">Upload</label>
                </div>
                <!-- fine video squeal -->
            </div>
            <div class="tab-pane fade justify-content-center col-8" id="pills-position-squeal" role="tabpanel"
                aria-labelledby="pills-position-squeal-tab" tabindex="0">
                <!-- position squeal -->
                <MapVue></MapVue>
                <!-- fine position squeal -->
            </div>
            <label for="exampleFormControlTextarea1" class="form-label">New Squeal</label>

        </div>

        <button type="submit" class="btn btn-primary">Submit</button>


    </form>
</template>
<style scoped>
.topright {
    position: absolute;
    top: 0px;
    right: 16px;
    font-size: 18px;
    user-select: none;
}

.conta {
    position: relative;
}
</style>
<script lang=ts>
import MapVue from './Map.vue';




export default {
    data() {
        return {
            squeal_input: "",
            charCount: 0
        };
    },
    methods: {
        postSqueal() {
            console.log("squeal posted");
        },
        updateCharacterCount() {
            this.charCount = this.squeal_input.length;
        }
    },
    props: {
        vip: {
            type: Object,
            required: true
        }
    },
    watch: {},
    mounted() {
    },
    components: { MapVue }
}

</script>