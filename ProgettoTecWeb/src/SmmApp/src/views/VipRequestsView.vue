
<template>
    <h1>VIP requests</h1>
    <button title="confirm" type="button" class="btn btn-success bi bi-check-lg text-white me-2"
        @click="printUser"></button>
    <button id='confirm-' title="confirm" type="button" class="btn btn-success bi bi-check-lg text-white me-2"
        @click="sendRequest"></button>
    <div class="ps-4 pt-4 user-select-none">
        <div type="button" :id="'request-' + request._id" data-bs-toggle="button" v-for="request in requests"
            class="d-flex flex-md-row p-2 px-4 gap-4 align-items-center justify-content-center">
            <div class="card border-secondary col-9" @click="toggleButtons(request._id)">
                <div class="card-body text-dark">
                    @<strong>{{ request.username }}</strong>:
                    <hr class="m-2">
                    <p class="text-muted m-0">{{ request.profile_info }}</p>
                </div>
            </div>
            <div class="col-3 d-none" :id="'button-div-' + request._id">
                <button :id="'confirm-' + request._id" title="confirm" type="button"
                    class="btn btn-success bi bi-check-lg text-white me-2"></button>
                <button :id="'dismiss-' + request._id" title="dismiss" type="button"
                    class="btn btn-danger bi bi-x-lg text-white"></button>
            </div>
        </div>
    </div>
</template>
<script lang=ts>
import { getUsername, getSMMrequests } from "../services/user.service";
/*request.profile_picture*/ //
export default {
    data() {
        return {
            requests: [{
                _id: "657c165d68b86824fbacdd2e",
                username: "paulpaccy",
                profile_info: "jghvvk,gvlyhyulgliygbilkugbilu.gbliugb.likjughblu"
            },
            {
                _id: "657c165d68b86824bacdd2e",
                username: "paulpaccy",
                profile_picture: "./../components/icons/logo.png",
                profile_info: ""
            },
            {
                _id: "657c165d68b86824fbacdd2e",
                username: "paulpaccy",
                profile_picture: "./../components/icons/logo.png",
                profile_info: ""
            },
            {
                _id: "657c165d68b86824fbacdd2e",
                username: "paulpaccy",
                profile_picture: "./../components/icons/logo.png",
                profile_info: ""
            },
            {
                _id: "657c165d68b86824fbacdd2e",
                username: "paulpaccy",
                profile_picture: "./../components/icons/logo.png",
                profile_info: ""
            },
            {
                _id: "657c165d68b86824fbacdd2e",
                username: "paulpaccy",
                profile_picture: "./../components/icons/logo.png",
                profile_info: ""
            },
            {
                _id: "657c165d68b86824fbacdd2e",
                username: "paulpaccy",
                profile_picture: "./../components/icons/logo.png",
                profile_info: ""
            },
            {
                _id: "657c165d68b86824fbacdd2e",
                username: "paulpaccy",
                profile_picture: "./../components/icons/logo.png",
                profile_info: ""
            },
            ],
        };
    },
    methods: {
        printUser() {
            console.log(this.user);
        },
        toggleButtons(id: string) {
            const request = document.getElementById(`request-${id}`);
            if (!request) return;
            if (request.classList.contains("active"))
                document.getElementById(`button-div-${id}`)?.classList.remove("d-none");
            else document.getElementById(`button-div-${id}`)?.classList.add("d-none");
        },
        confirmRequest(id: number) {
            console.log("confirm request " + id);
        },
        dismissRequest(id: number) {
            console.log("dismiss request " + id);
        },
        sendRequest() {
            getUsername().then((username: any) => {
                console.log("send request to ", username);
            });
        }
    },
    mounted() {
        getSMMrequests().then((requests: any) => {
            if (Array.isArray(requests) && requests.length > 0 && requests[0]._id && requests[0].username) {
                this.requests = requests;
            } else {
                console.log("Invalid requests structure");
            }
        });
    },
    props: {
        user: {
            type: Object,
            required: true,
        },
        vip: {
            type: Object,
            required: true
        }
    },
};
</script>