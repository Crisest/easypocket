const express = require('express')
const router = new express.Router()
const Expense = require('../models/expense')
const auth = require('../middleware/auth')

router.get('/expenses', auth ,async (req, res) => {
    try {
        const expenses = await Expense.find({owner: req.user._id})
        if(!expenses){
            res.status(404).send()
        }
        res.send(expenses)
    } catch (error) {
        console.log(error)
        res.status(500)
    }
})


router.post('/expenses', auth ,async (req, res) => {
    try {
        const expense = new Expense({
            ...req.body,
            owner: req.user._id
        })
        
        if(!expense){
            res.status(400).send()
        }
        await expense.save()
        res.send(expense).status(201)
    } catch (error) {
        res.status(400).send(error.name)
    }
})

router.delete('/expenses', async (req, res) => {
    const expenses = await Expense.deleteMany({})
    res.send(expenses)
    
})

module.exports = router