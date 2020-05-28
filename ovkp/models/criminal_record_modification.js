const mongoose = require('mongoose');

const CriminalRecordModificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    record: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'criminal_record'
    },
    old_values: {type: String},
    new_values: {type: String},
    type: {type: String, required: true },
    created_at: {type: Date, default: Date.now()}
});

const CriminalRecordModificationModel = mongoose.model('criminal_record_modification', CriminalRecordModificationSchema);

class CriminalRecordModification {
    constructor(user, record, type, old_values, new_values) {
        this.user = user;
        this.record = record;
        this.type = type;
        this.old_values = old_values;
        this.new_values = new_values;
    }

    toString() {
        return "user: " + 
        "  \nid: " + this.user.id +
        "  \nfull_name: " + this.user.full_name +
        "\nrecord_id: " + this.record.id +
        "\nold_values: " + this.old_values +
        "\nnew_values: " + this.new_values +
        "\ntype: " + this.type +
        "\ncreated_at: " + this.created_at;
    }

    static getAll() {
        return CriminalRecordModificationModel.find()
        .populate('user')
        .populate('record');
    }

    static getById(id) {
        return CriminalRecordModificationModel.findById(id)
        .populate('user')
        .populate('record');
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