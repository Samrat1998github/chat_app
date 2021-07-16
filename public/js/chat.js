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


socket.on('message',(message)=>{
    console.log(message)

    const html=Mustache.render($messagetemplate,{
        message:message
    })

    $messages.insertAdjacentHTML('beforeend',html)
})


socket.on('locationmessage',(url)=>{
    console.log(url)

    const html=Mustache.render($locationmessagetemplate,{
        url:url
    })

    $messages.insertAdjacentHTML('beforeend',html)
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
