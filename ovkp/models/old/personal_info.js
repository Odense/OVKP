const mongoose = require('mongoose');

const PersonalInfoSchema = new mongoose.Schema({
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

const PersonalInfoModel = mongoose.model('personal_info', PersonalInfoSchema);

class PersonalInfo {
    constructor(first_name, last_name, surname, work_position, work_place,
        birth_date, birth_place, is_ukr_residence, residence, is_personal, legal_form) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.surname = surname;
        this.work_position = work_position;
        this.work_place = work_place;
    }

    static getAll() {
        return PersonalInfoModel.find();
    }

    static getById(id) {
        return PersonalInfoModel.findById(id);
    }

    static insert(personal_info) {
        const model = new PersonalInfoModel(personal_info);
        return model.save()
        .then(saved => {return saved.id;});
    }

    static update(personal_info) {
        return PersonalInfoModel.findOneAndUpdate({_id: personal_info.id}, personal_info, { new: true });
    }

    static delete(id) {
        return PersonalInfoModel.findOne({ _id: id })
            .then( () => {
                return Promise.all([
                    PersonalInfoModel.deleteOne({ _id: id }),
                ]);
            });
    }
}

module.exports = PersonalInfo;