import express, { Request, Response, NextFunction } from "express"
import morgan from "morgan"
import "express-async-errors"
import mysql from "mysql2/promise"
import { GameGateway } from "./data-access/gameGateway"
import { TurnGateway } from "./data-access/turnGateway"
import { MoveGateway } from "./data-access/moveGateway"
import { SquareGateway } from "./data-access/squareGateway"
// import { connect_db } from '../db/connect_db'

const EMPTY = 0
const BLACK = 1
const WHITE = 2

const INITIAL_BOARD = [
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, BLACK, WHITE, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, WHITE, BLACK, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
]

const PORT = 3000

const app = express()

app.use(morgan("dev"))
app.use(express.static("static", { extensions: ["html"] }))
app.use(express.json())

const gameGateway = new GameGateway()
const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()

app.get("/api/hello", async (req, res) => {
  res.json({
    message: "Hello Express!!!",
  })
})

app.get("/api/error", async (req, res) => {
  throw new Error("Error endpoint")
})

app.post("/api/games", async (req, res) => {
  const now = new Date()

  const conn = await connect_db()

  try {
    await conn.beginTransaction()

    const gameRecord = await gameGateway.insert(conn, now)

    const turnRecord = await turnGateway.insert(
      conn,
      gameRecord.id,
      0,
      BLACK,
      now
    )

    await squareGateway.insertAll(conn, turnRecord.id, INITIAL_BOARD)

    await conn.commit()
  } finally {
    await conn.end()
  }

  res.status(201).end()
})

app.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  const turnCount = parseInt(req.params.turnCount)
  const conn = await connect_db()
  try {
    const gameRecord = await gameGateway.findLatest(conn)
    if (!gameRecord) {
      throw new Error("Latest game not found")
    }

    const turnRecord = await turnGateway.findForGameIdAndTurnCount(
      conn,
      gameRecord.id,
      turnCount
    )
    if (!turnRecord) {
      throw new Error("Specified turn not found")
    }
    const squareRecords = await squareGateway.findForTurnId(conn, turnRecord.id)

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)))

    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc
    })

    const responseBody = {
      turnCount,
      board,
      nextDisc: turnRecord.nextDisc,
      // TODO 決着がついている場合。game_resultsテーブルから取得する
      winnerDisc: null,
    }
    res.json(responseBody)
  } finally {
    await conn.end()
  }
})

app.post("/api/games/latest/turns", async (req, res) => {
  const turnCount = parseInt(req.body.turnCount)
  const disc = parseInt(req.body.move.disc)
  const x = parseInt(req.body.move.x)
  const y = parseInt(req.body.move.y)

  const conn = await connect_db()
  try {
    //　１つ前のターンを取得する
    const gameRecord = await gameGateway.findLatest(conn)
    if (!gameRecord) {
      throw new Error("Latest game not found")
    }

    const previousTurnCount = turnCount - 1
    const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(
      conn,
      gameRecord.id,
      previousTurnCount
    )
    if (!previousTurnRecord) {
      throw new Error("Specified turn not found")
    }

    const squareRecords = await squareGateway.findForTurnId(
      conn,
      previousTurnRecord.id
    )

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)))

    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc
    })
    //　TODO 盤面に置けるかチェック

    // 石を置く
    board[y][x] = disc

    // ひっくり返す

    //　ターンを保存する
    const nextDisc = disc === BLACK ? WHITE : BLACK
    const now = new Date()
    const turnRecord = await turnGateway.insert(
      conn,
      gameRecord.id,
      turnCount,
      nextDisc,
      now
    )

    await squareGateway.insertAll(conn, turnRecord.id, board)

    await moveGateway.insert(conn, turnRecord.id, disc, x, y)

    await conn.commit()
  } finally {
    await conn.end()
  }

  res.status(201).end()
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`)
})

function errorHandler(
  err: any,
  _req: Request,
  _res: Response,
  _next: NextFunction
) {
  console.error("Unexpected error occured", err)
  _res.status(500).send({
    message: "Unexpected error occurred",
  })
}

async function connect_db() {
  const conn = await mysql.createConnection({
    host: "localhost",
    database: "reversi",
    user: "reversi",
    password: "password",
  })
  return conn
}
