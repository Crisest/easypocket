const Group = require('../models/group')

const ownerMW = async (req, res, next) => {
    try {
        const group = await Group.findOne({owner: req.user._id})

        if(!group){
            throw new Error()
        }
        req.group = group
        next()
    } catch (error) {
        res.status(401).send('You do not have the required permissions')
    }
}

module.exports = ownerMW