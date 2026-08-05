const mongoose = require('mongoose');
const User = require('./models/User');
const { config } = require('./src/config/env');

async function checkUsers() {
    await mongoose.connect('mongodb://127.0.0.1:27017/leftoverlink');
    const users = await User.find({}, 'name email role');
    console.log('--- USERS IN DB ---');
    console.log(JSON.stringify(users, null, 2));
    console.log('-------------------');
    await mongoose.disconnect();
}

checkUsers().catch(console.error);
