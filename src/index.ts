import * as express from 'express'
import * as dotenv from 'dotenv'
import setupApp from './AppSetup'

dotenv.config()

const app = express()

setupApp(app)

app.listen((process.env.PORT || 4000), ()=>{
    console.log('SERVER: running at ' + (process.env.PORT || 4000))
})
