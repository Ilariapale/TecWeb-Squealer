<template>
    <form @submit.prevent="postSqueal" id="newSquealForm">
        <ul class="nav justify-content-center nav-pills mb-3 " role="tablist" id="squeal-types-ul">
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
                <textarea v-model="squeal_input" class="form-control p-4 py-3" id="newSquealFormText" rows="3"
                    @input="updateCharacterCount"></textarea>
                <small class="position-absolute end-2 p-1 topright"
                    :class="{ 'text-danger': !isEnough, 'text-primary': isEnough }"><b>{{
                        charCount }}</b></small>
                <!-- fine text squeal -->
            </div>
            <div class="tab-pane fade justify-content-center col-8" id="pills-image-squeal" role="tabpanel"
                aria-labelledby="pills-image-squeal-tab" tabindex="0">
                <!-- image squeal -->
                <div class="input-group mb-3">
                    <input type="file" class="form-control" accept="image/*" name="image" id="imageInput"
                        v-on:change="handleImageChange">
                    <label class="input-group-text" for="imageInput">Upload</label>
                </div>
                <!-- fine image squeal -->
            </div>
            <div class="tab-pane fade justify-content-center col-8" id="pills-video-squeal" role="tabpanel"
                aria-labelledby="pills-video-squeal-tab" tabindex="0">
                <!-- video squeal -->
                <div class="input-group mb-3">
                    <input type="file" class="form-control" accept="video/*" name="video" id="videoInput"
                        v-on:change="handleVideoChange">
                    <label class="input-group-text" for="videoInput">Upload</label>
                </div>
                <!-- fine video squeal -->
            </div>
            <div class="tab-pane fade justify-content-center col-8" id="pills-position-squeal" role="tabpanel"
                aria-labelledby="pills-position-squeal-tab" tabindex="0">
                <!-- position squeal -->
                <MapVue ref="mapChild"></MapVue>
                <!-- fine position squeal -->
            </div>
            <label for="newSquealFormText" class="form-label">New Squeal</label>
            <div class="pb-1">
                <button :disabled='!isEnough' type="submit" class="btn btn-primary ">Submit</button>
            </div>
            <div v-if="postSuccess" mode="out-in" class="text-success pb-2">Post send correctly!</div>
            <div v-if="postError" mode="out-in" class="text-danger pb-2">{{ errorText }}</div>
        </div>

        <div id="recipientsDiv" class="row justify-content-center tab-content pb-3">
            <i class="bi bi-tags-fill clickable h4" data-bs-toggle="collapse" href="#recipients" role="button"
                aria-expanded="false" aria-controls="recipients"></i>
            <div id="recipients" class="collapse row justify-content-center tab-content pb-3">
                <div class="col-4">
                    <div class="input-group mb-3">
                        <span class="input-group-text col-3 justify-content-center" id="basic-addon1">@</span>
                        <input v-model="tagInput['user']" v-on:keyup.space="addTag('user')" type="text" class="form-control"
                            placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
                    </div>
                    <div class="overflow-auto scroll unselectable mb-3 border-primary rounded"
                        :class="{ 'border': tags['user'].length > 0 }">
                        <div v-for="tag of tags['user']" class="tag border">
                            <span>@</span>{{ tag }}
                            <span class="delete" @click="removeTag('user', tag)">x</span>
                        </div>
                    </div>

                </div>
                <div class="col-4">
                    <div class="input-group mb-3">
                        <span class="input-group-text col-3 justify-content-center" id="basic-addon1">§</span>
                        <input v-model="tagInput['channel']" v-on:keyup.space="addTag('channel')" type="text"
                            class="form-control" placeholder="Channel" aria-label="Username"
                            aria-describedby="basic-addon1">
                    </div>

                    <div class="overflow-auto scroll unselectable mb-3 border-primary rounded"
                        :class="{ 'border': tags['channel'].length > 0 }">
                        <div v-for="tag of tags['channel']" class="tag border">
                            <span>@</span>{{ tag }}
                            <span class="delete" @click="removeTag('channel', tag)">x</span>
                        </div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="input-group mb-3">
                        <span class="input-group-text col-3 justify-content-center" id="basic-addon1">#</span>
                        <input v-model="tagInput['keyword']" v-on:keyup.space="addTag('keyword')" type="text"
                            class="form-control" placeholder="Keyword" aria-label="Username"
                            aria-describedby="basic-addon1">
                    </div>

                    <div class="overflow-auto scroll unselectable mb-3 border-primary rounded"
                        :class="{ 'border': tags['keyword'].length > 0 }">
                        <div v-for="tag of tags['keyword']" class="tag border">
                            <span>@</span>{{ tag }}
                            <span class="delete" @click="removeTag('keyword', tag)">x</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>



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

