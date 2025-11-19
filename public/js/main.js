document.addEventListener("DOMContentLoaded", ()=>{
    const socket = io()

    const loginDiv = document.getElementById("login")
    const chatDiv = document.getElementById("chat")
    const derrotaDiv = document.getElementById("derrota")

    const username = document.getElementById("username")
    const formLogin = document.getElementById("formLogin")

    const form = document.getElementById("form")
    const input = document.getElementById("input")
    const enviar = document.getElementById("enviar")

    const messages = document.getElementById("messages")

    let sessao = ""
    let numero = 0;

    formLogin.addEventListener("submit", e => {
        e.preventDefault()
        var nome = username.value.trim()
        if(nome){
            sessao = nome
            socket.emit("novo usuario", sessao)
        }
    })

    form.addEventListener("submit", e => {
        e.preventDefault()
        if(input.value.length == 6) {
            socket.emit("chat message", {user: sessao, text: input.value})
            input.value = ""
        }
    })

    input.addEventListener("input", function() {
        this.value = this.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÇç]/g, '')
    })

    socket.on("chat message", msg => {
        const li = document.createElement("li")
        li.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`
        messages.appendChild(li)
        window.scrollTo(0, document.body.scrollHeight)
    })

    socket.on("nome duplicado", nome => {
        alert(`O nome ${nome} já foi usado!`)
        formLogin.getElementsByTagName("p")[0].innerText = `O nome ${nome} já está em uso!`
        sessao = ""
        username.value = ""
    })
    
    socket.on("usuario entrou", data => {
       if (data.name === sessao && sessao.length > 0) {
            loginDiv.style.display = "none";
            chatDiv.style.display = "flex";
        }
        console.log(data)
        const li = document.createElement("li")
        li.style.fontStyle = "italic"
        li.textContent = `${data.text}`
        messages.appendChild(li)
        
        if(data.usersOnline > 1 && numero < 3){
            input.disabled = false
            enviar.disabled =false
            form.getElementsByTagName("p")[0].style.display = "none"
        } else {
            input.disabled = true
            enviar.disabled =true
            form.getElementsByTagName("p")[0].style.display = "block"
        }
    })

    socket.on("perdeu", (msg, palavra) => {

        chatDiv.style.display = "none"
        derrotaDiv.style.display = "flex"
        messages.innerHTML = ''

        if(palavra.length == 1){
            derrotaDiv.innerHTML = `<h3>O usuário <strong>${msg.user}</strong> perdeu pois a palavra <strong>${msg.text}</strong> começa com a letra <strong>${palavra}</strong>, que já foi usada!</h3><h2></h2>`    
        } else {
            derrotaDiv.innerHTML = `<h3>O usuário <strong>${msg.user}</strong> perdeu pois a inicial de <strong>${msg.text}</strong> não consta em <strong>${palavra}</strong></h3><h2></h2>`    
        }

        

        let count = 5
        let interval = setInterval(()=>{
            derrotaDiv.getElementsByTagName("h2")[0].innerText = count
            count--
        }, 1000)

        setTimeout(() => {
            clearInterval(interval)
            derrotaDiv.style.display = "none"
            chatDiv.style.display = "flex"
            socket.emit("novo usuario", sessao)
        }, 6000)
    })

    socket.on("lotou", () => {
        numero = 3
        const li = document.createElement("li")
        li.style.fontStyle = "italic"
        li.textContent = `Você entrou como espectador!`
        messages.appendChild(li)
        input.disabled = true
        enviar.disabled =true
        form.getElementsByTagName("p")[0].style.display = "none"
    })
})
