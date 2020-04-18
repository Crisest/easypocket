const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Group = require('../models/group')
const Expense = require('../models/expense')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('Email is invalid, please verify information')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(val){
            if(val.toLowerCase().includes('password')){
                throw new Error('Password cannot contain password, please change password')
            }
        }
    },
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    tokens: [{
        token: {
            required: true,
            type: String
        }
    }]
})

userSchema.virtual('expenses', {
    ref: 'Expense',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'thisismysecret')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('Unable to login')
    }
    const isValid = bcrypt.compare(password, user.password)
    if(!isValid){
        throw new Error('Email or password do not match.')
    }
    return user
}

userSchema.pre('save', async function(next){
    const user = this 
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Expense.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User