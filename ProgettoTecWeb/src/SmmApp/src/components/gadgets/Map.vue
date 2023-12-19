<template>
    <ol-map :loadTilesWhileAnimating="true" :loadTilesWhileInteracting="true" style="height: 200px; width:auto"
        :controls="[]" @click="handleMapClick" @error="handleEvent" ref="map">
        <ol-view :center="center" :rotation="rotation" :zoom="zoom" @error="handleEvent" />

        <ol-tile-layer @error="handleEvent">
            <ol-source-osm @error="handleEvent" />
        </ol-tile-layer>
        <ol-overlay :position="[coordinates[0], coordinates[1]]">
            <img src="./ArrowRed.png" class="text-danger" style="height: 20px; width: 20px;" alt="marker" />
        </ol-overlay>
        <!-- <ol-vector-layer> -->
        <ol-vector-layer @error="handleEvent">
            <ol-source-vector ref="vectorTest" @error="handleEvent"></ol-source-vector>
            <ol-style @error="handleEvent">
                <ol-style-icon src="marker.png" @error="handleEvent"></ol-style-icon>
            </ol-style>
        </ol-vector-layer>
        <!--END <ol-vector-layer> -->
    </ol-map>
</template>

<script lang="ts">
//set height: 200px; width:auto in style
import { ref } from 'vue';
import { MapBrowserEvent } from 'ol';
import { useGeographic } from 'ol/proj'; // Import useGeographic from ol/proj
export default {
    setup() {
        const offset = ref(0);
        useGeographic(); // Use useGeographic
        const center = ref([40, 40]);
        const zoom = ref(3);
        const rotation = ref(0);
        const coordinates = ref([0, 0]);
        const handleEvent = (event: any) => {
            console.log(event);
        };

        const handleMapClick = (event: MapBrowserEvent<MouseEvent>) => {
            coordinates.value = event.coordinate;
        };

        return {
            center,
            zoom,
            rotation,
            offset,
            coordinates,
            handleMapClick,
            handleEvent,
        };
    },
};
</script>
