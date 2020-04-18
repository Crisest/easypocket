const mongoose = require('mongoose')


const expenseSchema = new mongoose.Schema({
    description: {
        required: true,
        type: String,
        trim: true,
        maxlength: 100
    },
    amount: {
        type: Number,
        default: 0.00,
        validate(val){
            if(val < 0){
                throw new Error('Amount should no be less than 0')
            }
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    }
},{
    timestamps:true
})




const Expense = mongoose.model('Expense', expenseSchema)

module.exports = Expense