<script setup lang="ts">
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
                                HEX
                            </div>
                            <div class="col text-end">
                                <i class="bi bi-trash" type="button"></i>
                            </div>

                        </div>
                    </div>


                    <div class="card-body p-2">
                        <h5 class="card-title">@username</h5>
                        <p class="card-text">
                            content</p>
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
                                    <button id="comment_button" type="button" class="btn btn-secondary btn-rounded px-2">
                                        <i class="bi bi-chat-dots-fill"></i>
                                        <p class="badge bg-danger ms-2 my-auto">0 comm</p>
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
                            <h4>Comments</h4>
                            <button>Load more</button>
                            <!-- Lista dei commenti -->
                            <ul class="list-unstyled">
                                <li>*ngFor="let comment of comment_section.comments_array"
                                    <p><strong>comment.author_username</strong>: comment.text</p>
                                </li>
                            </ul>

                            <!-- Modulo per aggiungere un nuovo commento -->

                            <div class="input-group mb-3">
                                <input type="text" class="form-control" placeholder="Insert your comment..."
                                    aria-label="Recipient's username" aria-describedby="button-addon2">
                                <button class="btn btn-outline-secondary" type="button" id=" button-addon2">Post</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>