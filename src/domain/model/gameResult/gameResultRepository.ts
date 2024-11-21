import { GameResult } from "../../../domain/model/gameResult/gameResult"
import mysql from "mysql2/promise"
import { toWinnerDisc } from "../../../domain/model/gameResult/winnerDisc"

export interface GameResultRepository {
  findForGameId(
    conn: mysql.Connection,
    gameId: number
  ): Promise<GameResult | undefined>

  save(conn: mysql.Connection, gameResult: GameResult)
}
