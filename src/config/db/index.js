const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
        console.log("Connect Successfully!!!");
    } catch (error) {
        console.log('Connect failure!!!');
    }
}

module.exports = { connect };
