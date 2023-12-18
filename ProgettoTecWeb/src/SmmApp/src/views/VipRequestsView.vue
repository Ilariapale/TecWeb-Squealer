
<template>
    <h1>VIP requests</h1>
    <div class="ps-4 pt-4 user-select-none">
        <div type="button" :id="'request-' + request._id" data-bs-toggle="button" v-for="request in requests"
            class="d-flex flex-md-row p-2 px-4 gap-4 align-items-center justify-content-center">
            <div class="card border-secondary col-9 row" @click="toggleButtons(request._id)">
                <div class="card-body text-dark row">
                    <div class="col">
                        @<strong>{{ request.username }}</strong>:
                        <hr class="m-2">
                        <p class="text-muted m-0">{{ request.profile_info }}</p>
                    </div>
                    <div class="col-auto d-flex align-items-center justify-content-center">
                        <i :id="`added-` + request._id" class="bi h2 bi-check-circle-fill text-success d-none"></i>
                        <i :id="`removed-` + request._id" class="bi h2 bi-x-circle-fill text-danger d-none"></i>
                    </div>
                </div>
            </div>
            <div class="col-3 d-none" :id="'button-div-' + request._id">
                <button :id="'confirm-' + request._id" title="confirm" type="button"
                    class="btn btn-success bi bi-check-lg text-white me-2" @click="acceptRequest(request._id)"></button>
                <button :id="'dismiss-' + request._id" title="dismiss" type="button"
                    class="btn btn-danger bi bi-x-lg text-white" @click="declineRequest(request._id)"></button>
            </div>
        </div>
    </div>
</template>
<script lang=ts>
import { getUsername, getSMMrequests, manageSMMrequest } from "../services/user.service";
/*request.profile_picture*/ //
export default {
    data() {
        return {
            requests: [{
                _id: "id-paulpaccy",
                username: "paulpaccy",
                profile_info: "jghvvk,gvlyhyulgliygbilkugbilu.gbliugb.likjughblu"
            },
            {
                _id: "id-ilapale",
                username: "ilapale",
                profile_picture: "./../components/icons/logo.png",
                profile_info: ""
            },
            {
                _id: "id-giovannina",
                username: "giovannina",
                profile_picture: "./../components/icons/logo.png",
                profile_info: ""
            }, {
                _id: "id-pasqualino",
                username: "pasqualino",
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
        acceptRequest(id: string) {
            const added = document.getElementById(`added-${id}`);
            manageSMMrequest(id, "accept").then((response: any) => {
                console.log(response);
                //rimuovo la richiesta dalla lista
                added?.classList.remove("d-none");
                document.getElementById(`removed-${id}`)?.classList.add("d-none");
                document.getElementById(`button-div-${id}`)?.classList.add("d-none");
                setTimeout(() => {
                    this.requests = this.requests.filter((request: any) => request._id !== id);
                    added?.classList.add("d-none");
                }, 2000);
            }).catch((error: any) => {
                console.log(error);
            });
            console.log("confirm request " + id);
        },
        declineRequest(id: string) {
            const removed = document.getElementById(`removed-${id}`);

            manageSMMrequest(id, "decline").then((response: any) => {
                document.getElementById(`added-${id}`)?.classList.add("d-none");
                removed?.classList.remove("d-none");
                document.getElementById(`button-div-${id}`)?.classList.add("d-none");
                setTimeout(() => {
                    this.requests = this.requests.filter((request: any) => request._id !== id);
                    removed?.classList.add("d-none");
                }, 2000);
            }).catch((error: any) => {
                console.log(error);
            });
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