<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HeaderSMM from './components/HeaderSMM.vue';
import Sidemenu from './components/Sidemenu.vue';
import Overviewmenu from './components/Overviewmenu.vue';
import { getUser } from "./services/user.service";
import { getPrices } from "./services/squeal.service";
import MobileVipSelector from './components/gadgets/MobileVipSelector.vue';

export default {
  components: {
    HeaderSMM,
    Sidemenu,
    Overviewmenu,
    RouterLink,
    RouterView,
    MobileVipSelector
  },
  data() {
    return {
      user: {} as any,
      vip: {} as any,
      prices: {},
      char_spent: 0,
      vips_usernames: []
    }
  },
  methods: {
    async getUser() {
      await getUser().then((response) => {
        if (response == undefined) {
        }
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
        return this.vip;
      }
      await getUser(vip).then((response) => {
        this.vip = response;
        return response;
      }).catch((error) => {
        console.log(error);
        return error;
      });
    },
    async getPrices() {
      await getPrices().then((response) => {
        this.prices = response;
        return response;
      }).catch((error) => {
        console.log(error);
        return error;
      });
    },
    async updateChar(username: string) {

      await this.getVip(username);
    },
    updateVipsArray(vips: any) {
      this.vips_usernames = vips;
    },
    async updateCharacters(tier: string) {
      await this.getVip(this.vip.username);
    },

  },
  mounted() {
    this.getUser();
    this.getPrices();
  },
}
</script>

<template>
  <HeaderSMM />
  <main v-if="user && user.account_type == 'professional' && user.professional_type == 'SMM'" class="container-fluid">
    <div class="row">
      <!-- Menu a sinistra -->
      <div class="col col-auto col-md-3 col-lg-2 p-0">
        <Sidemenu :user="user" :vip="vip" />
      </div>

      <!-- Contenuto centrale scrollabile -->
      <div class="col col-md-5 col-lg-6 dashboard elements-height p-0">
        <RouterView :prices="prices" :user="user" :vip="vip" @vip-request-accepted="getUser()"
          @squeal-posted="updateChar($event)" @updateChars="updateCharacters($event)" />
      </div>

      <!-- Menu a destra -->
      <div class="col col-md-4 col-lg-4 p-0 overview-menu elements-height bg-primary">
        <Overviewmenu :user="user" @update-vip="getVip($event)" @update-vips-array="updateVipsArray($event)"
          @updateChars="updateCharacters($event)" @remove-vip="getUser()" :vip="vip" />
      </div>

      <div class="mobile-overview-menu">
        <MobileVipSelector :vips_usernames="vips_usernames" @update-vip="getVip($event)"
          :selected_vip_out="vip.username || 'none'">
        </MobileVipSelector>
      </div>


    </div>
  </main>
  <main v-else-if="user.username">
    <div class="center-screen unselectable">
      <h1 class="text-center">You do not have access to this page</h1>
      <p>You have to be a Social Media Manager to see this page</p>
    </div>
  </main>
  <main v-else>
    <div class="center-screen unselectable">
      <h1 class="text-center"><a href="/login">Log in</a> as a Social Media Manager to access this page</h1>
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

.mobile-overview-menu {
  display: none !important;
}

@media screen and (max-width: 767px) {

  /* Quando lo schermo è più piccolo di 768px, nascondi il menu laterale e mostra il menu alternativo */
  .overview-menu {
    display: none !important;
  }

  .mobile-overview-menu {
    display: block !important;
  }

  .desktop-menu {
    display: none !important;
  }

  .mobile-menu {
    display: block !important;
  }

}
</style>
