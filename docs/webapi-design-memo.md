# API design memo

## 対戦を開始する
「対戦」を登録する
POST /api/games

## 盤面をみる
response body

```json
{
  "turnCount": 1,
  "board": [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,2,0,0,0],
    [0,0,0,2,1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  "nextDisc": 1,
  "winnerDisc": 1,
}
```
## 石を打つ

. register turn
POST /api/games/latest/turns

.request body
```json
{
  "turnCount": 1,
  "move": {
    "disc": 1,
    "x": 0,
    "y": 0
  }
}
```

## 自分の対戦結果を表示する

get my games score list

GET /api/games

response body

```json
{
  "games": [
    {
      "id": 1,
      "winnerDisc": 1,
      "startedAt": "YYYY-MM-DD hh:mm:ss"
    }
  ]
}
```