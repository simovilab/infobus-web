import json
import httpx

def enviar_pregunta(prompt):
    try:
        # Crear el payload de la solicitud
        payload = {
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        }

        # Imprimir el payload para verificar cómo se envía la solicitud
        print(f"🔍 Enviando la siguiente solicitud al servidor: {json.dumps(payload, indent=2)}")

        # Enviar la solicitud al servidor con un tiempo de espera más largo
        response = httpx.post("http://localhost:11434/api/generate", json=payload, timeout=60.0)  # Timeout aumentado a 60 segundos

        # Comprobar si la respuesta fue exitosa
        response.raise_for_status()

        # Parsear la respuesta
        data = response.json()

        # Retornar el resultado
        return data.get("response", "No se recibió respuesta válida.")
    except httpx.HTTPStatusError as e:
        return f"Error en la solicitud HTTP: {e}"
    except Exception as e:
        return f"Error procesando la respuesta: {e}"

print("🧠 Cliente MCP (escribí 'salir' para terminar)")
while True:
    prompt = input("Tú: ")
    if prompt.lower() in {"salir", "exit"}:
        break
    respuesta = enviar_pregunta(prompt)
    print(f"🤖 Modelo: {respuesta}")
