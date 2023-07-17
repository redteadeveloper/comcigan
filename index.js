const express = require("express")

const app = express()
const port = 3000

app.enable('trust proxy')

require('./routes/routes.js')(app)

app.listen(port, () => {
    console.log("Listening on port " + port)
})