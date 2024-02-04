const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ToDo').then(() => console.log("Connected to DB")).catch(e => console.log('Error :( ', e))

const List = require('../Models/list');
const Task = require('../Models/Task');

const l = new List({
    title: 'Metro Shopping',
    date: '29/10/2023'
})

const taskSeed = [{
    task: 'Milk',
    description: 'Get 1L Milk',
    list: l
},
{
    task: 'Biscuits',
    description: 'Get 4 packets of Milano',
    list: l,
    status: 'In Progress'
},
{
    task: 'Nutella',
    description: 'Buy 1 bottle of Nutella',
    list: l,
    status: 'Completed'
}]

const seed = async function () {
    const task = await Task.insertMany(taskSeed)
    for (let i of task) {
        l.tasks.push(i)
    }
    console.log(task)
    await l.save();
}

seed();