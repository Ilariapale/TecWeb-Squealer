<template>
    <ol-map :loadTilesWhileAnimating="true" :loadTilesWhileInteracting="true" style="height: 200px; width:auto"
        @click="handleMapClick">
        <ol-view ref="view" :center="center" :rotation="rotation" :zoom="zoom" />

        <ol-tile-layer>
            <ol-source-osm />
        </ol-tile-layer>
        <ol-mouseposition-control />
        <ol-layer-vector>
            <ol-source-vector ref="vectorSource" />
            <ol-style>
                <ol-style-icon :src="markerIcon" :scale="0.1" />
            </ol-style>
        </ol-layer-vector>
    </ol-map>
</template>

<script lang="ts">
import { ref, inject } from 'vue';
import { Feature, MapBrowserEvent } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { click } from 'ol/events/condition';

export default {
    setup() {
        const center = ref([40, 40]);
        const zoom = ref(3);
        const rotation = ref(0);
        const markerIcon = './663342.png';

        // Rimossa l'iniezione di 'ol-format' in quanto non utilizzata nel codice

        const vectorSource = new VectorSource();

        const handleMapClick = (event: MapBrowserEvent<MouseEvent>) => {
            const coordinates = event.coordinate;
            const features = vectorSource.getFeatures();
            console.log(coordinates)
            // Rimuovi il vecchio marker
            features.forEach((feature) => vectorSource.removeFeature(feature));

            // Aggiungi un nuovo marker
            const marker = new Feature({
                geometry: new Point(coordinates),
            });
            console.log(marker)
            console.log(vectorSource)

            vectorSource.addFeature(marker);
        };

        return {
            center,
            zoom,
            rotation,
            markerIcon,
            handleMapClick,
        };
    },
};
</script>