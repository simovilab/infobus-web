# Inteligencia Artificial en Infobús

La inteligencia artificial (IA), y particularmente los modelos extensos de lenguaje (LLM), están transformando la forma en que las personas interactúan con sistemas digitales. En el contexto del transporte público, la IA permite crear interfaces más accesibles e intuitivas, como asistentes conversacionales capaces de responder en lenguaje natural.

El proyecto Infobús implementa un **chat inteligente de búsqueda** utilizando el **Model Context Protocol (MCP)** en conjunto con la **Infobús API**, cuya base de datos está estructurada siguiendo el estándar **GTFS (General Transit Feed Specification)**.

---

## ¿Qué es el Model Context Protocol (MCP)?

El **MCP** es un protocolo abierto propuesto por Anthropic que permite conectar modelos de lenguaje con fuentes de datos en tiempo real, como APIs o documentos locales. Esto convierte al modelo en un **agente inteligente**, capaz de realizar búsquedas contextuales e interactuar con su entorno.

MCP se adapta perfectamente a los requisitos de interoperabilidad, neutralidad tecnológica y unicidad de la información que exige un sistema moderno de información de transporte público.

---

## ¿Qué buscamos lograr?

Mediante la integración de MCP con la Infobús API, el objetivo es que las personas usuarias puedan consultar el sistema a través de preguntas como:

- ¿Cuáles buses paran aquí?
- ¿Por dónde viene el bus L1?
- ¿A qué hora pasa el próximo bus hacia Derecho?
- ¿Cuál es el estado de ocupación del bus actual?

Estas consultas serán respondidas automáticamente utilizando datos en tiempo real extraídos del backend Infobús®.

---

## Herramientas MCP propuestas

Para lograr esto, se implementan herramientas (tools) MCP que actúan como puentes entre el modelo de lenguaje y la API. Las herramientas definidas se alinean con los dominios de información de GTFS:

| Dominio GTFS             | Herramienta MCP      | Endpoint API           | Descripción breve |
|--------------------------|----------------------|------------------------|--------------------|
| Paradas                  | `get_stops`          | `/stops/`              | Ubicación, accesibilidad |
| Rutas                    | `get_routes`         | `/routes/`             | Código, color, nombre |
| Próximos viajes          | `get_next_trips`     | `/next-trips/`         | Hora de llegada, ruta, progreso |
| Agencia operadora        | `get_agency`         | `/agency/`             | Contacto y atención |
| Calendario de operación  | `get_calendar`       | `/calendar/`           | Días activos y feriados |
| Tarifas                  | `get_fares`          | `/fare-rules/`, `/fare-attributes/` | Métodos de pago, costos |
| Datos geoespaciales      | `get_maps`           | `/geo-shapes/`, `/geo-stops/` | Mapas de recorridos y paradas |

Estas herramientas ya se están implementando en el servidor [Infobús MCP](https://github.com/simovilab/infobus-mcp) utilizando Python, el SDK oficial de MCP y la librería `httpx`.

---

## Proceso de consulta

1. El LLM (Claude, GPT, etc.) recibe una consulta en lenguaje natural.
2. MCP transforma esa consulta en parámetros para la API (por ejemplo, `stop_id` y `timestamp`).
3. La API responde con datos en tiempo real.
4. El modelo genera una respuesta legible para el usuario.

Este flujo permite responder incluso preguntas formuladas en otros idiomas, como francés o japonés, gracias a las capacidades multilingües del modelo.

---

## Fuente de datos

Toda la información proviene de la **Infobús API**, desarrollada por el laboratorio SIMOVI de la UCR. Esta API sigue el estándar [GTFS](https://gtfs.org/schedule/), pero lo extiende con información adicional como clima, alertas o accesibilidad.

---

## Referencias

- Abarca, F. (2024). *Interfaz de lenguaje natural para un sistema de información del transporte público*.
- Repositorio MCP: [github.com/simovilab/infobus-mcp](https://github.com/simovilab/infobus-mcp)
- API Infobús: [infobus.bucr.digital/api/docs](https://infobus.bucr.digital/api/docs)
- Estándar GTFS: [https://gtfs.org](https://gtfs.org)


