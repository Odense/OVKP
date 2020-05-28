const mongoose = require('mongoose');

const CrimeInfoSchema = new mongoose.Schema({
    offence_description: {type: String},
    offence_method: {type: String},
    offence_location: {type: String}
});

const CrimeInfoModel = mongoose.model('crime_info', CrimeInfoSchema);

class CrimeInfo {
    constructor(offence_description, offence_method, offence_location) {
        this.offence_description = offence_description;
        this.offence_method = offence_method;
        this.offence_location = offence_location;
    }

    static getAll() {
        return CrimeInfoModel.find();
    }

    static getById(id) {
        return CrimeInfoModel.findById(id);
    }

    static insert(crime_info) {
        const model = new CrimeInfoModel(crime_info);
        return model.save()
        .then(saved => {return saved.id;});
    }

    static update(crime_info) {
        return CrimeInfoModel.findOneAndUpdate({_id: crime_info.id}, crime_info, { new: true });
    }

    static delete(id) {
        return CrimeInfoModel.findOne({ _id: id })
            .then( () => {
                return Promise.all([
                    CrimeInfoModel.deleteOne({ _id: id }),
                ]);
            });
    }
}

module.exports = CrimeInfo;