const express = require('express')
require('./db/mongoose.js')
const usersRouter = require('../src/routers/user')
const expensesRouter = require('./routers/expense')
const groupRouter = require('./routers/group')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(usersRouter)
app.use(expensesRouter)
app.use(groupRouter)


app.listen(port, () =>{
    console.log('App listening on port ' + port)
})
