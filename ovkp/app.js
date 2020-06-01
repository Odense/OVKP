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
const fs = require('fs');

const app = express();
const port = 3000;
const dataBaseUrl = 'mongodb://localhost:27017/ovkp';
const connectOptions = { useNewUrlParser: true };

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

app.get(`/`, async (req, res) => {
    try {
        const articles = await CriminalArticles.getAll();
        res.render(`main`, { articles: articles, user: curr_user });
    } catch(err) {
        res.status(500).send(err.toString());
    }
});

app.post(`/`, async (req, res) => {
    try {
        const records = await CriminalRecord.getAll();
        const articles = await CriminalArticles.getAll();
        let filtered_records = search(records, req.body.first_name, req.body.last_name, req.body.surname,
            req.body.case_number, req.body.article_id);
        let is_user_exists = false;
        if (curr_user)
        is_user_exists = true;
        res.render(`main`,
                {
                    articles: articles,
                    records: filtered_records,
                    user: curr_user,
                    is_user_exists: is_user_exists
                }
            );
    } catch(err) {
        res.status(500).send(err.toString());
    }
    // CriminalRecord.getAll()
    //     .then(records => { return Promise.all([records, CriminalArticles.getAll()]); })
    //     .then(([records, articles]) =>
    //         res.render(`main`,
    //             {
    //                 articles: articles,
    //                 ovkps: search(records, req.body.first_name, req.body.last_name, req.body.surname,
    //                     req.body.case_number, req.body.article_id),
    //                 user: curr_user
    //             }
    //         ))
    //     .catch(err => res.status(500).send(err.toString()));
});

/************************************
 *                                  *
 *        ARTICLES ENDPOINTS        *          
 *                                  *
 ************************************/

app.get(`/articles`, async (req, res) => {
    try {
       const articles = await CriminalArticles.getAll();
       res.render(`articles`, { articles: articles, user: curr_user });
    } catch(err) {
        res.status(500).send(err.toString());
    }
});

app.get(`/article_add`, function (req, res) {
    res.render(`article_add`, { user: curr_user });
});

app.post('/article_add', function (req, res) {
    let article = new CriminalArticles(req.body.article_number, req.body.article_title, req.body.article_content);
    CriminalArticles.insert(article)
        .then(() => res.redirect(`/articles`))
        .catch(err => res.status(500).send(err.toString()));
});

