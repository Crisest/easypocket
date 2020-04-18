const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')      
        const decoded = jwt.verify(token, 'thisismysecret')       
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        
        if(!user){
            throw new Error()
        }

        req.user = user
        req.token = token
    
        next()
    } catch (error) {
        console.log(error)
        res.status(401).send('Please Authenticate')
    }
}

module.exports = auth