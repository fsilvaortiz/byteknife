---
title: 'JSON a TypeScript, Java y Go: generar tipos'
description: 'Pega un JSON de ejemplo y obtén interfaces de TypeScript, records de Java o structs de Go con tipos anidados, campos opcionales y nulos.'
examples:
  - title: 'Objeto con anidados a TypeScript'
    input: |
      {"id": 7, "email": "ana@ejemplo.dev", "tags": ["admin"], "direccion": {"ciudad": "Santiago"}}
    output: |
      export interface Usuario {
        id: number;
        email: string;
        tags: string[];
        direccion: Direccion;
      }

      export interface Direccion {
        ciudad: string;
      }
  - title: 'Arreglo con un campo opcional a Go'
    input: |
      [{"id": 1, "total": 120}, {"id": 2, "total": 35.5, "cupon": "BIENVENIDA"}]
    output: |
      type Pedido []PedidoItem

      type PedidoItem struct {
      	ID    int64   `json:"id"`
      	Total float64 `json:"total"`
      	Cupon *string `json:"cupon,omitempty"`
      }
faq:
  - q: '¿Cómo decide si un campo es opcional?'
    a: 'Si el JSON tiene un arreglo de objetos, se combinan todos sus elementos: un campo que falta en alguno queda opcional (? en TypeScript, puntero con omitempty en Go, tipo envoltorio en Java). Mientras más variado el ejemplo, mejores los tipos.'
  - q: '¿Qué pasa si un campo tiene valores de distinto tipo?'
    a: 'Se genera una unión, por ejemplo number | string en TypeScript. Un entero y un decimal en el mismo campo se unen como number, float64 o double.'
  - q: '¿Qué versión de Java usa?'
    a: 'Genera records, disponibles desde Java 16. Si una clave no es un identificador válido o es palabra reservada, el campo se renombra y se agrega @JsonProperty de Jackson con el nombre original.'
  - q: '¿Mi JSON sale del navegador?'
    a: 'No. La inferencia y la generación de código ocurren en tu pestaña; nada se envía a un servidor.'
---

Escribir a mano los tipos de una respuesta de API es tedioso y fácil de equivocar. Esta herramienta los **infiere** de un JSON de ejemplo y genera el código listo para pegar en tu proyecto.

Elige el **lenguaje**: interfaces de **TypeScript**, records de **Java** o structs de **Go**. Cada objeto anidado se convierte en su propio tipo, con un nombre derivado de su clave: `direccion` genera `Direccion`, y los elementos de `pedidos` generan `Pedido`. Con **Nombre raíz** eliges cómo se llama el tipo principal.

Los tipos se deducen de los valores: textos, números enteros o decimales, booleanos, arreglos y `null`. Si el JSON trae un **arreglo de objetos**, se combinan todos sus elementos, así que los campos que faltan en alguno quedan **opcionales** y los que a veces son `null` quedan **nulables**. En Go eso se traduce en punteros con `omitempty`, y en Java en tipos envoltorio como `Long` o `Boolean`.

Las claves con guiones o espacios se mantienen en TypeScript entre comillas, en Go se mapean con la etiqueta `json:"…"` y en Java con `@JsonProperty`.

Un solo ejemplo no muestra todos los casos: revisa los tipos generados antes de usarlos en producción, sobre todo los campos que en tu ejemplo son `null`.
