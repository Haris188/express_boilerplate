import knex from 'knex'

export interface ConnectionType {
  host: string
  user: string
  password?: string
  database?: string
}

export default knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
  }
});