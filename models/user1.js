const mongoose = require('mongoose');

const UserSchema1 = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  }
  
});
const User1 = mongoose.model('User1', UserSchema1);
module.exports = User1;