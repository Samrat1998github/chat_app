const express=require('express')
const path=require('path')
const http=require('http')
const socketio=require('socket.io')



const app = express()
const server=http.createServer(app)
const io=socketio(server)



const port = process.env.PORT || 3000
const publicfolderpath = path.join(__dirname,'../public')

app.use(express.static(publicfolderpath))





io.on('connection',(socket)=>{
    console.log('new websocket connection')


    socket.emit('message',"welcome!")
    socket.broadcast.emit('message',"a new user has joined....")

    socket.on('sendMessage',(message,callback)=>{
        io.emit('message',message)
        callback()
    })

    socket.on('sendLocation',(coords, callback)=>{
        io.emit('locationmessage',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect',()=>{
        io.emit('message',"a user has left....")
    })
})    




server.listen(port,()=>{
    console.log("server is up at port "+ port)
})