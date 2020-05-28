const mongoose = require('mongoose');

const PunishmentInfoSchema = new mongoose.Schema({
    criminal_article_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'criminal_articles'
    },
    criminal_action_type: {type: String},
    criminal_action_cancellation_date: {type: Date},
    criminal_action_cancellation_reason: {type: String},
    disciplinary_action_type: {type: String},
    disciplinary_action_details: {type: String},
    disciplinary_action_cancellation_date: {type: Date},
    disciplinary_action_cancellation_reason: {type: String},
});

const PunishmentInfoModel = mongoose.model('punishment_info', PunishmentInfoSchema);

class PunishmentInfo {
    constructor(criminal_article_id, criminal_action_type, criminal_action_cancellation_date,
        criminal_action_cancellation_reason, disciplinary_action_type, disciplinary_action_details,
        disciplinary_action_cancellation_date, disciplinary_action_cancellation_reason) {
        this.criminal_article_id = criminal_article_id;
        this.criminal_action_type = criminal_action_type;
        this.criminal_action_cancellation_date = criminal_action_cancellation_date;
        this.criminal_action_cancellation_reason = criminal_action_cancellation_reason;
        this.disciplinary_action_type = disciplinary_action_type;
        this.disciplinary_action_details = disciplinary_action_details;
        this.disciplinary_action_cancellation_date = disciplinary_action_cancellation_date;
        this.disciplinary_action_cancellation_reason = disciplinary_action_cancellation_reason;
    }

    static getAll() {
        return PunishmentInfoModel.find()
        .populate('criminal_article_id');
    }

    static getById(id) {
        return PunishmentInfoModel.findById(id)
        .populate('criminal_article_id');
    }
    static insert(punishment_info) {
        const model = new PunishmentInfoModel(punishment_info);
        return model.save()
        .then(saved => {return saved.id;});
    }
    static update(punishment_info) {
        return PunishmentInfoModel.findOneAndUpdate({_id: punishment_info.id}, punishment_info, { new: true });
    }

    static delete(id) {
        return PunishmentInfoModel.findOne({ _id: id })
            .then( () => {
                return Promise.all([
                    PunishmentInfoModel.deleteOne({ _id: id }),
                ]);
            });
    }4
}

module.exports = PunishmentInfo;