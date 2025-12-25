# `ShapeMap`

Información de un componente de Mapa.

### Referencias

## 1. Componente

- Nombre: `ShapeMap`
- Archivo ([SFC](https://vuejs.org/guide/scaling-up/sfc)): `components/ShapeMap.vue`

## 2. Descripción

Desplegar información de una agencia de transporte público (empresa de autobuses, por ejemplo) en un arreglo de tarjetas (_cards_).

## 3. Propiedades (_props_)

Todas los campos (_fields_) de la tabla `shapeMap.txt` de GTFS.

| Nombre            | Tipo   | Requerido | Valor por defecto | Descripción               |
| ----------------- | ------ | --------- | ----------------- | ------------------------- |
| `agency_id`       | String | Sí        | -                 | Descripción de la prop    |

## 4. Fuentes de datos

### Infobús API

- **Endpoint(s):** `GET /shapemap/:id`
- **Momento de llamada:** Al montar el componente (`onMounted`)
- **Estructura esperada de respuesta:**

```json
{
  "url": "https://infobus.bucr.digital/api/shapemap/1/",
}
```

- ¿Usa Vuex / Pinia / llamada directa a la API?: Directa a la API.

### Infobús Admin API

TODO:

## 5. Estructura visual (_template_)

PrimeVue

- [Card](https://primevue.org/card/)

## 6. Eventos emitidos

TODO:

## 7. Plazas (_slots_)

TODO:

## 8. Dependencias internas

TODO:

## 9. Estado interno y propiedades reactivas

TODO:
- Variables internas (`data`): no tiene.
- Propiedades computadas (`computed`): no tiene.
- Observadores (`watch`) relevantes: no tiene.

## 10. Comportamiento y lógica

TODO:
- Lógica interactiva del componente: no tiene.
- Reglas condicionales de renderizado: no tiene.

## 11. Accesibilidad y responsividad

TODO:
- Comportamiento esperado en pantallas pequeñas, medianas y grandes
- Accesibilidad (navegación por teclado, ARIA roles, etc.)

## 12. Pruebas

TODO:
- Escenarios que se deben cubrir con pruebas unitarias o de integración
- Mock de datos esperados

## Ejemplo de implementación

### Resultado

```html
<script setup>
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
```
<script setup>
import ShapeMap from '../../.vitepress/components/ShapeMap.vue';
</script>

<ShapeMap />

---

<AgencyCard
  :agency_id="id"
  :agency_name="name"
  :agency_url="url"
  :agency_phone="phone"
  :agency_fare_url="fareUrl"
/>

---

### Código fuente

<<< @/.vitepress/components/ShapeMap.vue
