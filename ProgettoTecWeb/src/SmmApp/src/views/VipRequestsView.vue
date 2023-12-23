
<template>
    <div class="container unselectable text-center col">
        <h1><i class="bi bi-people-fill"></i> VIP requests</h1>
        <div class="text-muted" v-if="requests.length <= 0"><i class="bi bi-info-circle-fill"></i> No requests available
        </div>
    </div>
    <div class="ps-4 pt-4 user-select-none">
        <div class="text-danger d-flex flex-md-row p-2 px-4 gap-4 align-items-center justify-content-center">{{ error }}
        </div>
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
import { getSMMrequests, manageSMMrequest } from "../services/user.service";
export default {
    data() {
        return {
            requests: [] as any[],
            error: "",
        };
    },
    methods: {
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
                //rimuovo la richiesta dalla lista
                added?.classList.remove("d-none");
                document.getElementById(`removed-${id}`)?.classList.add("d-none");
                document.getElementById(`button-div-${id}`)?.classList.add("d-none");
                setTimeout(() => {
                    this.requests = this.requests.filter((request: any) => request._id !== id);
                    added?.classList.add("d-none");
                }, 2000);
                setTimeout(() => {
                    this.$emit("vip-request-accepted");
                }, 3000);
            }).catch((error: any) => {
                this.error = error
                setTimeout(() => {
                    this.error = "";
                }, 2000);

            });
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
                this.error = error
            });
        },
    },
    mounted() {
        getSMMrequests().then((requests: any | undefined) => {
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