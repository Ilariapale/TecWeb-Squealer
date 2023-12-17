<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HeaderSMM from './components/HeaderSMM.vue';
import Sidemenu from './components/Sidemenu.vue';
import Overviewmenu from './components/Overviewmenu.vue';
import { getUser } from "./services/user.service";
import type e from 'cors';


export default {
  components: {
    HeaderSMM,
    Sidemenu,
    Overviewmenu,
    RouterLink,
    RouterView
  },
  data() {
    return {
      user: {},
      vip: {}
    }
  },
  methods: {
    async getUser() {
      await getUser().then((response) => {
        this.user = response;
        return response;
      }).catch((error) => {
        console.log(error);
        return error;
      });
    },
    async getVip(vip: any) {
      if (vip == "none") {
        this.vip = {};
        return;
      }
      await getUser(vip).then((response) => {
        console.log(response);
        this.vip = response;
        return response;
      }).catch((error) => {
        console.log(error);
        return error;
      });
    }
  },
  mounted() {
    this.getUser();
  },
}



</script>


<template>
  <HeaderSMM />
  <main class="container-fluid">
    <div class="row">
      <!-- Menu a sinistra -->
      <div class="col col-auto col-md-3 col-lg-2 p-0">
        <Sidemenu :user="user" />
      </div>

      <!-- Contenuto centrale scrollabile -->
      <div class="col col-md-5 col-lg-6 dashboard elements-height p-0">
        <RouterView :user="user" :vip="vip" />
      </div>

      <!-- Menu a destra -->
      <div class="col col-md-4 col-lg-4 p-0 overview-menu elements-height bg-primary">
        <Overviewmenu :user="user" @update-vip="getVip($event)" :vip="vip" />

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

.overview-menu {
  overflow-y: auto
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
