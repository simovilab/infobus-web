<template>
  <div id="map" style="height: 400px; width: 100%;"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

onMounted(() => {
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json',
    center: [-84.0517, 9.9361],
    zoom: 16
  })

  // Add marker
  new maplibregl.Marker()
    .setLngLat([-84.0517, 9.9361])
    .setPopup(new maplibregl.Popup().setText('Universidad de Costa Rica'))
    .addTo(map)
})
</script>

<style>
#map {
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
