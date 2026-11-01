---
title: 'JSON to TypeScript, Java and Go: generate types'
description: 'Paste a sample JSON and get TypeScript interfaces, Java records or Go structs with nested types, optional fields and nulls.'
examples:
  - title: 'Nested object to TypeScript'
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
  - title: 'Array with an optional field to Go'
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
  - q: 'How does it decide a field is optional?'
    a: 'When the JSON has an array of objects, all its elements are combined: a field missing from any of them becomes optional (? in TypeScript, a pointer with omitempty in Go, a wrapper type in Java). The more varied the sample, the better the types.'
  - q: 'What if a field has values of different types?'
    a: 'You get a union, for example number | string in TypeScript. An integer and a decimal in the same field merge into number, float64 or double.'
  - q: 'Which Java version does it target?'
    a: "It generates records, available since Java 16. If a key is not a valid identifier or is a reserved word, the field is renamed and Jackson's @JsonProperty keeps the original name."
  - q: 'Does my JSON leave the browser?'
    a: 'No. Inference and code generation happen in your tab; nothing is sent to a server.'
---

Writing the types for an API response by hand is tedious and easy to get wrong. This tool **infers** them from a sample JSON document and generates code you can paste into your project.

Pick the **language**: **TypeScript** interfaces, **Java** records or **Go** structs. Every nested object becomes its own type, named after its key: `address` produces `Address`, and the elements of `orders` produce `Order`. **Root name** sets the name of the main type.

Types come from the values: strings, integers or decimals, booleans, arrays and `null`. If the JSON holds an **array of objects**, all its elements are combined, so fields missing from some of them become **optional** and fields that are sometimes `null` become **nullable**. In Go that means pointers with `omitempty`; in Java, wrapper types such as `Long` or `Boolean`.

Keys with dashes or spaces stay quoted in TypeScript, are mapped with the `json:"…"` tag in Go and with `@JsonProperty` in Java.

A single sample does not show every case: review the generated types before using them in production, especially fields that are `null` in your sample.
