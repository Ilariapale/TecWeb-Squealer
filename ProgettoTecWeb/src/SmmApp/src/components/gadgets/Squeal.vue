<script lang="ts">
import { getSqueal } from '@/services/squeal.service';
import { getCommentSection } from '@/services/comment.service';
import { getRelativeTime } from '@/services/time.service';

export default {
    data() {
        return {
            isCommentOpen: false,
            isDataOpen: false,
            squeal: {} as any,
            comment_section: {} as any,
            getRelativeTime: getRelativeTime
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
            await getSqueal(this.squeal_id).then(async (response) => {
                this.squeal = response[0];
                await this.getCommentSection();
            }).catch((error) => {
                console.log(error);
                return error;
            });

        },
        async getCommentSection() {
            await getCommentSection(this.squeal.comment_section).then(async (response) => {
                this.comment_section = response;
            }).catch((error) => {
                console.log(error);
                return error;
            });

        },
        async loadMoreComments() {
            await getCommentSection(this.squeal.comment_section, this.comment_section.comments_array[0]._id).then(async (response) => {
                response.comments_array.reverse().forEach((element: any) => {
                    this.comment_section.comments_array.unshift(element);
                });
                if (response.comments_array.length <= 0) {
                    this.isCommentOpen = false;
                }
            }).catch((error) => {
                console.log(error);
                return error;
            });
        }


    },
    mounted() {
        this.getSqueal()
    }
};
</script>

<template>
    <div class="container text-dark py-3">
        <div class="row justify-content-center">
            <div class="col-10 col-md-8">
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
                        <p v-if="squeal.content_type == 'text'" class="card-text">
                            {{ squeal.content }}</p>
                        <div class="card-img-top ">
                            <img v-if="squeal.content_type == 'image'" :src="'/../media/image/' + squeal.content"
                                class="img-fluid" alt="...">
                            <div v-if="squeal.content_type == 'video'" class="ratio ratio-16x9">
                                <iframe :src="'/../media/video/' + squeal.content" allowfullscreen></iframe>
                            </div>
                            <p v-if="squeal.content_type == 'position'" class="card-text">
                                [position]
                            </p>


                        </div>
                        <!--position-->
                        <div class="w-100">

                        </div>
                        <!--end position-->
                        <div class="card-icons container">
                            <div class="row flex-nowrap justify-content-between d-flex align-items-center my-2">

                                <div class="col-5 px-1">
                                    <button id="comment_button" type="button" class="btn btn-secondary btn-rounded px-2"
                                        v-bind:class="{ 'clicked': isCommentOpen }" @click="isCommentOpen = !isCommentOpen">
                                        <i class="bi bi-chat-dots-fill text-white"></i>
                                        <p class="badge bg-primary ms-2 my-auto">
                                            {{ squeal.comments_count }} </p>
                                    </button>
                                </div>


                                <div class="col-2 p-0 d-flex justify-content-center">
                                </div>

                                <div class="col-5 px-1">
                                    <button type="button" class="btn btn-secondary btn-rounded px-2 py-2"
                                        v-bind:class="{ 'clicked': isDataOpen }" @click="isDataOpen = !isDataOpen">
                                        <i class="bi bi-eye text-white"></i>
                                        <p class="badge bg-primary ms-2 my-auto">
                                            {{ squeal.impressions }} </p>
                                    </button>
                                </div>

                            </div>

                            <div class="flex-nowrap justify-content-center d-flex align-items-center py-2">
                            </div>

                        </div>

                        <div class="card-footer"><i class="bi bi-calendar4-week"></i>
                            {{ getRelativeTime(squeal.created_at) }}
                        </div>
                        <div class="mt-3" v-if="isDataOpen">
                            <div class="row">
                                <div class="col-3"></div>
                                <div class="col-6">
                                    👍{{ squeal.reactions.like || 0 }}-
                                    😂{{ squeal.reactions.laugh || 0 }}-
                                    😍{{ squeal.reactions.love || 0 }}-
                                    🤮{{ squeal.reactions.disgust || 0 }}-
                                    👎{{ squeal.reactions.dislike || 0 }}-
                                    🙅{{ squeal.reactions.disagree || 0 }}-
                                </div>
                                <div class="col-3 text-end text-muted">Total reactions: {{ squeal.positive_reactions +
                                    squeal.negative_reactions }}</div>
                            </div>
                        </div>
                        <div class="mt-3" v-if="isCommentOpen">
                            <!-- Lista dei commenti -->
                            <ul class="list-unstyled">
                                <li v-for="comment in comment_section.comments_array">
                                    <p> <strong> {{ comment.author_username }}: </strong>{{ comment.text }}
                                    </p>
                                    <div>
                                        <small class="text-muted">
                                            {{ comment.timestamp }}
                                        </small>
                                    </div>

                                </li>
                            </ul>
                            <div>
                                <button type="button" @click="loadMoreComments()"
                                    class="btn btn-secondary btn-rounded px-4 py-2">
                                    <i class="bi bi-arrow-down-circle-fill text-white"></i>
                                </button>
                            </div>
                            <!-- Modulo per aggiungere un nuovo commento -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>