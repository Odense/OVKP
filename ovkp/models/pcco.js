const mongoose = require('mongoose');

const PCCOSchema = new mongoose.Schema({
    passport_series: {type: String},
    passport_number: {type: String},
    passport_issuing_authority: {type: String},
    personal_code: {type: String},

    first_name: {type: String},
    last_name: {type: String},
    surname: {type: String},
    work_position: {type: String},
    work_place: {type: String},
    birth_date: {type: Date},
    birth_place: {type: String},
    is_ukr_residence: {type: Boolean},
    residence: {type: String},
    is_personal: {type: Boolean},
    legal_form: {type: String}, // організаційно-правова форма юридичної особи
});

const PCCOModel = mongoose.model('pcco', PCCOSchema);

class PCCO {
    constructor(passport_series, passport_number, passport_issuing_authority, personal_code,
        first_name, last_name, surname, work_position, work_place,
        birth_date, birth_place, is_ukr_residence, residence, is_personal, legal_form) {

        this.passport_series = passport_series;
        this.passport_number = passport_number;
        this.passport_issuing_authority = passport_issuing_authority;
        this.personal_code = personal_code;

        this.first_name = first_name;
        this.last_name = last_name;
        this.surname = surname;
        this.work_position = work_position;
        this.work_place = work_place;
        this.birth_date = birth_date;
        this.birth_place = birth_place;
        this.is_ukr_residence = is_ukr_residence;
        this.residence = residence;
        this.is_personal = is_personal;
        this.legal_form = legal_form;
    }

    static async getAll() {
        return await PCCOModel.find();
    }

    static async getById(id) {
        return await PCCOModel.findById(id);
    }

    static async insert(pcco) {
        const model = new PCCOModel(pcco);
        return model.save()
        .then(saved => {return saved.id;});
    }

    static async update(pcco) {
        return await PCCOModel.findOneAndUpdate({_id: pcco._id}, pcco, { new: true });
    }
    static async delete(id) {
        return PCCOModel.findOne({ _id: id })
            .then( () => {
                return Promise.all([
                    PCCOModel.deleteOne({ _id: id }),
                ]);
            });
    }
}

module.exports = PCCO;