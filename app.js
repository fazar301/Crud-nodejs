const {MongoClient, ObjectId} = require('mongodb')
const mongoose = require('mongoose')
const { body, validationResult } = require('express-validator');
const { check } = require('express-validator');
const methodOverride = require('method-override');
// Flash Message npm
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
// Flash Message npm
// Image
const fs = require('fs')
const path = require('path')
const multer = require('multer')
// Image
mongoose.connect('mongodb+srv://Fajar:fajar1234@cluster0.sx4ff.mongodb.net/test?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const express = require('express')
const app = express();
const expressLayouts = require('express-ejs-layouts');

app.set('view engine','ejs')
app.use(expressLayouts)
app.set('layout', 'main');
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser('secret'))
app.use(session({cookie: {maxAge: 6000},secret: 'secret',resave: true,saveUninitialized: true }))
app.use(flash())
app.use(methodOverride('_method'));

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
    },
    img: {
        data: Buffer,
        contentType: String
    }
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage });

app.get('/contact',async (req,res) =>{
    const data = await Contact.find()
    // console.log(data[0].img.data.toString('base64'))
    res.render('contact',{title: 'Halaman Contact',data,msg: req.flash('msg')})
})

// Route Tambah
app.post('/contact/add',upload.single('image'),check('noHP','Nomor Hp tidak valid!').isMobilePhone('id-ID'),async (req,res) => {
    if(req.body.email){
        await body('email').isEmail().withMessage('Email tidak valid!').run(req)
    }
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        return res.render('tambah',{title: 'Halaman Tambah',errors: errors.array(),data: req.body})
    }
    const contact = {
        nama: req.body.nama,
        noHP: req.body.noHP,
        email: req.body.email,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))
        }
    }
    await new Contact(contact).save()
    req.flash('msg','Data contact berhasil ditambahkan!')
    res.redirect('/contact')

})
// Akhir Route Tambah
// Route Update
app.put('/contact/update/:id',check('noHP','Nomor Hp tidak valid!').isMobilePhone('id-ID'),async (req,res) => {
    if(req.body.email){
        await body('email').isEmail().withMessage('Email tidak valid!').run(req)
    }
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        return res.render('update',{title: 'Halaman Update',errors: errors.array(),data: req.body})
    }
    // await update(db,req.params.id,req.body)
    await Contact.updateOne({_id: new ObjectId(req.params.id)},req.body)
    req.flash('msg','Data contact berhasil diubah!')
    res.redirect('/contact')
})
// AKhir route update
// Router Delete
app.use( function( req, res, next ) {
    // this middleware will call for each requested
    // and we checked for the requested query properties
    // if _method was existed
    // then we know, clients need to call DELETE request instead
    if ( req.query._method == 'DELETE' ) {
        // change the original METHOD
        // into DELETE method
        req.method = 'DELETE';
        // and set requested url to /user/12
        req.url = req.path;
    }       
    next(); 
});
app.delete( '/contact/:id', async ( req, res,next ) => {
    // delete operation stuff
    if(req.params.id.length !== 24){
        next()
    }
    const contact = await Contact.deleteOne({_id: new ObjectId(req.params.id)})
    
    if(contact.n === 0){
        return next()
    }
    console.log(contact)
    req.flash('msg','Contact berhasil dihapus')
    res.redirect('/contact')
});
// AKhir route Delete


app.get('/',(req,res) => {
    res.render('home', {title: 'Halaman Home'})
})
app.get('/about',(req,res) => {
    res.render('about',{title: 'Halaman About'})
})
// Halaman Tambah
app.get('/contact/add',(req,res) => {
    res.render('tambah',{title: 'Halaman Tambah'})
})
// AKhir HAlaman Tambah
// Halaman Update
app.get('/contact/update/:id',async (req,res,next) => {
    if(req.params.id.length !== 24){
        next()
    }
    const contact = await Contact.findOne({_id: new ObjectId(req.params.id)})
    if(!contact){
        return next()
    }
    res.render('update',{title: 'Halaman Update',data: contact})
})
// Akhir Halaman Update
app.get('/contact/:id',async (req,res) => {
    if(req.params.id.length !== 24){
        return res.render('detail',{title:'Halaman Detail',contact:null})
    }
    const contact = await Contact.findOne({_id: new ObjectId(req.params.id)})
    // console.log(contact)
    res.render('detail',{title:'Halaman Detail',contact})
})
app.use('/', (req,res) => {
    res.statusCode = 404;
    res.render('notFound',{title: 'Not FoundT_T'})
})
app.listen(3000,() =>{
    console.log('server listening on port 3000...')
})