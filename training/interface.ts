const STONE = 0
const PAPER = 1
const SCISSORS = 2


interface HandGenerator {
  generate() : number
}

class RandomHandGenerator implements HandGenerator{
  generate(): number {
    return Math.floor(Math.random() * 3)
  }

  generateArray(): number[] {
    return []
  }
}


class Janken {
  play(handGenerator: HandGenerator) {

    const computeHand = handGenerator.generate()

    console.log(`computeHand = ${computeHand}`)

    //勝敗判定などが続く
  }
}

const janken = new Janken()

const generator = new RandomHandGenerator()
janken.play(generator)

class StoneHandGenerator implements HandGenerator {
  generate(): number {
    return STONE
  }
}

const generaotor2 = new StoneHandGenerator()
janken.play(generaotor2)