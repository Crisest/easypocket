const express = require('express')
const router = express.Router()
const Group = require('../models/group')
const auth = require('../middleware/auth')
const groupOwner = require('../middleware/groupOwner')
const Expense = require('../models/expense')

router.get('/group/users', auth, groupOwner, async (req, res) => {
    try {
        const group = await req.group.populate('users').execPopulate()
        res.send(group.users)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/group/expenses', auth, groupOwner, async (req, res) => {
    try {
        
        const group = await req.group.populate('users', '_id').execPopulate()
        const users = group.users
        const usersID = []
        users.forEach(user => {
            usersID.push(user._id)
        });
        const expenses = await Expense.find({owner: usersID})
        if(!expenses){
            res.status(404).send()
        }
        res.send(expenses)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/group/me', auth, groupOwner, async (req, res) =>{

    const group = await Group.findOne({name: req.body.name})
    if(!group){
        const updates = Object.keys(req.body)
        const updatesAllowed = ['name']
        const isAllowed = updates.every((update) => updatesAllowed.includes(update))
        if(!isAllowed){
           return  res.status(400).send('Updates not allowed')
        }
        try {
            updates.forEach((update) =>  req.group[update] = req.body[update])
            await req.group.save()
            res.send(req.group)
        } catch (error) {
            res.status(500).send()
        }
    }
    else{
        res.status(400).send('Group name must be unique!')
    }

})


router.get('/group', auth, async (req, res) => {
    try {
        const group = await Group.find({})
        if(!group){
            res.status(404).send()
        }
        res.send(group).status(201)
    } catch (error) {
        res.status(500).send(error)
    }    
})

router.delete('/group', auth, async (req, res) => {
    try {
        const group = await Group.deleteMany({})
        res.send(group).status(201)
    } catch (error) {
        res.status(500).send(error)
    }    
})





module.exports = router