const socket=io()

//elements

const $messageform=document.querySelector('#messageform')
const $messageforminput=$messageform.querySelector('input')
const $messageformbutton=$messageform.querySelector('button')
const $locationbutton=document.querySelector('#location')
const $messages=document.querySelector('#messages')

//templates

const $messagetemplate=document.querySelector('#messagetemplate').innerHTML
const $locationmessagetemplate=document.querySelector('#locationmessagetemplate').innerHTML
const $sidebartemplate=document.querySelector('#sidebar-template').innerHTML
//options

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true})


const autoscroll=()=>{

    //new msg elements

    const $newMessage = $messages.lastElementChild

    //height of the message

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMergin = parseInt(newMessageStyles.merginButtom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMergin

    //visible height

    const visibleHeight = $messages.offsetHeight

    //height of messages container

    const containerHeight = $messages.scrollHeight

    //how far have I scroll?

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }


    //console.log(newMessageStyles)
    //console.log(newMessageMergin)

}


socket.on('message',(message)=>{
    console.log(message)

    const html=Mustache.render($messagetemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()
})


socket.on('locationmessage',(message)=>{
    console.log(message)

    const html=Mustache.render($locationmessagetemplate,{
        username:message.username,
        url:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render($sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})


$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageformbutton.setAttribute('disabled','disabled')

    const message=$messageforminput.value
    socket.emit('sendMessage',message,()=>{
        $messageformbutton.removeAttribute('disabled','disabled')
        $messageforminput.value=''
        $messageforminput.focus()

        // if(error)
        //     return console.log(error)
        console.log('message was delivered...')
    })

})

$locationbutton.addEventListener('click',()=>{
    if(!navigator.geolocation)
        return alart('geolocation is not supported by your browser.')
    
    $locationbutton.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
        const latitude=position.coords.latitude
        const longitude=position.coords.longitude
        socket.emit('sendLocation',{
            latitude,
            longitude
        },()=>{
            $locationbutton.removeAttribute('disabled','disabled')
            console.log("location shared")
        })
    })
})


socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})