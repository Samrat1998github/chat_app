const express=require('express')
const path=require('path')
const http=require('http')
const socketio=require('socket.io')
const {generateMessage,generatelocationMessage}=require('./utils/messages.js')
const {addUser,removeUser,getUser,getUserInRoom }=require('./utils/users.js')

const app = express()
const server=http.createServer(app)
const io=socketio(server)



const port = process.env.PORT || 3000
const publicfolderpath = path.join(__dirname,'../public')

app.use(express.static(publicfolderpath))





io.on('connection',(socket)=>{
    console.log('new websocket connection')


   

    socket.on('join',({username,room},callback) =>{
        
        const {error,user}=addUser({id:socket.id,username,room})
        
        if(error){
            return callback(error)
        }


        socket.join(user.room)



        socket.emit('message',generateMessage('Admin','welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
    
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        
        
        callback()



        //socket.emit  oi.emit socket.broadcast.emit
        //io.to.emit  socket.broadcast.to.emit
    })



    socket.on('sendMessage',(message,callback)=>{

        const user=getUser(socket.id)

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',(coords, callback)=>{

        const user=getUser(socket.id)

        io.to(user.room).emit('locationmessage',generatelocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{

        const user=removeUser(socket.id)
            
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))

            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
        
    })
})    




server.listen(port,()=>{
    console.log("server is up at port "+ port)
})