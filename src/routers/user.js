const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const Group = require('../models/group')

router.get('/users/me', auth ,async (req, res) => {
    try {
        res.send(req.user)
    } catch (error) {
        res.status(500)
    }  
})

router.patch('/users/me', auth, async (req, res) => {
    
    const allowedUpdates = ['email, password']
    const updates = Object.keys(req.body)
    const isValid = updates.every((update) => update.includes(allowedUpdates))
    if(!isValid){
        return res.status(400).send({error: 'Invalid Updates'})
    }
    try {
        updates.forEach(update => {
            req.user[update] = req.body[update]
            console.log(req.user[update] + req.body[update])
        })
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }

})

router.delete('/users/me', auth, async (req, res) =>{
    try {
        const user = await User.deleteOne(req.user)
        res.send(user)
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        if(!users){
            res.status(404)
        }
        res.send(users).status(200)
    } catch (error) {
        res.status(500)
        
    } 
})

router.post('/users', async (req, res) =>{
    // IF!GROUP NOT WORKING
    try {
        const group = await Group.findOne({name: req.body.groupName})
        if(!group){
            const user = new User({email: req.body.email, password: req.body.password})
            const newGroup = new Group({name: req.body.groupName})
            user.group = newGroup._id
            newGroup.owner = user._id
            const token = await user.generateAuthToken()
            await user.save()
            await newGroup.save()
            res.status(201).send({user, token, newGroup})
        }
        else{
            const user = new User({email: req.body.email, password: req.body.password, group: group._id})
            const token = await user.generateAuthToken()
            await user.save()
            res.status(201).send({user, token, group})
        }
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
        
    }
})

router.post('/users/login', async (req, res) =>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user, token})
    } catch (error) {
        res.status(500).send(error)
        console.log(error)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send(req.user).status(200)
    } catch (error) {
        res.status(500)
        console.log(error)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens =  []
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/users', async (req, res) => {
    try {
        await User.deleteMany({})
        res.status(200).send()
    } catch (error) {
        res.status(500).send(error)
    }
})


module.exports = router