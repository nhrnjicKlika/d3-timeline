var express = require('express')

var app = express()
app.use(express.static(__dirname + '/'))

var port = process.env.port || 5000

app.listen(5000, function(){
    console.log('listening at 5000')
})