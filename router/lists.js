const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync')

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ToDo').catch(e => console.log('Error :( ', e))

const List = require('../Models/list');
const Task = require('../Models/Task');
const Users = require('../Models/user');
const flash = require('connect-flash')
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
    const lists = await List.find({}).populate('tasks').populate('username');
    res.render('List/index', { lists, color })
}))

router.get('/my-lists', validateLogIn, wrapAsync(async (req, res, next) => {
    const id = req.session.user_id;
    const u = await Users.findById(id).populate('lists');
    const lists = await List.find({ username: u._id }).populate('tasks').populate('username');
    res.render('List/index', { lists, color })
}))

router.get('/new', validateLogIn, (req, res) => {
    res.render('List/new')
})

router.post('/:id/newTask', validateLogIn, wrapAsync(async (req, res, next) => {

    const { id } = req.params;
    const { task } = req.body;
    const l = await List.findById(id);
    const t = new Task({ task: task, list: l });
    await t.save();
    l.tasks.push(t);
    await l.save();
    console.log('List updated: ', l);
    res.redirect(`/lists/${id}`);
}))

router.post('/', validateLogIn, wrapAsync(async (req, res, next) => {
    const { title, date, status } = req.body.list;
    const u = await Users.findById(req.session.user_id).populate('lists');
    console.log('In new list: ', u)
    const new_l = new List({
        title: title,
        username: u,
        date: date,
        status: status
    })
    await new_l.save();
    u.lists.push(new_l);
    await u.save();
    res.redirect(`/lists/${new_l._id}`)
}))
router.patch('/:id/status', validateLogIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log('Req body: ', status)
    const l = await List.findByIdAndUpdate(id, { status: status }, { new: true }).populate('tasks').populate('username');
    if (l.status === 'Completed') {
        for (let i of l.tasks) {
            await Task.findByIdAndUpdate(i._id, { status: l.status });
            console.log('Task update: ', i)
        }
    }
    console.log("Status of ", l.title, " has been updated: ", l)
    res.redirect(`/lists/${id}`);
}))

router.patch('/:id', validateLogIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body
    const l = await List.findByIdAndUpdate(id, { status: status }, { new: true });
    console.log(l);
    res.redirect(`/lists/${l._id}`);

}))
router.delete('/:id', validateLogIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await List.findByIdAndDelete(id).populate('tasks').populate('username');
    res.redirect('/lists')
}))

router.get('/:id', validateLogIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const { new_task } = req.query;
    console.log('Request query: ', req.query)
    const l = await List.findById(id).populate('tasks').populate('username');
    res.render('List/show.ejs', { l, color, new_task })
}))

module.exports = router;