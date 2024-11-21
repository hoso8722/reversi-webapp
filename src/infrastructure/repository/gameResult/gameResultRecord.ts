export class GameResultRecord {
  constructor(
    private _id: number,
    private _gameId: number,
    private _winnerDisc: number,
    private _entAt: Date
  ) {}

  get gameId() {
    return this._gameId
  }

  get winnerDisc() {
    return this._winnerDisc
  }

  get endAt() {
    return this._entAt
  }
}
