# Arquitectura del sistema

## Sistema

```mermaid
flowchart TD
    subgraph Databús
        subgraph Vehículo
            OPE@{ shape: manual, label: "Conductor"}
            SEN@{ shape: event, label: "Otros sensores"}
            OBE[Aplicación móvil]
        end
        subgraph Operaciones
            GTFS[Editor GTFS]
            DCMS[Gestor de contenidos]
            DAT((Servidor Databús))
        end
    end

    SC@{ shape: docs, label: "GTFS Schedule"}
    RT@{ shape: doc, label: "GTFS Realtime"}
    ADM@{ shape: manual, label: "Administración"}

    subgraph Infobús
        subgraph Contenidos
            INF((Servidor Infobús))
            ICMS[Gestor de contenidos]
            MCP[Servidor MCP]
        end
        subgraph Interfaces
            WEB[Sitio web]
            APP[Aplicación móvil]
            SSC[Servidor de pantallas]

            ANA[Análisis de datos]
        end
        SCR@{ shape: display, label: "Pantallas"}
    end

    PAS@{ shape: terminal, label: "Pasajero"}
    RES@{ shape: terminal, label: "Investigador"}

OPE --> OBE
SEN --> OBE
Vehículo <--API--> Operaciones
DAT --> RT
DAT --> SC

RT --> INF
SC --> INF

Contenidos <--API--> Interfaces

SSC --> SCR

WEB --> PAS
APP --> PAS
SCR --> PAS

ANA ---> RES

Operaciones <--> ADM
ADM <--> Contenidos

```

Infobús API --- Base de datos

--- Otras fuentes (clima)

Infobús Admin

Headless CMS: expone un API REST para la gestión de contenidos del sitio.

Infobús MCP
