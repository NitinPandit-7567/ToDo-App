const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: 'Task'
    },
    list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List'
    },
    status: {
        type: String,
        enum: ['Completed', 'New', 'In Progress'],
        default: 'New'
    }
})

taskSchema.post('findOneAndUpdate', async (t) => {
    const List = require('./list')
    const l = await List.findById(t.list._id).populate('tasks');
    let count = 0;
    for (let i of l.tasks) {
        if (i.status === 'Completed') {
            count++;
        }
    }
    if (count === l.tasks.length) {
        l.status = t.status;
        console.log('HERE1: ', l.status)
        await l.save();
    }
    else if (l.status === 'Completed' && t.status != 'Completed') {
        l.status = 'In Progress';
        console.log('HERE2: ', l.status)
        await l.save();
    }
})

const Task = mongoose.model('Tasks', taskSchema);


module.exports = Task;