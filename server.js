const express = require("express")
const http = require("http")
const {Server} = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

var conexoes = []
var letras = []
var palavra = ''

io.on("connection", socket => {

    console.log("Cliente conectado: ", socket.id)

    socket.on("novo usuario", nome => {
        if(!conexoes.includes(nome)){
            socket.username = nome
            conexoes.push(socket.username)
            console.log(`O cliente ${socket.id} identificou-se como ${socket.username}`)
            io.emit("usuario entrou", {usersOnline: conexoes.length, text: `${nome} entrou!`, name: nome})
            if(conexoes.length > 2){
                socket.emit("lotou")
            }
        } else {
            socket.emit("nome duplicado", nome)
        }
    })

    socket.on("chat message", msg => {
        io.emit("chat message", msg)

        let letra = msg.text[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if(palavra.length < 1){
            palavra = msg.text
        }

        if(letras.includes(letra)){
            io.emit("perdeu", msg, letra)
            letras = []
            palavra = ''
            conexoes = []
        } else if(!palavra.includes(letra)){
            io.emit("perdeu", msg, palavra)
            letras = []
            palavra = ''
            conexoes = []
        } else {
            letras.push(letra)
            palavra = msg.text
        }
        
        
    } )

    socket.on("disconnect", () => {
        if(conexoes.includes(socket.username))
            conexoes.splice(conexoes.indexOf(socket.username), 1)
        if(socket.username){
            io.emit("usuario entrou", {usersOnline: conexoes.length, text: `${socket.username} saiu!`})
            console.log("Cliente desconectado: ", socket.username)
        } else console.log("Cliente desconectado: ", socket.id)
    })
})

const PORT = 3000
server.listen(PORT, () => console.log(`Rodando em 192.168.5.5:${PORT}`))