app.get(`/article_modify/:id`, async (req, res) => {
    try {
        const article = CriminalArticles.getById(req.params.id);
        res.render(`article_modify`, { article: article, user: curr_user });
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.post('/article_modify', async (req, res) => {
    try {
        const aricleId = req.body.aricleId;
        const article = await CriminalArticles.getById(aricleId);
        article.article_number = req.body.article_number;
        article.article_title = req.body.article_title;
        article.article_content = req.body.article_content;
        await CriminalArticles.update(article);
        res.redirect(`/articles`);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

/************************************
 *                                  *
 *      CRIMINAL REC ENDPOINTS      *
 *                                  *
 ************************************/

app.get(`/criminal_records`, async (req, res) => {
    try {
        const record_l = await CriminalRecord.getAll();
        res.render(`criminal_records`, { record_l: record_l, user: curr_user });
    } catch (err) {
        err => res.status(500).send(err.toString());
    }
});

app.get(`/criminal_records/:id`, async (req, res) => {
    try {
        const record = await CriminalRecord.getById(req.params.id);
        res.render(`criminal_record`, { record: record, user: curr_user, pcco: record.pcco, article: record.criminal_article });
    } catch (err) {
        err => res.status(500).send(err.toString());
    }
});

app.get(`/criminal_record_add`, async (req, res) => {
    try {
        const pcco_l = await PCCO.getAll();
        const article_l = await CriminalArticles.getAll();
        res.render('criminal_record_add', { pccos: pcco_l, user: curr_user, articles: article_l });
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.post(`/criminal_record_add`, async (req, res) => {
    try {
        const article = await CriminalArticles.getById(req.body.criminal_article);
        const pcco = await PCCO.getById(req.body.pcco_id);
        const record_to_add = new CriminalRecord(pcco, req.body.court_name, req.body.court_case_number, req.body.court_sentence_date,
                                                req.body.court_sentence_number, req.body.court_sentence_applying_date,
                                                req.body.criminal_record_cancellation_date, req.body.criminal_record_cancellation_reason,
                                                req.body.is_active === 'true', article, req.body.criminal_action_type,
                                                req.body.criminal_action_cancellation_date, req.body.criminal_action_cancellation_reason,
                                                req.body.disciplinary_action_type, req.body.disciplinary_action_details,
                                                req.body.disciplinary_action_cancellation_date, req.body.disciplinary_action_cancellation_reason,
                                                req.body.offence_description, req.body.offence_method, req.body.offence_location);
        const created_record_id = await CriminalRecord.insert(record_to_add);
        let record_to_log = { old_value: null,
                            new_value: record_to_add };
        const log_str = JSON.stringify(record_to_log, null, 4);
        fs.writeFileSync('./data/logs.json', log_str);
        res.redirect(`/criminal_records/${created_record_id}`);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.get(`/criminal_record_modify/:id`, async (req, res) => {
    try {
        const pcco_l = await PCCO.getAll();
        const article_l = await CriminalArticles.getAll();
        const record_to_update = await CriminalRecord.getById(req.params.id);
        res.render(`criminal_record_modify`, { user: curr_user, record: record_to_update, pccos: pcco_l, articles: article_l });
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.post(`/criminal_record_modify/:id`, async (req, res) => {
    try {
        const article = await CriminalArticles.getById(req.body.criminal_article);
        const pcco = await PCCO.getById(req.body.pcco_id);
        let record_to_update = await CriminalRecord.getById(req.params.id);
        let record_to_log = { old_value: record_to_update,
                              new_value: null };
        record_to_update.pcco = pcco, 
        record_to_update.court_name = req.body.court_name; 
        record_to_update.court_case_number = req.body.court_case_number;
        record_to_update.court_sentence_date = req.body.court_sentence_date;
        record_to_update.court_sentence_number = req.body.court_sentence_number;
        record_to_update.court_sentence_applying_date = req.body.court_sentence_applying_date;
        record_to_update.criminal_record_cancellation_date = req.body.criminal_record_cancellation_date;
        record_to_update.criminal_record_cancellation_reason = req.body.criminal_record_cancellation_reason;
        record_to_update.is_active = req.body.is_active === 'true';
        record_to_update.article = article;
        record_to_update.criminal_action_type = req.body.criminal_action_type;
        record_to_update.criminal_action_cancellation_date = req.body.criminal_action_cancellation_date;
        record_to_update.criminal_action_cancellation_reason = req.body.criminal_action_cancellation_reason;
        record_to_update.disciplinary_action_type = req.body.disciplinary_action_type;
        record_to_update.disciplinary_action_details = req.body.disciplinary_action_details;
        record_to_update.disciplinary_action_cancellation_date = req.body.disciplinary_action_cancellation_date;
        record_to_update.disciplinary_action_cancellation_reason = req.body.disciplinary_action_cancellation_reason;
        record_to_update.offence_description = req.body.offence_description;
        record_to_update.offence_method = req.body.offence_method;
        record_to_update.offence_location = req.body.offence_location;
        const updated_record = await CriminalRecord.update(record_to_update);
        record_to_log.new_value = record_to_update;
        const log_str = JSON.stringify(record_to_log, null, 4);
        fs.writeFileSync('./data/logs.json', log_str);
        res.redirect(`/criminal_records/${updated_record._id}`);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

/************************************
 *                                  *
 *          AUTH ENDPOINTS          *
 *                                  *
 ************************************/

app.get(`/login`, function (req, res) {
    res.render(`login`, { user: curr_user });
});

app.post(`/login`, async (req, res) => {
    try {
        const curr_user = await User.getByEmailAndPassword(req.body.email, req.body.password);
        if (!curr_user || !curr_user.is_active)
                res.redirect('/login?denied');
    } catch (err) {
        res.status(403).send(err.toString());
    }
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

/************************************
 *                                  *
 *         LOGGING ENDPOINT         *
 *                                  *
 ************************************/

app.get(`/logs`, function (req, res) {
    const log_obj = JSON.parse(fs.readFileSync('./data/logs.json', 'utf8'));
    res.render(`logs`, {
        new_values: JSON.stringify(log_obj.new_value, null, 4),
        old_values: JSON.stringify(log_obj.old_value, null, 4),
        user: curr_user
    });
});

/************************************
 *                                  *
 *          OVKP ENDPOINTS          *          
 *                                  *
 ************************************/

app.get(`/ovkps`, async (req, res) => {
    try {
        const pcco_l = await PCCO.getAll();
        res.render(`ovkps`, { pcco_l: pcco_l, user: curr_user });
    } catch (err) {
        err => res.status(500).send(err.toString());
    }
});

app.get(`/ovkps/:id`, async (req, res) => {
    try {
        const pcco = await PCCO.getById(req.params.id);
        res.render(`ovkp`, { pcco: pcco, user: curr_user });
    } catch (err) {
        err => res.status(500).send(err.toString());
    }
});

app.get(`/ovkp_add`, function (req, res) {
    res.render(`ovkp_add`, { user: curr_user });
});

app.post(`/ovkp_add`, async (req, res) => {
    let pcco_to_add = new PCCO(req.body.passport_series, req.body.passport_number, req.body.passport_issuing_authority,
        req.body.personal_code, req.body.first_name, req.body.last_name, req.body.surname,
        req.body.work_position, req.body.work_place, req.body.birth_date, req.body.birth_place,
        req.body.is_ukr_residence, req.body.residence, req.body.is_personal === 'true', false);
    try {
        const created_pcco_id = await PCCO.insert(pcco_to_add);
        res.redirect(`/ovkps/${created_pcco_id}`);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.get(`/ovkp_modify/:id`, async (req, res) => {
    try {
        const pcco_to_update = await PCCO.getById(req.params.id);
        res.render(`ovkp_modify`, { user: curr_user, old_pcco: pcco_to_update });
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.post(`/ovkp_modify/:id`, async (req, res) => {
    try {
        const pcco_to_update = await PCCO.getById(req.params.id);
        pcco_to_update.passport_series = req.body.passport_series;
        pcco_to_update.passport_number = req.body.passport_number;
        pcco_to_update.passport_issuing_authority = req.body.passport_issuing_authority;
        pcco_to_update.personal_code = req.body.personal_code;
        pcco_to_update.first_name = req.body.first_name;
        pcco_to_update.last_name = req.body.last_name;
        pcco_to_update.surname = req.body.surname;
        pcco_to_update.work_position = req.body.work_position;
        pcco_to_update.work_place = req.body.work_place;
        pcco_to_update.birth_date = req.body.birth_date;
        pcco_to_update.birth_place = req.body.birth_place;
        pcco_to_update.is_ukr_residence = true;
        pcco_to_update.residence = req.body.residence;
        pcco_to_update.is_personal = req.body.is_personal === 'true';
        pcco_to_update.legal_form = false;
        const updated_pcco = await PCCO.update(pcco_to_update);
        res.redirect(`/ovkps/${updated_pcco._id}`);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

/************************************
 *                                  *
 *     REGISTRATORS ENDPOINTS       *          
 *                                  *
 ************************************/


app.get(`/registrars`, function (req, res) {
    User.getRegistrars()
        .then(registrars => res.render(`registrars`, { registrars: registrars, user: curr_user }))
        .catch(err => res.status(500).send(err.toString()));
});

app.get(`/registrars_add`, function (req, res) {
    res.render(`registrars_add`, { user: curr_user });
});

app.post('/registrars_add', function (req, res) {
    let user = new User(req.body.full_name, 1, req.body.email, req.body.password);
    User.insert(user)
        .then(() => res.redirect(`/registrars`))
        .catch(err => res.status(500).send(err.toString()));
});

function search(allCriminalRecords, first_name, last_name, surname, court_case_number, criminal_article_id) {
    let filteredByCaseNumber = [];
    if (court_case_number) {
        for (let record of allCriminalRecords) {
            if (record.court_case_number.includes(court_case_number)) {
                filteredByCaseNumber.push(record);
                console.log('ok1');
            }
        }
    }
    else filteredByCaseNumber = Array.from(allCriminalRecords);
    console.log('filter1: ' + first_name);    
    let filteredByFirstName = [];
    if (first_name) {
        for (let record of filteredByCaseNumber) {
            if (record.pcco.first_name.includes(first_name)) {
                filteredByFirstName.push(record);
                console.log('ok1');
            }
        }
    }
    else filteredByFirstName = Array.from(filteredByCaseNumber);
    console.log('filter2: ' + last_name);
    let filteredByLastName = [];
    if (last_name) {
        for (let record of filteredByFirstName) {
            if (record.pcco.last_name.includes(last_name)) {
                filteredByLastName.push(record);
                console.log('ok2');
            }
        }
    }
    else filteredByLastName = Array.from(filteredByFirstName);
    console.log('filter3: ' + surname);
    let filteredBySurname = [];
    if (surname) {
        for (let record of filteredByLastName) {
            if (record.pcco.surname.includes(surname)) {
                filteredBySurname.push(record);
                console.log('ok3');
            }
        }
    }
    else filteredBySurname = Array.from(filteredByLastName);
    console.log('filter4: ' + criminal_article_id);
    let filtered = [];
    if (criminal_article_id) {
        for (let record of filteredBySurname) {
            // eslint-disable-next-line eqeqeq
            if (record.criminal_article._id == criminal_article_id) {                
                filtered.push(record);
                console.log('ok4');
            }
        }
    }
    else filtered = Array.from(filteredBySurname);
    console.log('filter5: ');
    console.log(filtered);
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

app.get('/deactivate/:id', function (req, res) {
    const userId = req.params.id;
    User.getById(userId)
        .then(user => {
            user.is_active = false;
            return Promise.all([user, User.update(user)]);
        })
        .then(([user]) => {
            return transporter.sendMail({
                from: '"Anti-corruption Main Office" <ivannyakovlev99@gmail.com>',
                to: user.email,
                subject: "Деактивація акаунту",
                html: `<p style="font-family: Trebuchet MS, sans-serif; font-size: 12pt;">Вітаємо, <strong style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 14pt;">${user.full_name}</strong></p>` +
                    '<p style="font-family: Trebuchet MS, sans-serif; font-size: 12pt;">Вибачте, Ваш акаунт було деактивовано!</p>'                
            });
        })
        .then(() => res.redirect(`/registrars`))
        .catch(err => res.status(500).send(err.toString()));
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

app.get('*', (req, res) => {
    res.status(404).end("Not found");
});