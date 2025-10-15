# Integración con Infobús API

La fuente principal de datos para la aplicación es la API de Infobús. Esta API proporciona información sobre las rutas, paradas y horarios de los autobuses en tiempo real, mayormente en formato GTFS.

## Datos geoespaciales

En este apartado se explica el uso de los datos geoespaciales para poder visualizar los distintos elementos en los mapas, como rutas de bus, buses que pasan por las rutas, buses en movimiento en tiempo real y demás, y cómo es que se obtienen estos datos(como por el uso de infobus API o websockets).

- Incluir endpoints de la API que proporcionan datos geoespaciales.
  - `geoshapes/`

  Endpoint utilizado para obtener las rutas en GeoJSON, el cual nos devuelve en ese formato los datos necesarios para poder dibujar en los mapas las rutas que necesitemos mostrar, ya sean varias al mismo tiempo, o solo unas rutas en específico

  - `geo-stops/`

  TODO: Completar con el endpoint que corresponde, no se encontró un endpoint `geo-stops/` en la documentación de infobus API

  - `vehicle-positions/`

  Este endpoint proporciona datos en tiempo real sobre la posición y el estado de los vehículos (buses) en operación dentro del sistema de transporte. 
  
  Está diseñado para ser consumido cuando se necesita visualizar la ubicación y condiciones de los buses en un mapa, junto con detalles relevantes como su ocupación, accesibilidad, plaza para identificación y estado del tráfico.
  Su uso en este caso seria para la visualización del estado de los buses al ser visualizados en los mapas, y cuando un usuario desee conocer información sobre un bus en específico, el cual se le facilita al usuario la capacidad de obtener más información cuando ve los buses en los mapas por ejemplo, y sea capaz de obtener más información sobre el bus en específico, proveyendo datos importantes como la accesibilidad de sillas de ruedas en el bus; que tantas personas hay dentro del bus y si va lleno o no; o el estado del tráfico con el que el bus se encuentra.

  Otro tipo de datos útiles que provee el endpoint son datos de administración, como el modelo del bus `model`; la marca del bus `brand`; el número serial `serial_number` etc, los cuales pueden servir para uso interno, monitoreo y observabilidad, lo cual ayuda mucho en sistemas grandes como este.

  - `service-alerts/`
  
  Este endpoint entrega información sobre alertas activas en el sistema de transporte, como cierres de vías, desvíos, interrupciones o eventos que afectan el servicio normal para mostrar advertencias visuales en el mapa o para comunicar a los usuarios interrupciones en el servicio en general.

  Uso del endpoint:
  * **alert_id**: Identificador único de la alerta, usado como clave interna o para eliminar duplicados.
  * **alert_header**: Texto breve que se muestra como título de una advertencia en el mapa o interfaz.
  * **alert_description**: Descripción completa de lo que ocurre con toda la información para los usuarios.
  * **alert_url**: Enlace a una página más detallada sobre la alerta.


- Documentación: https://infobus.bucr.digital/api/docs
- GeoJSON (brevísima explicación y referencia)

GeoJSON es un formato basado en JSON diseñado específicamente para representar datos geoespaciales, y es el formato preferido para visualizar elementos en mapas web, ya que es ampliamente compatible con bibliotecas modernas como MapLibre, Leaflet y Mapbox.

Además de poder graficar los distintos elementos para la visualización de rutas, buses, paradas, etc en los mapas, GeoJSON permite también incluir propiedades asociadas a cada objeto, lo que facilita mostrar información adicional como el número de placa del bus, nivel de ocupación, o mensajes de alerta, entre otros, lo cual es muy útil a la hora de procesar la información que se va a mostrar en los mapas con el nivel de detalle deseado para los usuarios finales.


- Especificar los formatos de datos geoespaciales utilizados (GeoJSON, KML, etc.).

Se utiliza solamente el formato GeoJSON para representar y visualizar datos geoespaciales. Es un estándar ampliamente soportado en la web, ideal para trabajar con mapas interactivos como los que ofrece MapLibre. 

A continuación se presenta un ejemplo de GeoJSON sobre datos de un bus, el cual contiene su ubicación, la forma en la que se va a dibujar en el mapa, y además de eso datos extra que se pueden usar para mostrar información adicional al usuario si desea conocer más sobre el bus, como su estado.
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-84.0515, 9.9382]
  },
  "properties": {
    "id": "MEYS-8236",
    "label": "MEYS-8236",
    "license_plate": "SJB 9876",
    "occupancy_percentage": 95,
    "status": "STOPPED_AT"
  }
}
```

- Descripción de cómo se integran estos datos en la aplicación (cuáles componentes utilizan estos datos, cómo se visualizan en el mapa, etc.).

### Herramientas de visualización

- MapLibre
MapLibre es un proyecto open source el cual permite a desarrolladores visualizar mapas, objetos sobre los mapas y demás funcionalidades dinámicas relacionadas, esto esta hecho en Javascript vainilla, lo que lo hace perfecto para usar junto a Vue, ya que no se necesita ningún paso extra que realizar para poder usarlo. Además de esto, MapLibre ofrece mejor rendimiento que otras opciones como Leaflet, junto a más funcionalidades que pueden ser de mucha ayuda en este sistema.

La forma en la que se usa MapLibre será solo instalando el paquete `npm install maplibre-gl`, y con esto ya somos capaces de crear y modificar mapas con lo que necesitemos, esto sumado a que MapLibre puede consumir GeoJSON para representar los objetos que queramos en los mapas, nos permite un desarrollo mucho más cómodo.


### Componentes desarrollados
