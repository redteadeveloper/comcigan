const express = require("express")

const app = express()
const port = 3000

app.enable('trust proxy')

require('./routes/schoolSearch.js')(app)
require('./routes/timetableSearch.js')(app)
    
app.get('/', (req, res) => {
    res.send("Comcigan API by RedTea")
})

app.listen(port, () => {
    console.log("Listening on port " + port)
})
