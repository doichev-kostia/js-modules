# TypeScript Module System Showcase

This project demonstrates an example of a dummy storage that follows the principle of separation of data (structs) and
operations (functions). It's inspired by Go and Rust module systems.

When using classes, it's common to have a mess of data, state and functions all together. With time it's hard to maintain.
The solution I see is to separate data and functions. This way it's easier to reason about the code and to maintain it.

Due to the lack of private properties in JS. I'm using symbols to simulate them. You can see examples of that in Fastify and Undici.

You can also notice that I'm associating the method with a struct.

```ts
function createStruct() {
  const struct = {};

  return Object.assign({}, struct, {
    method: associateMethod(struct)
  })
}

function method(struct) {}
```

The idea is to have the best of both worlds:
- Have independent functions that accept a struct as a parameter.
- Have a nice LSP support when writing `struct.` and see all the available methods.

The only issue here is that symbols are not typed properly, they are just `[key: symbol]: any`.
