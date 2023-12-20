<script  lang="ts">
import { RouterLink, RouterView } from 'vue-router'
export default {
    data() {
        return {
            isClicked: false,
        };
    },
    props: {
        user: {
            type: Object,
            required: true
        },
        vip: {
            type: Object,
            required: true
        },
    },
    methods: {
        logout() {
            localStorage.removeItem('Authorization');
            sessionStorage.removeItem('Authorization');
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            //reindirizzo al sito /login
            window.location.href = "/login";
        },
    },
};

</script>

<template>
    <div id="menu-desktop"
        class="d-flex flex-column flex-shrink-0 p-3 unselectable text-white bg-dark elements-height desktop-menu">
        <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
            <svg class="bi me-2" width="40" height="32">
            </svg>
            <span class="fs-4">Menu</span>
        </a>
        <hr>
        <ul class="nav nav-pills flex-column mb-auto" role="tablist" aria-orientation="vertical">
            <li class="nav-item nav-link active" data-bs-toggle="pill" data-bs-target="#v-pills-home" type="button"
                role="tab" aria-controls="v-pills-home" aria-selected="true">
                <RouterLink :to="{ name: 'dashboard' }" class="nav-link text-white" aria-current="page">
                    <i class="bi bi-house-door"></i>
                    Home
                </RouterLink>
            </li>
            <li class="nav-item nav-link " data-bs-toggle="pill" data-bs-target="#v-pills-VIPrequests" type="button"
                role="tab" aria-controls="v-pills-VIPrequests" aria-selected="false">

                <RouterLink :to="{ name: 'vip-requests' }" class="nav-link text-white">
                    <i class="bi bi-people-fill"></i>
                    VIP requests
                </RouterLink>
            </li>
            <li class="nav-item nav-link " data-bs-toggle="pill" data-bs-target="#v-pills-shop" type="button" role="tab"
                aria-controls="v-pills-shop" aria-selected="false">
                <RouterLink :to="{ name: 'shop' }" class="nav-link text-white">
                    <i class="bi bi-shop text-white"></i>
                    Shop
                </RouterLink>
            </li>
            <li class="nav-item nav-link " data-bs-toggle="pill" data-bs-target="#v-pills-SMMprofile" type="button"
                role="tab" aria-controls="v-pills-SMMprofile" aria-selected="false">
                <a :href="'/profile/' + user.username" class="nav-link text-white">
                    <i class="bi bi-person-fill"></i>
                    Visit {{ user.username }}
                </a>
            </li>
            <li v-if="vip.username != undefined" class="nav-item nav-link " data-bs-toggle="pill"
                data-bs-target="#v-pills-VIPprofile" type="button" role="tab" aria-controls="v-pills-VIPprofile"
                aria-selected="false">
                <a :href="'/profile/' + vip.username" class="nav-link text-white">
                    <i class="bi bi-arrow-90deg-left"></i>
                    Visit {{ vip.username }}
                </a>
            </li>
        </ul>
        <hr>
        <div class=" mt-auto">
            <ul class="ps-1" role="tablist">
                <li class="nav-item nav-link " data-bs-toggle="pill" type="button" role="tab" aria-selected="false"
                    @click="logout()">
                    <a>
                        <i class="bi bi-box-arrow-left"> </i>
                    </a>
                    Logout
                </li>
            </ul>
        </div>
    </div>

    <div id="menu-mobile" class="d-flex flex-column flex-shrink-0 bg-dark text-white elements-height mobile-menu">
        <a class="d-block p-3 link-dark text-decoration-none" title="mobile menu" data-bs-toggle="tooltip"
            data-bs-placement="right" data-bs-original-title="Icon-only">
            <svg class="bi" width="40" height="32">
                <use xlink:href="#bootstrap"></use>
            </svg>
            <span class="visually-hidden">Icon-only</span>
        </a>
        <ul class="nav nav-pills nav-flush flex-column text-center mb-auto" role="tablist" aria-orientation="vertical">
            <li class="nav-item nav-link active border-bottom" data-bs-toggle="pill" data-bs-target="#v-pills-home"
                type="button" role="tab" aria-controls="v-pills-home" aria-selected="true">
                <RouterLink :to="{ name: 'dashboard' }" class="nav-link  py-3  text-white">
                    <i class="bi bi-house-door  m-0"></i>
                </RouterLink>
            </li>
            <li class="nav-item nav-link  border-bottom" data-bs-toggle="pill" data-bs-target="#v-pills-VIPrequests"
                type="button" role="tab" aria-controls="v-pills-VIPrequests" aria-selected="false">
                <RouterLink :to="{ name: 'vip-requests' }" class="nav-link py-3 text-white">
                    <i class="bi bi-people-fill m-0"></i>
                </RouterLink>
            </li>
            <li class="nav-item nav-link  border-bottom" data-bs-toggle="pill" data-bs-target="#v-pills-shop" type="button"
                role="tab" aria-controls="v-pills-shop" aria-selected="false">
                <RouterLink :to="{ name: 'shop' }" class="nav-link py-3 text-white">
                    <i class="bi bi-shop  m-0"></i>
                </RouterLink>
            </li>
            <li class="nav-item nav-link  border-bottom" data-bs-toggle="pill" data-bs-target="#v-pills-home" type="button"
                role="tab" aria-controls="v-pills-home" aria-selected="false">
                <p :href="'profile/' + user.username" class="nav-link py-3 text-white">
                    <i class="bi bi-person-fill  m-0"></i>
                </p>
            </li>
            <li v-if="vip.username" class="nav-item nav-link  border-bottom" data-bs-toggle="pill"
                data-bs-target="#v-pills-home" type="button" role="tab" aria-controls="v-pills-home" aria-selected="false">
                <p :href="'profile/' + vip.username" class="nav-link py-3 text-white">
                    <i class="bi bi-arrow-90deg-left  m-0"></i>
                </p>
            </li>
        </ul>
        <div class="pt-5 mt-auto">
            <ul role="tablist">

                <li class="nav-item nav-link" data-bs-toggle="pill" type="button" role="tab" aria-selected="false"
                    @click="logout()">
                    <i class="bi bi-box-arrow-right "> </i>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.nav-link {
    font-size: 17px;
}

.bi {
    margin-right: 8px;
}

a {
    padding: 4px;
    padding-bottom: 16px;
    padding-top: 16px;
}
</style>
