import mysql from 'mysql2/promise'

export async function connect_db() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    database: 'reversi',
    user: 'reversi',
    password: 'password'
  })
  return conn
}

