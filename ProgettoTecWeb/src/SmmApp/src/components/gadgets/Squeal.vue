<script lang="ts">
import { getSqueal, deleteSqueal } from '@/services/squeal.service';
import { getCommentSection } from '@/services/comment.service';
import { getRelativeTime } from '@/services/time.service';

export default {
    data() {
        return {
            isCommentOpen: false,
            isDataOpen: false,
            squeal: {} as any,
            comment_section: {} as any,
            loadMoreCommentsButton: true,
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
        openSquealInNewTab() {
            window.open('/../squeal/' + this.squeal._id, '_blank');
        },
        async loadMoreComments() {
            await getCommentSection(this.squeal.comment_section, this.comment_section.comments_array[0]._id).then(async (response) => {
                response.comments_array.reverse().forEach((element: any) => {
                    this.comment_section.comments_array.unshift(element);
                });
                if (response.comments_array.length <= 0) {
                    this.loadMoreCommentsButton = false;
                }
            }).catch((error) => {
                console.log(error);
                return error;
            });
        },
        async deleteSqueal() {
            await deleteSqueal(this.squeal_id).then(async (response) => {
                this.getSqueal();
            }).catch((error) => {
                console.log(error);
                return error;
            });

        },


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
                            <div class="col clickable" @click="openSquealInNewTab">
                                HEX {{ squeal.hex_id }}
                            </div>
                            <div class="col text-end" @click="deleteSqueal">
                                <i v-if="squeal.content_type != 'deleted'" class="bi bi-trash" type="button"></i>
                            </div>

                        </div>
                    </div>


                    <div class="card-body p-2">
                        <h5 class="card-title">@{{ squeal.username }}</h5>
                        <p v-if="squeal.content_type == 'text'" class="card-text">
                            {{ squeal.content }}</p>
                        <div class="card-img-top ">
                            <img v-if="squeal.content_type == 'image'" :src="'/../media/image/' + squeal.content"
                                class="img-fluid" alt="..." onerror="this.src='/../media/image/not-found.png'">
                            <video v-if="squeal.content_type == 'video'" class="ratio ratio-16x9" controls>
                                <source :src="'/../media/video/' + squeal.content">
                            </video>
                            <p v-if="squeal.content_type == 'position' || squeal.content_type == 'deleted'"
                                class="card-text">
                                [{{ squeal.content_type }}]
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
                                        v-bind:class="{ 'clicked': isCommentOpen }"
                                        @click="getCommentSection(); isCommentOpen = !isCommentOpen">
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

                        <div @click="openSquealInNewTab" class="card-footer clickable"><i class="bi bi-calendar4-week"></i>
                            {{ getRelativeTime(squeal.created_at) }}
                        </div>
                        <div class="mt-3" v-if="isDataOpen">
                            <div class="row">
                                <div class="col-3"></div>
                                <div class="col-6">
                                    <div class="row">
                                        <p class="col h5"><b class="h4">👍</b>{{ squeal.reactions?.like || 0 }}</p>
                                        <p class="col h5"><b class="h4">😂</b>{{ squeal.reactions?.laugh || 0 }}</p>
                                        <p class="col h5"><b class="h4">😍</b>{{ squeal.reactions?.love || 0 }}</p>
                                    </div>
                                    <div class="row">
                                        <p class="col h5"><b class="h4">🤮</b>{{ squeal.reactions?.disgust || 0 }}</p>
                                        <p class="col h5"><b class="h4">👎</b>{{ squeal.reactions?.dislike || 0 }}</p>
                                        <p class="col h5"><b class="h4">🙅</b>{{ squeal.reactions?.disagree || 0 }}</p>
                                    </div>
                                </div>
                                <div class="col-3 text-end text-muted ">Total reactions: {{
                                    (squeal.reactions?.positive_reactions +
                                        squeal.reactions?.negative_reactions) || 0 }}</div>
                            </div>
                        </div>
                        <div class="mt-3" v-if="isCommentOpen">
                            <div v-if="loadMoreCommentsButton && squeal.comments_count > 0">
                                <button type="button" @click="loadMoreComments()"
                                    class="btn btn-secondary btn-rounded px-4 py-2">
                                    <i class="bi bi-arrow-down-circle-fill text-white"></i>
                                </button>
                            </div>
                            <div v-if="squeal.comments_count == 0"> No comments yet.</div>
                            <!-- Lista dei commenti -->
                            <ul class="list-unstyled">
                                <li v-for="comment in comment_section.comments_array">
                                    <p class="m-0 mt-2"> <strong> {{ comment.author_username }}: </strong>{{ comment.text }}
                                    </p>
                                    <div>
                                        <small class="text-muted">
                                            {{ comment.timestamp }}
                                        </small>
                                    </div>

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