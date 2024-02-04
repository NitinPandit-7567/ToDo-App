const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    },
    lists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List'
    }]
})

userSchema.statics.findAndValidate = async function (username, password) {
    console.log('pass: ', password, ' usernmae: ', username)
    const u = await this.findOne({ username });
    if (u) {
        const result = await bcrypt.compare(password, u.password);
        if (result) {
            return u;
        }
        else {
            return false;
        }
    }
    else {
        return false
    }
}

userSchema.pre('save', async function (next) {
    console.log('HERE')
    console.log(!this.isModified('password'))
    if (!this.isModified('password')) {
        return next();
    }
    else {
        this.password = await bcrypt.hash(this.password, 12);
        console.log(this.password)
        next();
    }
})

module.exports = mongoose.model('Users', userSchema)