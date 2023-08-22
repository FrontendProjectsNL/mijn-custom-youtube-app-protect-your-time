let target = {};
let source = { [Symbol("foo")]: "bar", naam: "Ehsan Alborzi" };

Object.assign(target, source);

Object.keys(target).forEach((element) => {
  console.log(element);
});

for (const [key, value] of Object.entries(source)) {
  console.log(`Key: ${key}, Value: ${value}`);
}
