from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("infobus-mistral")

OLLAMA_URL = "http://localhost:11434/api/generate"

@mcp.tool()
async def preguntar(prompt: str) -> str:
    """
    Llama al modelo Mistral de Ollama y retorna la respuesta.
    """
    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(OLLAMA_URL, json=payload, timeout=30.0)
            response.raise_for_status()
            data = await response.json()  # Corregido: esperar la respuesta JSON de manera asíncrona
            return data.get("response", "Sin respuesta del modelo.")
    except Exception as e:
        return f"Error al contactar a Ollama: {e}"

if __name__ == "__main__":
    mcp.run(transport="stdio")
