import knex from 'knex'
import {ConnectionType} from './Db'
import * as dotenv from 'dotenv'

dotenv.config()

let con: ConnectionType = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'postgres'
}

let pg = knex({
    client: 'pg',
    connection: con
});

pg.raw('CREATE DATABASE efficient').then(async function () {
    pg.destroy();

    con.database = process.env.DB;
    
    pg = knex({ client: 'pg', connection: con });

    await pg.schema.createTable('users', function (table) {
        table.increments('id')
        table.string('first_name')
        table.string('last_name')
        table.string('email')
        table.string('password')
    }).then((value)=>{
        console.log('-users created')
    })

    await pg.schema.createTable('tasks', function (table){
        table.increments('id')
        table.timestamp('start_time')
        table.timestamp('end_time')
        table.string('name')
        table.string('description')
        table.integer('user_id')
    }).then((value)=>{
        console.log('-tasks created')
    })

    await pg.schema.createTable('intervals', function (table){
        table.increments('id')
        table.integer('task_id')
        table.timestamp('start_time')
        table.timestamp('end_time')
    }).then((value)=>{
        console.log('-intervals created')
    })

    await pg.destroy()
});