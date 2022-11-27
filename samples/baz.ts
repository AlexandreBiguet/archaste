import { circular } from "./foo";
import { myFunc } from "./foobar";

export function bazSaysHello() {
  console.log("Baz says hello");
  circular();
  myFunc();
}
