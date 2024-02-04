const mongoose = require('mongoose');
const Task = require('./Task')
const User = require('./user')
const listSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'New Task'
    },
    // username: {
    //     type: String,
    //     required: true,
    //     default: 'admin'
    // },
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tasks'
    }],
    date: String,
    status: {
        type: String,
        enum: ['Completed', 'New', 'In Progress'],
        default: 'New'
    }
})


listSchema.post('findOneAndDelete', async (d) => {
    for (let i of d.tasks) {
        await Task.findByIdAndDelete(i._id)
    }
    await User.findByIdAndUpdate(d.username._id, { $pull: { lists: d._id } })
})

const List = mongoose.model('List', listSchema);

module.exports = List;