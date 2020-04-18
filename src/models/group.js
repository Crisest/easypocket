const mongoose = require('mongoose')
const User = require('../models/user')

const groupSchema = mongoose.Schema({
    name:{
        required: true,
        type: String,
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    }
})

groupSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'group'
})

groupSchema.pre('remove', async function(next) {
    const group = this
    await User.deleteMany({group: group._id})
    next()
})

const Group = mongoose.model('Group', groupSchema)

module.exports = Group