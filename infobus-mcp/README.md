# Proyecto MCP con Mistral: Interfaz para hacer preguntas

Este documento detalla el proceso para configurar y ejecutar un sistema basado en el **Model Context Protocol (MCP)** que utiliza el modelo **Mistral** localmente mediante **Ollama**. La configuración permite hacer preguntas a un modelo de IA y obtener respuestas a través de una interfaz cliente en Python.

# Guía de Implementación del Proyecto MCP con Mistral

Este proyecto configura un servidor MCP usando el modelo Mistral a través de Ollama y un cliente para enviar preguntas y recibir respuestas.

## Requerimientos

Antes de ejecutar el proyecto, asegúrate de tener las siguientes dependencias instaladas en tu entorno:

- Python 3.12 o superior
- Las siguientes librerías de Python:

```txt
mcp[cli]
httpx
uvicorn
fastmcp
```

## Instalación de Dependencias

```bash
python3 -m venv .venv
source .venv/bin/activate  # en Linux/Mac
```

1. Instala las dependencias con el siguiente comando:

```bash
pip install -r requirements.txt
```

## Comandos para Ejecutar el Proyecto

El proyecto consta de dos componentes principales: el servidor y el cliente. Debes correr ambos componentes en terminales separadas.

### 1. Terminal 1: Ejecutar el servidor

1. Entra al entorno virtual si no lo has hecho:

```bash
source .venv/bin/activate
```

2. Ejecuta el servidor con el siguiente comando:

```bash
uv run server/ollama_server.py
```

### 2. Terminal 2: Ejecutar el cliente

1. Entra al entorno virtual en una nueva terminal:

```bash
source .venv/bin/activate
```

2. Ejecuta el cliente con el siguiente comando:

```bash
python client/client.py
```

### 3. Realizar una Pregunta

1. En la terminal del cliente, puedes empezar a hacer preguntas. Ejemplo:

```bash
Tú: ¿Qué es la inteligencia artificial?
```

2. El cliente enviará la solicitud al servidor y mostrará la respuesta del modelo.

## Solución de Problemas

### Si tienes problemas con el servidor:

1. Verifica que el servidor está corriendo en el puerto 11434:

```bash
sudo ss -tuln | grep 11434
```

Si no está corriendo, asegúrate de ejecutar el servidor con:

```bash
uv run server/ollama_server.py
```

### 3. Si el cliente no responde

Si el cliente no responde correctamente o muestra errores, sigue los pasos de solución de problemas a continuación:

#### Paso 1: Verifica que el servidor esté en funcionamiento

Asegúrate de que el servidor está corriendo correctamente en el puerto 11434. Para hacerlo, en la terminal donde ejecutaste el servidor, deberías ver algo como:

```bash
[GIN] 2025/06/19 - 11:50:53 | 200 | 48.320876418s |       127.0.0.1 | POST     "/api/generate"
```

Si el servidor no está en ejecución, puedes iniciar el servidor con el siguiente comando:

```bash
uv run server/ollama_server.py
```

Si después de ejecutar el servidor no ves la línea que indica que está escuchando en el puerto 11434, puedes verificar si está en uso con el siguiente comando:

```bash
sudo ss -tuln | grep 11434
```

Si el puerto no está siendo usado, asegúrate de que el servidor esté correctamente ejecutándose y que no haya errores de configuración.

#### Paso 2: Verifica que Ollama está corriendo

Es crucial que Ollama esté corriendo en segundo plano para que el servidor pueda acceder al modelo Mistral. Si Ollama no está corriendo, el servidor no podrá generar respuestas.

1. Para verificar si Ollama está en funcionamiento, ejecuta:

```bash
ps aux | grep ollama
```

Si no ves un proceso de `ollama serve` en la salida, intenta iniciar Ollama con:

```bash
ollama serve &
```

Esto debería iniciar Ollama en segundo plano, y podrás ver si se está ejecutando correctamente en la terminal.

#### Paso 3: Revisa el tiempo de espera (timeout)

Es posible que el cliente esté esperando demasiado tiempo para obtener una respuesta del servidor y se quede "colgado". Si este es el caso, podrías ver el siguiente mensaje en la terminal del cliente:

```bash
Error procesando la respuesta: timed out
```

Para evitar que el cliente se quede esperando indefinidamente, puedes aumentar el tiempo de espera en el cliente. Si el tiempo de espera sigue siendo muy corto, ajusta el parámetro de `timeout` en la función `enviar_pregunta` en el archivo `client.py`:

```python
response = httpx.post("http://localhost:11434", json=payload, timeout=60.0)  # Aumento el timeout a 60 segundos
```

#### Paso 4: Revisa las respuestas de la API

Si después de haber aumentado el tiempo de espera el cliente sigue sin responder, verifica la respuesta que está enviando el servidor. Para ello, imprime el cuerpo de la respuesta en el archivo `ollama_server.py` para asegurarte de que está recibiendo la respuesta del modelo correctamente. Debes ver algo como esto:

```bash
time=2025-06-19T11:50:53.884650722Z
response=" La Inteligencia Artificial (IA) es una rama de la ciencia..."
```

Si no estás recibiendo una respuesta válida, asegúrate de que el modelo Mistral esté correctamente cargado y que Ollama lo esté utilizando. Si el modelo no está cargado correctamente, podrías intentar descargarlo de nuevo con el comando:

```bash
ollama pull mistral
```

#### Paso 5: Comprobación de errores de conexión

Si todo parece estar bien, pero el cliente sigue sin recibir respuestas, podría haber problemas con la conexión entre el cliente y el servidor. Verifica los logs de la terminal donde corre el servidor para identificar si se está cerrando la conexión o si hay errores de red. Si es necesario, reinicia tanto el servidor como el cliente y prueba de nuevo.

#### Paso 6: Revisa el código del cliente

Si todo lo anterior está correcto, pero aún el cliente no responde, revisa que el código del cliente esté enviando correctamente las solicitudes. Asegúrate de que el payload que se está enviando tenga el formato correcto. Debes ver algo similar a esto al enviar la solicitud:

```bash
🔍 Enviando la siguiente solicitud al servidor: {
  "type": "tool",
  "tool": "preguntar",
  "args": {
    "prompt": "¿Qué es la inteligencia artificial?"
  }
}
```

Este mensaje indica que el cliente está enviando correctamente la solicitud al servidor, por lo que si no recibes respuesta, probablemente se deba a un error en la comunicación entre el cliente y el servidor.

#### Paso 7: Reiniciar los servicios

Si después de seguir estos pasos aún no funciona, reinicia tanto el servidor como Ollama y el cliente para asegurarte de que no haya procesos atascados.

```bash
sudo systemctl restart ollama
uv run server/ollama_server.py
python client/client.py
```

#### Paso 8: Verificar los logs

Si el error persiste, revisa los logs de ambos, el servidor y el cliente, para identificar cualquier mensaje de error adicional que pueda ayudarte a diagnosticar el problema.

---

## Descripción de Archivos

- `server/ollama_server.py`: El servidor que utiliza Ollama y Mistral para generar respuestas.
- `client/client.py`: El cliente que permite enviar preguntas y recibir respuestas desde el servidor.
- `requirements.txt`: Lista de dependencias necesarias para ejecutar el proyecto.

## Notas

- El proyecto utiliza el modelo Mistral que debe estar descargado previamente.
- En caso de que necesites cambiar el modelo o la configuración, edita el archivo `server/ollama_server.py`.
