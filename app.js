const express = require('express');
const app = express();
const listRouter = require('./router/lists');
const taskRouter = require('./router/tasks');
const AppError = require('./utils/AppError');
const wrapAsync = require('./utils/wrapAsync');
const mongoose = require('mongoose');
const List = require('./Models/list');
const Task = require('./Models/Task');
const Users = require('./Models/user');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

var isLoggedIn = false;


mongoose.connect('mongodb://127.0.0.1:27017/ToDo').then(() => console.log("Connected to DB")).catch(e => console.log('Error :( ', e))
app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)

app.use(session({
    secret: 'jedi'
}))
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(flash());
app.use(async (req, res, next) => {
    if (req.session.user_id) {
        isLoggedIn = true;
    }
    else {
        isLoggedIn = false;
    }
    console.log('IsLoggedIn: ', isLoggedIn)
    next();
})

app.use((req, res, next) => {
    res.locals.isLoggedIn = isLoggedIn;
    res.locals.user = req.session.user_id;
    res.locals.success = req.flash('success');
    res.locals.info = req.flash('info');
    res.locals.error = req.flash('error;')
    next();
})

app.use('/lists', listRouter)
app.use('/tasks', taskRouter)

app.get('/sign-up', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/logout', (req, res) => {
    if (req.session.user_id) {
        req.session.user_id = null;
        console.log('Logged Out')
        req.flash('info', 'Logged out Successfully')
        res.redirect('/')
    }
    else {
        req.flash('warning', 'Not logged in')
        res.redirect('/login')
    }
})

app.post('/register', wrapAsync(async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    const u = new Users({ username, password });
    await u.save();
    console.log(u)
    req.session.user_id = u._id;
    req.flash('success', 'Registered Successfully')
    res.redirect('/');
}))

app.post('/login', wrapAsync(async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    const user = await Users.findAndValidate(username, password);
    console.log(user)
    if (user) {
        req.session.user_id = user._id
        req.flash('success', 'Logged In successfully')
        const redirectUrl = req.session.returnTo || '/'
        req.session.returnTo = null;
        res.redirect(redirectUrl);
    }
    else {
        res.redirect('/login')
    }
}))

app.get('/', (req, res) => {
    res.render('index')
})
app.use((err, req, res, next) => {
    const { status = 500, message = 'Internal Server Error' } = err;
    console.log(err)
    res.status(status).render('error', { status, message })
})
app.listen(3000, '0.0.0.0', () => {
    console.log('Listening on port 3000.....')
})
