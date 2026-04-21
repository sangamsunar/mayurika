const mongoose = require('mongoose')
const { Schema } = mongoose

const messageSchema = new Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, { timestamps: true })

const chatSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    messages: [messageSchema]
}, { timestamps: true })

const Chat = mongoose.model('Chat', chatSchema)
module.exports = Chat
