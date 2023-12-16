<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HeaderSMM from './components/HeaderSMM.vue';
import Sidemenu from './components/Sidemenu.vue';
import Overviewmenu from './components/Overviewmenu.vue';
</script>


<template>
  <HeaderSMM />
  <main class="container-fluid">
    <div class="row">
      <!-- Menu a sinistra -->
      <div class="col col-auto col-md-3 col-lg-2 p-0">
        <Sidemenu />
      </div>

      <!-- Contenuto centrale scrollabile -->
      <div class="col col-md-5 col-lg-6 dashboard elements-height p-0">
        <RouterView />
      </div>

      <!-- Menu a destra -->
      <div class="col col-md-4 col-lg-4 p-0 overview-menu elements-height ">
        <Overviewmenu />
      </div>
    </div>
  </main>
</template>


<style>
.elements-height {
  height: calc(100vh - 76px);
}

.dashboard {
  overflow-y: auto;
  overflow-wrap: break-word;
  overflow-inline: clip;
  overflow-x: hidden;

}

.mobile-menu {
  display: none !important;
}

@media screen and (max-width: 767px) {

  /* Quando lo schermo è più piccolo di 768px, nascondi il menu laterale e mostra il menu alternativo */
  .overview-menu {
    display: none !important;
  }

  .desktop-menu {
    display: none !important;
  }

  .mobile-menu {
    display: block !important;
  }

}
</style>
