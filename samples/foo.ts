import { helloFromBar } from "./bar";
import { bazSaysHello } from "./baz";

function test() {
  let my_logger = (any: string) => {
    let a = console.log(any);
    let inner = () => {
      helloFromBar();
    };
    bazSaysHello();
    inner();
  };

  my_logger("foobar");
}

export function circular() {
  console.log("hello circle");
}

test();
