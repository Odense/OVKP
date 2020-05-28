const express = require('express');
const path = require('path');
const User = require("./models/user");
const CriminalArticles = require("./models/criminal_articles");
const CriminalRecord = require("./models/criminal_record");
const mustache_expr = require('mustache-express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const PCCO = require("./models/pcco");
const testEmailAccount = require("./models/test_email_account");
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;
const dataBaseUrl = 'mongodb://localhost:27017/ovkp';
const connectOptions = {useNewUrlParser: true};

const viewsDir = path.join(__dirname, 'views');
app.engine('mst', mustache_expr(path.join(viewsDir, 'partials')));
app.set('views', viewsDir);
app.set('view engine', 'mst');
app.use(fileUpload());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'data/fs')));

app.use(express.static('public'));

mongoose.connect(dataBaseUrl, connectOptions)
.then(() => console.log(`Database conected: ${dataBaseUrl}`))
.then(() => app.listen(port, onListen))
.catch(err => console.log(`Error ${err}`));

function onListen() {
    console.log(`Server running at port ${port}`);
}

let curr_user = null;

app.get(`/`, function (req, res) {
    CriminalArticles.getAll()
    .then(articles => res.render(`main`, {articles: articles, user: curr_user}))
    .catch(err => res.status(500).send(err.toString()));
});

app.post(`/`, function (req, res) {
    CriminalRecord.getAll()
    .then(records => { return Promise.all([records, CriminalArticles.getAll()]); })
    .then(([records, articles]) => 
        res.render(`main`, 
        {
            articles: articles,
            ovkps: search(records, req.body.first_name, req.body.last_name, req.body.surname,
                req.body.case_number, req.body.article_id),
            user: curr_user
        }
    ))
    .catch(err => res.status(500).send(err.toString()));
});

app.get(`/articles`, function (req, res) {
    CriminalArticles.getAll()
    .then(articles => res.render(`articles`, {articles: articles, user: curr_user}))
    .catch(err => res.status(500).send(err.toString()));
});

app.get(`/article_add`, function (req, res) {
    res.render(`article_add`, {user: curr_user});
});

app.post('/article_add', function (req, res) {
    let article = new CriminalArticles(req.body.article_number, req.body.article_title, req.body.article_content);
    CriminalArticles.insert(article)
    .then(() => res.redirect(`/articles`))
    .catch(err => res.status(500).send(err.toString()));
});

app.get(`/article_modify/:id`, function (req, res) {
    CriminalArticles.getById(req.params.id)
    .then(article => res.render(`article_modify`, {article: article, user: curr_user}))
    .catch(err => res.status(500).send(err.toString()));
});

app.post('/article_modify', function (req, res) {
    const aricleId = req.body.aricleId;
    CriminalArticles.getById(aricleId)
    .then(article => {
    article.article_number = req.body.article_number;
    article.article_title = req.body.article_title;
    article.article_content = req.body.article_content;
    return CriminalArticles.update(article);
    })
    .then(res.redirect(`/articles`))
    .catch(err => res.status(500).send(err.toString()));
});

app.get(`/criminal_record`, function (req, res) { // todo
    res.render(`criminal_record`, {user: curr_user});
});

app.get(`/criminal_record_add`, function (req, res) { // todo
    PCCO.getAll()
    .then(pccos => res.render(criminal_record_add, {pccos: pccos, user: curr_user}))
    .catch(err => res.status(500).send(err.toString()));
});

app.post(`/criminal_record_add`, function (req, res) { // todo
    res.render(`criminal_record_add`, {user: curr_user});
});

app.get(`/criminal_record_modify/:id`, function (req, res) { // todo

    res.render(`criminal_record_modify`, {user: curr_user});
});

app.post(`/criminal_record_modify`, function (req, res) { // todo ебучие логи
    res.render(`criminal_record_modify`, {user: curr_user});
});

app.get(`/login`, function (req, res) {
    res.render(`login`, {user: curr_user});
});

app.post(`/login`, function (req, res) {
    User.getByEmailAndPassword(req.body.email, req.body.password)
    .then(user => {
        curr_user = user;
        if (!curr_user)
            res.redirect('/login');
        res.redirect('/');
    })
    .catch(err => res.status(500).send(err.toString()));
});

app.get(`/logout`, function (req, res) {
    curr_user = null;
    res.redirect('/login');
});

app.get(`/logs`, function (req, res) { // todo
    res.render(`logs`, {user: curr_user});
});

