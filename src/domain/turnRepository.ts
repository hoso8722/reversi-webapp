import mysql from "mysql2/promise"
import { Turn } from "./turn/turn"
import { TurnGateway } from "../infrastructure/turnGateway"
import { SquareGateway } from "../infrastructure/squareGateway"
import { MoveGateway } from "../infrastructure/moveGateway"
import { Move } from "./turn/move"
import { toDisc } from "./turn/disc"
import { Point } from "./turn/point"
import { Board } from "./turn/board"

const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()

export class TurnRepository {
  async findForGameIdAndTurnCOunt(
    conn: mysql.Connection,
    gameId: number,
    turnCount: number
  ): Promise<Turn> {
    const turnRecord = await turnGateway.findForGameIdAndTurnCount(
      conn,
      gameId,
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

    const moveRecord = await moveGateway.findForTurnId(conn, turnRecord.id)
    let move: Move | undefined
    if (moveRecord) {
      toDisc(moveRecord.disc), new Point(moveRecord.x, moveRecord.y)
    }

    return new Turn(
      gameId,
      turnCount,
      toDisc(turnRecord.nextDisc),
      move,
      new Board(board),
      turnRecord.endAt
    )
  }

  async save(conn: mysql.Connection, turn: Turn) {
    const turnRecord = await turnGateway.insert(
      conn,
      turn.gameId,
      turn.turnCount,
      turn.nextDisc,
      turn.endAt
    )
    await squareGateway.insertAll(conn, turnRecord.id, turn.board.discs)

    if (turn.move) {
      await moveGateway.insert(
        conn,
        turnRecord.id,
        turn.move.disc,
        turn.move.point.x,
        turn.move.point.y
      )
    }
  }
}
