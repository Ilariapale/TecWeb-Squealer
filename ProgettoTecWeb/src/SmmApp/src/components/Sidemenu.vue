<script setup lang="ts">
</script>

<template>
    <div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark elements-height desktop-menu">
        <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
            <svg class="bi me-2" width="40" height="32">
                <use xlink:href="#bootstrap"></use>
            </svg>
            <span class="fs-4">Menu</span>
        </a>
        <hr>
        <ul class="nav nav-pills flex-column mb-auto">
            <li class="nav-item">
                <a href="#" class="nav-link active" aria-current="page">
                    <i class="bi bi-house-door"></i>
                    Home
                </a>
            </li>
            <li>
                <a href="#" class="nav-link text-white">
                    <i class="bi bi-people-fill"></i>
                    VIP requests
                </a>
            </li>
            <li>
                <a href="#" class="nav-link text-white">
                    <i class="bi bi-shop"></i>
                    Shop
                </a>
            </li>
            <li>
                <a href="#" class="nav-link text-white">
                    <i class="bi bi-chat-dots-fill"></i>
                    Messages
                </a>
            </li>
            <li>
                <a href="#" class="nav-link text-white">
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
        <ul class="nav nav-pills nav-flush flex-column text-center mb-auto">
            <li class="nav-item">
                <a href="#" class="nav-link active py-3 border-bottom text-white" aria-current="page" title=""
                    data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Home">
                    <i class="bi bi-house-door  m-0"></i>
                </a>
            </li>
            <li>
                <a href="#" class="nav-link py-3 border-bottom text-white" title="" data-bs-toggle="tooltip"
                    data-bs-placement="right" data-bs-original-title="VIPrequest">
                    <i class="bi bi-people-fill m-0"></i>
                </a>
            </li>
            <li>
                <a href="#" class="nav-link py-3 border-bottom text-white" title="" data-bs-toggle="tooltip"
                    data-bs-placement="right" data-bs-original-title="Shop">
                    <i class="bi bi-shop  m-0"></i>
                </a>
            </li>
            <li>
                <a href="#" class="nav-link py-3 border-bottom text-white" title="" data-bs-toggle="tooltip"
                    data-bs-placement="right" data-bs-original-title="Messages">
                    <i class="bi bi-chat-dots-fill  m-0"></i>
                </a>
            </li>
            <li>
                <a href="#" class="nav-link py-3 border-bottom text-white" title="" data-bs-toggle="tooltip"
                    data-bs-placement="right" data-bs-original-title="UserWebsite">
                    <i class="bi bi-arrow-90deg-left  m-0"></i>
                </a>
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