app.get(`/ovkp_add`, function (req, res) { // todo
    res.render(`ovkp_add`, {user: curr_user});
});

app.post(`/ovkp_add`, function (req, res) { // todo
    res.render(`ovkp_add`, {user: curr_user});
});

app.get(`/ovkp_modify/:id`, function (req, res) { // todo
    res.render(`ovkp_modify`, {user: curr_user});
});

app.get(`/ovkp_modify`, function (req, res) { // todo
    res.render(`ovkp_modify`, {user: curr_user});
});

app.get(`/registrars`, function (req, res) {
    User.getRegistrars()
    .then(registrars => res.render(`registrars`, {registrars: registrars, user: curr_user}))
    .catch(err => res.status(500).send(err.toString()));
});

app.get(`/registrars_add`, function (req, res) {
    res.render(`registrars_add`, {user: curr_user});
});

app.post('/registrars_add', function (req, res) {
    let user = new User(req.body.full_name, 1, req.body.email, req.body.password);
    User.insert(user)
    .then(() => res.redirect(`/registrars`))
    .catch(err => res.status(500).send(err.toString()));
});

function search(allCriminalRecords, first_name, last_name, surname, court_case_number, criminal_article_id) {
    let filteredByCaseNumber = [];
    if (court_case_number != '') {
        for (let record of allCriminalRecords) {
            if (record.court_case_number.includes(court_case_number)) {
                filteredByCaseNumber.push(record);
            }
        }
    }
    else filteredByCaseNumber = Array.from(allCriminalRecords);

    let filteredByFirstName = [];
    if (first_name != '') {
        for (let record of filteredByCaseNumber) {
            if (record.pcco.first_name.includes(first_name)) {
                filteredByFirstName.push(record);
            }
        }
    }
    else filteredByFirstName = Array.from(filteredByCaseNumber);

    let filteredByLastName = [];
    if (last_name != '') {
        for (let record of filteredByFirstName) {
            if (record.pcco.last_name.includes(last_name)) {
                filteredByLastName.push(record);
            }
        }
    }
    else filteredByLastName = Array.from(filteredByFirstName);
    
    let filteredBySurname = [];
    if (surname != '') {
        for (let record of filteredByLastName) {
            if (record.pcco.surname.includes(surname)) {
                filteredBySurname.push(record);
            }
        }
    }
    else filteredBySurname = Array.from(filteredByLastName);

    let filtered = [];
    if (criminal_article_id != '') {
        for (let record of filteredBySurname) {
            if (record.criminal_article.id.includes(criminal_article_id)) {
                filtered.push(record);
            }
        }
    }
    else filtered = Array.from(filteredBySurname);

    return filtered;
}

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: testEmailAccount.user,
        pass: testEmailAccount.pass
    }
});

app.get('/activate/:id', function (req, res) {
    const userId = req.params.id;
    User.getById(userId)
    .then(user => {
        user.is_active = true;
    return Promise.all([user, User.update(user)]);
    })
    .then(([user]) => {
        return transporter.sendMail({
            from: '"Anti-corruption Main Office" <ivannyakovlev99@gmail.com>',
            to: user.email,
            subject: "Активація акаунту",
            html: `<p style="font-family: Trebuchet MS, sans-serif; font-size: 12pt;">Вітаємо, <strong style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 14pt;">${user.full_name}</strong></p>` +
            '<p style="font-family: Trebuchet MS, sans-serif; font-size: 12pt;">Ваш акаунт було успішно активовано!</p>' +
            '<p style="font-family: Andale Mono, monospace; font-size: 12pt;">Ваші дані для авторизації в системі:</p>' +
            `<p style="font-family: Andale Mono, monospace; font-size: 10pt;"><i><b>Логін:</b></i> ${user.email}</p>` +
            `<p style="font-family: Andale Mono, monospace; font-size: 10pt;"><i><b>Пароль:</b></i> ${user.password}</p>`
        });
    })
    .then(() => res.redirect(`/registrars`))
    .catch(err => res.status(500).send(err.toString()));
});

app.get('/deactivate/:id', function (req, res) {
    const userId = req.params.id;
    User.getById(userId)
    .then(user => {
        user.is_active = false;
    return User.update(user);
    })
    .then(res.redirect(`/registrars`))
    .catch(err => res.status(500).send(err.toString()));
});

app.get('*', (req, res) => {
    res.status(404).end("Not found");
});