.tag {
    display: inline-block;
    margin: 1px;
    padding: 1px 2px;
    background-color: #f2f2f2;
    border-radius: 5px;
    color: rgb(33, 37, 41);
}

.tag span {
    margin-left: 5px;
    cursor: pointer;
}

.tag span.delete {
    color: red;
}

.special-char {
    width: 40px;
    justify-content: center;
}
</style>
<script lang=ts>
import MapVue from './Map.vue';
import { ref } from "vue";
import { postSqueal } from '@/services/squeal.service';
import { postImage, postVideo } from '@/services/media.service';

export default {
    setup() {
        const image = ref<File | null>();
        const video = ref<File | null>();

        let imageInput = ref<HTMLInputElement>(null as unknown as HTMLInputElement);
        let videoInput = ref<HTMLInputElement>(null as unknown as HTMLInputElement);
        let price = 0;

        const mapChild = ref<typeof MapVue>(null as unknown as typeof MapVue);

        let errorText = ref<string>('Something went wrong');
        let postSuccess = ref<boolean>(false);
        let postError = ref<boolean>(false);

        const tags = ref<{ [key: string]: string[] }>({
            "user": [],
            "channel": [],
            "keyword": [],
        });
        const tagInput = ref<{ [key: string]: string }>({
            "user": '',
            "channel": '',
            "keyword": '',
        });

        let currentTab = ref<string>('text');

        function handleImageChange($event: Event) {
            imageInput = ref($event.target as HTMLInputElement);
            if (imageInput && imageInput.value.files) {
                image.value = imageInput.value.files[0];
            }
        }
        function handleVideoChange($event: Event) {
            videoInput = ref($event.target as HTMLInputElement);
            if (videoInput && videoInput.value.files) {
                video.value = videoInput.value.files[0];
            }
        }
        return {
            handleImageChange,
            handleVideoChange,
            currentTab,
            tags,
            tagInput,
            image,
            video,
            price,
            imageInput,
            videoInput,
            postSuccess,
            postError,
            errorText,
            mapChild
        }
    },
    data() {
        return {
            squeal_input: "",
            charCount: 0,
            isEnough: true,
            positionData: null,
        };
    },
    methods: {
        //lò,òl
        resetInputs() {
            const myForm = document.getElementById("newSquealForm") as HTMLFormElement;
            if (myForm) myForm.reset();
            console.log(myForm)
            this.squeal_input = "";
            this.charCount = 0;
            this.updateCharacterCount()
        },

        async postSqueal() {
            this.getRecipients();
            if (this.currentTab == "text") {
                await this.postTextSqueal();
            } else if (this.currentTab == "image") {
                await this.postImageSqueal();
            } else if (this.currentTab == "video") {
                await this.postVideoSqueal();
            } else if (this.currentTab == "position") {
                await this.postPositionSqueal();
            }
        },

        async postTextSqueal() {
            const recipients = this.getRecipients();
            postSqueal(this.vip._id, this.squeal_input, recipients, "text").then((squeal) => {
                this.$emit("squeal-posted", this.vip.username);
                //console.log(squeal)
                this.resetInputs();
                this.postSuccess = true;
                setTimeout(() => {
                    this.postSuccess = false;
                }, 3000);
            }).catch((error) => {
                this.errorText = error
                this.postError = true;
                setTimeout(() => {
                    this.postError = false;
                }, 3000);
            })

        },
        async postImageOrVideoSqueal(type: "image" | "video", content: string = "") {
            postSqueal(this.vip._id, content, this.getRecipients(), type).then((squeal) => {
                this.$emit("squeal-posted", this.vip.username);
                this.resetInputs();
                //console.log(squeal)
                this.postSuccess = true;
                setTimeout(() => {
                    this.postSuccess = false;
                }, 3000);
            }).catch((error) => {
                this.errorText = error
                this.postError = true;
                setTimeout(() => {
                    this.postError = false;
                }, 3000);
            })

        },
        async postImageSqueal() {
            //console.log(this.image)
            //console.log(this.image as File)
            postImage(this.image as File).then(async (response) => {
                //console.log(response)
                await this.postImageOrVideoSqueal("image", response.name);
            }).catch((error) => {
                this.errorText = error
                this.postError = true;
                setTimeout(() => {
                    this.postError = false;
                }, 3000);
            })
        },
        async postVideoSqueal() {
            //console.log(this.video)
            //console.log(this.video as File)
            postVideo(this.video as File).then(async (response) => {
                //console.log(response)
                await this.postImageOrVideoSqueal("video", response.name);
            }).catch((error) => {
                this.errorText = error
                this.postError = true;
                setTimeout(() => {
                    this.postError = false;
                }, 3000);
            })
        },


        async postPositionSqueal() {
            const mapChild = this.$refs.mapChild as any;
            const coordinates = mapChild.getCoordinates();
            if (coordinates == null) {
                this.errorText = "Position not selected";
                this.postError = true;
                setTimeout(() => {
                    this.postError = false;
                }, 3000);
                return;
            }
            const content = `${coordinates[0]} ${coordinates[1]}`
            postSqueal(this.vip._id, content, this.getRecipients(), "position").then((squeal) => {
                this.$emit("squeal-posted", this.vip.username);
                this.resetInputs();
                mapChild.deletePoint();
                this.postSuccess = true;
                setTimeout(() => {
                    this.postSuccess = false;
                }, 3000);
            }).catch((error) => {
                this.errorText = error
                this.postError = true;
                setTimeout(() => {
                    this.postError = false;
                }, 3000);
            })
        },

        addTag(type: string) {
            const tags = this.tags[type];
            const tagInput = this.tagInput[type];
            if (this.tagInput && !tags.includes(tagInput) && tagInput.trim() !== '') {
                const tag = tagInput.replace(/\s/g, '');
                //se il tag è già presente non aggiungerlo e svuota l'input
                if (tags.includes(tag)) {
                    this.tagInput[type] = '';
                    return;
                }
                this.tags[type].push(tag);
                this.tagInput[type] = '';
            }
        },
        removeTag(type: string, tag: string) {
            this.tags[type] = this.tags[type].filter((t) => t !== tag);

        },

        getRecipients() {
            return {
                users: this.tags['user'],
                channels: this.tags['channel'],
                keywords: this.tags['keyword'],
            }
        },

        updateCharacterCount() {
            this.charCount = this.squeal_input.length;
            this.isEnough = this.enoughChar();
        },
        enoughChar() {
            //console.log(this.vip.char_quota)
            //console.log("prices", this.prices)
            if (this.prices == null || !this.vip.char_quota) return false;
            if (this.currentTab == "text") this.price = this.charCount;
            else if (this.currentTab == "image") this.price = this.prices?.image_squeal;
            else if (this.currentTab == "video") this.price = this.prices?.video_squeal;
            else if (this.currentTab == "position") this.price = this.prices?.position_squeal;
            const enoughDaily = this.price <= this.vip.char_quota.daily + this.vip.char_quota.extra_daily;
            const enoughWeekly = this.price <= this.vip.char_quota.weekly + this.vip.char_quota.extra_daily;
            const enoughMonthly = this.price <= this.vip.char_quota.monthly + this.vip.char_quota.extra_daily;
            const atLeastOne = this.vip.char_quota.daily > 0 && this.vip.char_quota.weekly > 0 && this.vip.char_quota.monthly > 0;
            return enoughDaily && enoughWeekly && enoughMonthly && atLeastOne;
        },
    },
    props: {
        vip: {
            type: Object,
            required: true
        },
        prices: {
            type: Object,
            required: true
        }
    },
    watch: {
        vip: {
            handler: function () {
                this.isEnough = this.enoughChar();
            },
            deep: true
        },
    },
    mounted() {
        const tabEl = document.querySelectorAll('#squeal-types-ul button[data-bs-toggle="pill"]');
        tabEl?.forEach(tab => tab.addEventListener('shown.bs.tab', event => {
            const tab = (event.target as HTMLElement).attributes.getNamedItem('data-bs-target')?.value;
            this.currentTab = tab?.split('-')[1] ?? 'text';
            this.isEnough = this.enoughChar();
        }))
    },
    components: { MapVue }
}

</script>