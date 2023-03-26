require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')


const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny'))
// middleware for deploying
app.use(cors())


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
    const currentDate = new Date()

    Contact.find({}).then(contacts => {
        response.send('<p>Phonebook has info for ' + contacts.length + ' people</p><p>' + currentDate + '</p>')
    })
})

app.get('/api/contacts', (request, response) => {
    Contact.find({}).then(contacts => {
        response.json(contacts)
    })
})

app.get('/api/contacts/:id', (request, response, next) => {
    Contact.findById(request.params.id).then(contact => {
        if(contact) {
            response.json(contact)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/contacts/:id', (request, response, next) => {
    Contact.findByIdAndRemove(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/contacts/:id', (request, response, next) => {
    const { name, number } = request.body

    Contact.findByIdAndUpdate(
        request.params.id,
        { name, number },
        {new: true, runValidators: true, context: 'query'} 
    )
        .then(updatedContact => {
        response.json(updatedContact)
    })
    .catch(error => next(error))
})

// function generateId(){
//     const maxId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) : 0

//     return maxId + 1
// }

function nameAlreadyInContacts(name) {
    Contact.find({}).then(contacts => {
        for(let i = 0; i<contacts.length; i++) {
            if(contacts[i].name === name) {
                return true
            }
        }
    })

    return false
}

app.post('/api/contacts', (request, response, next) => {
    if(!request.body.name || !request.body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const contact = new Contact({
        name: request.body.name,
        number: request.body.number,
    })

    contact.save().then(savedContact => {
        response.json(savedContact)
    }).catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}
  
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})