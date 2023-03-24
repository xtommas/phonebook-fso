const express = require('express')
const morgan = require('morgan')
const cors = require('cors')


const app = express()

app.use(express.json())
app.use(morgan('tiny'))
// middleware for deploying
app.use(cors())
app.use(express.static('build'))

let contacts = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    const numberOfContacts = contacts.length
    const currentDate = new Date()

    response.send('<p>Phonebook has info for ' + numberOfContacts + ' people</p><p>' + currentDate + '</p>')
})

app.get('/api/contacts', (request, response) => {
    response.json(contacts)
})

app.get('/api/contacts/:id', (request, response) => {
    const id = Number(request.params.id)
    const contact = contacts.find(contact => contact.id === id)

    if(contact) {
        response.json(contact)
    } else{
        response.status(404).end()
    }
})

app.delete('/api/contacts/:id', (request, response) => {
    const id = Number(request.params.id)
    contacts = contacts.filter(contact => contact.id !== id)

    response.status(204).end()
})

function generateId(){
    const maxId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) : 0

    return maxId + 1
}

function nameAlreadyInContacts(name) {
    for(let i = 0; i<contacts.length; i++) {
        if(contacts[i].name === name) {
            return true
        }
    }

    return false
}

app.post('/api/contacts', (request, response) => {
    if(!request.body.name || !request.body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    if(nameAlreadyInContacts(request.body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const contact = {
        id: generateId(),
        name: request.body.name,
        number: request.body.number,
    }

    contacts = contacts.concat(contact)

    response.json(contact)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})