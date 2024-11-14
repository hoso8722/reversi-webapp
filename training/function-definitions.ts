function add1(v1: number, v2: number): number {
  return v1 + v2
}

const result1 = add1(1,2)
console.log(`result1 = ${result1}`)

const add2 = function (v1:number, v2:number): number {
  return v1 + v2
}

console.log('result2 =', add2(2,3))

const add3 = (v1: number, v2:number) => {
  return v1 + v2
}

console.log(`result3 = ${add3(3,4)}`)