var express = require('express')

var app = express()
app.use(express.static(__dirname + '/'))

var port = process.env.PORT || 5000

console.log('hello from server.js')

app.listen(port, function(){
    console.log('listening at 5000')
})