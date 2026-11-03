---
title: 'Convertir curl a fetch, Python, Java, Spring y Go'
description: 'Pega un comando curl y obtén el código con fetch, requests de Python, HttpClient de Java, RestClient o WebClient de Spring, o net/http de Go.'
examples:
  - title: 'GET con token a fetch'
    input: |
      curl https://api.ejemplo.dev/v1/usuarios -H 'Authorization: Bearer abc123'
    output: |
      const res = await fetch("https://api.ejemplo.dev/v1/usuarios", {
        headers: {
          "Authorization": "Bearer abc123",
        },
      });
      const data = await res.text();
  - title: 'POST JSON a Python requests'
    input: |
      curl -X POST https://api.ejemplo.dev/v1/pedidos --json '{"sku": "TEC-01", "cantidad": 2}'
    output: |
      import requests

      res = requests.post(
          "https://api.ejemplo.dev/v1/pedidos",
          headers={
              "Content-Type": "application/json",
              "Accept": "application/json",
          },
          json={
            "sku": "TEC-01",
            "cantidad": 2
          },
          allow_redirects=False,
      )
      print(res.status_code, res.text)
faq:
  - q: '¿Qué opciones de curl entiende?'
    a: 'Método (-X), cabeceras (-H), cuerpo (-d, --data-raw, --data-binary, --data-urlencode, --json), formularios multipart (-F), usuario (-u), cookies (-b), agente (-A), -G, -I, -L, -k y --compressed. Las opciones que no cambian la request, como -s, -v, -o o --retry, se ignoran.'
  - q: '¿Funcionan los comandos copiados del navegador?'
    a: 'Sí. «Copiar como cURL» de las herramientas de desarrollo de Chrome o Firefox genera comandos con comillas simples, $''…'' y líneas terminadas en \, y todos se interpretan como lo haría bash.'
  - q: '¿Se ejecuta la request?'
    a: 'No. La herramienta solo lee el comando y escribe código; no hace ninguna llamada de red. Los tokens y contraseñas que pegues no salen de tu navegador.'
  - q: '¿RestClient o WebClient?'
    a: 'RestClient es el cliente síncrono de Spring Framework 6.1 (Spring Boot 3.2+) y reemplaza a RestTemplate en código nuevo. WebClient es el cliente reactivo de WebFlux; el código termina con block() para que sirva de ejemplo directo, pero en una app reactiva devuelve el Mono sin bloquear. En Spring Boot conviene crearlos desde el RestClient.Builder o WebClient.Builder que inyecta el framework.'
---

Copiar un comando `curl` de la documentación de una API, de un ticket o de «Copiar como cURL» del navegador es la forma más rápida de reproducir una request. Pasarlo a código a mano, en cambio, es tedioso. Esta herramienta lo **convierte** al lenguaje que uses.

Elige el destino: **fetch** de JavaScript (navegador o Node.js), **requests** de Python, **HttpClient** de Java 11+, **RestClient** (Spring Framework 6.1+, Spring Boot 3.2+) o **WebClient** (WebFlux) de Spring, o **net/http** de Go. Se respetan el método, la URL, las cabeceras, el cuerpo y las opciones habituales: `-d` genera un formulario urlencoded, `--json` o un `Content-Type: application/json` generan un cuerpo JSON legible, `-F` arma un formulario multipart, `-u` agrega autenticación básica, `-G` pasa los datos a la URL y `-L` hace que se sigan las redirecciones.

El intérprete entiende la sintaxis de shell: comillas simples y dobles, `$'…'`, escapes y líneas partidas con `\`. Si falta una comilla o la URL, verás el error.

Revisa siempre el resultado: si el comando usa `-k`, el código desactiva la verificación TLS, algo que solo debería hacerse en desarrollo. La conversión ocurre en tu navegador y nunca ejecuta la request.
