const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://Fajar:fajar1234@cluster0.sx4ff.mongodb.net/test?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const Contact = mongoose.model('Contact',{
    nama: {
        type: String,
    },
    noHP: {
        type: String,
        required : true
    },
    email: {
        type: String
    }
})

const contact1 = new Contact({
    nama: 'Sandhika',
    noHP: '08123456789',
    email: 'sandihka@gmail.com'
})
contact1.save().then(result => console.log(result))

