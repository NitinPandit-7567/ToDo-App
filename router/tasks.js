const express = require('express');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync')

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ToDo').catch(e => console.log('Error :( ', e))
const List = require('../Models/list');
const Task = require('../Models/Task');

const color = {
    'New': 'warning',
    'In Progress': 'primary',
    'Completed': 'success'
}

const validateLogIn = function (req, res, next) {
    if (res.locals.isLoggedIn === true) {
        next();
    }
    else {
        if (req.originalUrl) {
            req.session.returnTo = req.originalUrl;
        }
        req.flash('error', 'Not Logged In, please login to proceed further')
        res.redirect('/login')
    }
}

router.get('/', wrapAsync(async (req, res, next) => {
    const tasks = await Task.find({}).populate('list');
    console.log(tasks)
    res.render('Task/index', { tasks, color })
}))

router.patch('/:id', validateLogIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log('ID: ', id, ' Status: ', status)
    const t = await Task.findByIdAndUpdate(id, { status: status }, { new: true });
    // const l = await List.findById(t.list._id).populate('tasks');
    // let count = 0;
    // for (let i of l.tasks) {
    //     if (i.status === 'Completed') {
    //         count++;
    //     }
    // }
    // if (count === l.tasks.length) {
    //     l.status = status;
    //     await l.save();
    // }
    // else if (l.status === 'Completed' && status != 'Completed') {
    //     l.status = 'In Progress';
    //     await l.save();
    // }
    // console.log(l)
    res.redirect(`/tasks/${id}`)
}))
router.delete('/:id', validateLogIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const l = await List.findOne({ tasks: { $in: id } })
    console.log('Updated List after Task deletion: ')
    const t = await Task.findByIdAndDelete(id)
    console.log(await List.findByIdAndUpdate(l._id, { $pull: { tasks: id } }, { new: true }))
    res.redirect('/tasks')
    // await Task.findByIdAndDelete(id);

}))
router.get('/:id/edit', validateLogIn, wrapAsync(async (req, res, next) => {

    const { id } = req.params;
    const t = await Task.findById(id).populate('list');
    res.render('Task/edit', { t, color })
}))

router.put('/:id', validateLogIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const { task, description, status } = req.body.tasks;
    const t = await Task.findByIdAndUpdate(id, { task: task, description: description, status: status });
    console.log(t)
    res.redirect(`/tasks/${id}`);
}))

router.get('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const t = await Task.findById(id).populate('list');
    const l = await List.findById(t.list._id).populate('username');
    const uname = l.username.username
    console.log(t.list)
    res.render('Task/show', { t, color, uname })
}))

module.exports = router;