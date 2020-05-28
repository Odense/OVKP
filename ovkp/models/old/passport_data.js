const mongoose = require('mongoose');

const PassportDataSchema = new mongoose.Schema({
    passport_series: {type: String},
    passport_number: {type: String},
    passport_issuing_authority: {type: String},
    personal_code: {type: String},
});

const PassportDataModel = mongoose.model('passport_data', PassportDataSchema);

class PassportData {
    constructor(passport_series, passport_number, passport_issuing_authority, personal_code) {
        this.passport_series = passport_series;
        this.passport_number = passport_number;
        this.passport_issuing_authority = passport_issuing_authority;
        this.personal_code = personal_code;
    }

    static getAll() {
        return PassportDataModel.find();
    }

    static getById(id) {
        return PassportDataModel.findById(id);
    }

    static insert(passport_data) {
        const model = new PassportDataModel(passport_data);
        return model.save()
        .then(saved => {return saved.id;});
    }

    static update(passport_data) {
        return PassportDataModel.findOneAndUpdate({_id: passport_data.id}, passport_data, { new: true });
    }

    static delete(id) {
        return PassportDataModel.findOne({ _id: id })
            .then( () => {
                return Promise.all([
                    PassportDataModel.deleteOne({ _id: id }),
                ]);
            });
    }
}

module.exports = PassportData;