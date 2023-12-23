import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import OpenLayersMap from 'vue3-openlayers';

import './../node_modules/vue3-openlayers/dist/main.css';
const app = createApp(App);

app.use(OpenLayersMap);
app.use(router);

app.mount('#app');
