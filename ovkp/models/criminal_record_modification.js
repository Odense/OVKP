const mongoose = require('mongoose');

const CriminalRecordModificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    record_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'criminal_record'
    },
    type: {type: String, required: true },
    created_at: {type: Date, default: Date.now()}
});

const CriminalRecordModificationModel = mongoose.model('criminal_record_modification', CriminalRecordModificationSchema);

class CriminalRecordModification {
    constructor(user_id, record_id, type) {
        this.user_id = user_id;
        this.record_id = record_id;
        this.type = type;
    }

    static getAll() {
        return CriminalRecordModificationModel.find()
        .populate('user_id')
        .populate('record_id');
    }

    static getById(id) {
        return CriminalRecordModificationModel.findById(id)
        .populate('user_id')
        .populate('record_id');
    }
    static insert(mod) {
        const model = new CriminalRecordModificationModel(mod);
        return model.save()
        .then(saved => {return saved.id;});
    }
    static update(mod) {
        return CriminalRecordModificationModel.findOneAndUpdate({_id: mod.id}, mod, { new: true });
    }
    static delete(id) {
        return CriminalRecordModificationModel.findOne({ _id: id })
            .then( () => {
                return Promise.all([
                    CriminalRecordModificationModel.deleteOne({ _id: id }),
                ]);
            });
    }
}

module.exports = CriminalRecordModification;