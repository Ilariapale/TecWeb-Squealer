<script lang="ts">
import { getSqueal } from '@/services/squeal.service';

export default {
    data() {
        return {
            isClicked: false,
            squeal: {} as any
        };
    },
    props: {
        squeal_id: {
            type: String,
            required: true
        }
    },
    methods: {
        async getSqueal() {
            await getSqueal(this.squeal_id).then((response) => {
                this.squeal = response[0];
            }).catch((error) => {
                console.log(error);
                return error;
            });

        }
    },
    mounted() {
        this.getSqueal();
    }
};
</script>

<template>
    <div class="container text-dark py-3">
        <div class="row justify-content-center">
            <div class="col-10">
                <div class="squeal card text-center shadow-0">

                    <div class="card-header">
                        <div class="row">
                            <div class="col">
                            </div>
                            <div class="col">
                                HEX {{ squeal.hex_id }}
                            </div>
                            <div class="col text-end">
                                <i class="bi bi-trash" type="button"></i>
                            </div>

                        </div>
                    </div>


                    <div class="card-body p-2">
                        <h5 class="card-title">@{{ squeal.username }}</h5>
                        <p class="card-text">
                            {{ squeal.content }}</p>
                        <div class="card-img-top ">

                        </div>
                        <div>

                        </div>
                        <!--position-->
                        <div class="w-100">

                        </div>
                        <!--end position-->
                        <div class="card-icons container">
                            <div class="row flex-nowrap justify-content-between d-flex align-items-center my-2">

                                <div class="col-5 px-1">
                                    <button id="comment_button" type="button" class="btn btn-secondary btn-rounded px-2"
                                        v-bind:class="{ 'clicked': isClicked }" @click="isClicked = !isClicked">
                                        <i class="bi bi-chat-dots-fill"></i>
                                        <p class="badge bg-danger ms-2 my-auto">comment_section.comment_array.lenght</p>
                                    </button>
                                </div>


                                <div class="col-2 p-0 d-flex justify-content-center">
                                </div>

                                <div class="col-5 px-1">
                                    <button type="button" class="btn btn-secondary btn-rounded px-4 py-2">
                                        <i class="bi bi-flag-fill"></i>
                                    </button>
                                </div>

                            </div>

                            <div class="flex-nowrap justify-content-center d-flex align-items-center py-2">

                            </div>

                        </div>

                        <div class="card-footer"><i class="bi bi-calendar4-week"></i>
                            timeService.getRelativeTime(squeal.created_at)</div>
                        <div class="mt-3">
                            <!-- Lista dei commenti -->
                            <ul class="list-unstyled" v-if="isClicked">
                                <li>
                                    <p><strong>v-for="comment in
                                            comment_section.comment_array"comment.author_username</strong>: comment.text</p>
                                </li>
                            </ul>

                            <!-- Modulo per aggiungere un nuovo commento -->
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>