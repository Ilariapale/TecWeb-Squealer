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
    },
};

</script>

<template>
    <div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark elements-height desktop-menu">
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
            <li class="nav-item nav-link " data-bs-toggle="pill" data-bs-target="#v-pills-messages" type="button" role="tab"
                aria-controls="v-pills-messages" aria-selected="false">
                <RouterLink :to="{ name: 'messages' }" class="nav-link text-white">
                    <i class="bi bi-chat-dots-fill"></i>
                    Messages
                </RouterLink>
            </li>
            <li class="nav-item nav-link " data-bs-toggle="pill" data-bs-target="#v-pills-profile" type="button" role="tab"
                aria-controls="v-pills-profile" aria-selected="false">
                <a href="/profile/ilapale" class="nav-link text-white">
                    <i class="bi bi-arrow-90deg-left"></i>
                    User website
                </a>
            </li>
        </ul>
        <hr>
        <div class="dropdown">
            <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1"
                data-bs-toggle="dropdown" aria-expanded="false">
                <img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle me-2">
                <strong>mdo</strong>
            </a>
            <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1" style="">
                <li><a class="dropdown-item" href="#">New project...</a></li>
                <li><a class="dropdown-item" href="#">Settings</a></li>
                <li><a class="dropdown-item" href="#">Profile</a></li>
                <li>
                    <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" href="#">Sign out</a></li>
            </ul>
        </div>
    </div>

    <div class="d-flex flex-column flex-shrink-0 bg-dark text-white elements-height mobile-menu">
        <a href="/" class="d-block p-3 link-dark text-decoration-none" title="" data-bs-toggle="tooltip"
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
            <li class="nav-item nav-link  border-bottom " data-bs-toggle="pill" data-bs-target="#v-pills-messages"
                type="button" role="tab" aria-controls="v-pills-messages" aria-selected="false">
                <RouterLink :to="{ name: 'messages' }" class="nav-link py-3 text-white">
                    <i class="bi bi-chat-dots-fill  m-0"></i>
                </RouterLink>
            </li>
            <li class="nav-item nav-link  border-bottom" data-bs-toggle="pill" data-bs-target="#v-pills-home" type="button"
                role="tab" aria-controls="v-pills-home" aria-selected="false">
                <RouterLink :to="{ name: 'home' }" class="nav-link py-3 text-white">
                    <i class="bi bi-arrow-90deg-left  m-0"></i>
                </RouterLink>
            </li>
        </ul>



        <div class="dropdown mt-auto">
            <a href="#"
                class="d-flex align-items-center justify-content-center  mt-auto p-3 link-dark text-decoration-none dropdown-toggle"
                id="dropdownUser3" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle">
            </a>
            <ul class="dropdown-menu text-small shadow" aria-labelledby="dropdownUser3">
                <li><a class="dropdown-item" href="#">New project...</a></li>
                <li><a class="dropdown-item" href="#">Settings</a></li>
                <li><a class="dropdown-item" href="#">Profile</a></li>
                <li>
                    <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" href="#">Sign out</a></li>
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
