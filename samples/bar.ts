import { bazSaysHello } from "./baz";

export function helloFromBar() {
  console.log("Hello from Bar");
  bazSaysHello();
}
