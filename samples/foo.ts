function test() {
  let my_logger = (any: string) => {
    let a = console.log(any);
  };

  for (let i = 0; i < 2; i++) {
    my_logger("test");
    my_logger("test");
    my_logger("test");
    my_logger("test");
  }
}

let func = test;

func();
