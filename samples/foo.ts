// let a = 1;
// let b = 1;

// for (let i = 0 ; i < 5; i++) {
//     my_logger(i.toString())
// }

function test() {
  let my_logger = (any: string) => {
    let a = console.log(any);
  };

  for (let i = 0; i < 2; i++) {
    my_logger("test");
  }
}

// function test(i: number) {
//     console.log(i);
// }

// for (let i = 0 ; i < 5; i++) {
//     test(i);
// }
