const mongoose = require('mongoose');

const CriminalRecordSchema = new mongoose.Schema({
    pcco: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pcco'
    },
    court_name: {type: String},
    court_case_number: {type: String},
    court_sentence_date: {type: Date},
    court_sentence_number: {type: String},
    court_sentence_applying_date: {type: Date},
    criminal_record_cancellation_date: {type: Date},
    criminal_record_cancellation_reason: {type: String},
    is_active: {type: Boolean},

    criminal_article: {
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

    offence_description: {type: String},
    offence_method: {type: String},
    offence_location: {type: String}
});

const CriminalRecordModel = mongoose.model('criminal_record', CriminalRecordSchema);

class CriminalRecord {
    constructor(pcco, court_name, court_case_number,
        court_sentence_date, court_sentence_number, court_sentence_applying_date,
        criminal_record_cancellation_date, criminal_record_cancellation_reason, is_active,
        
        criminal_article, criminal_action_type, criminal_action_cancellation_date,
        criminal_action_cancellation_reason, disciplinary_action_type, disciplinary_action_details,
        disciplinary_action_cancellation_date, disciplinary_action_cancellation_reason,
        
        offence_description, offence_method, offence_location) {

        this.pcco = pcco;
        this.court_name = court_name;
        this.court_case_number = court_case_number;
        this.court_sentence_date = court_sentence_date;
        this.court_sentence_number = court_sentence_number;
        this.court_sentence_applying_date = court_sentence_applying_date;
        this.criminal_record_cancellation_date = criminal_record_cancellation_date;
        this.criminal_record_cancellation_reason = criminal_record_cancellation_reason;
        this.is_active = is_active;

        this.criminal_article = criminal_article;
        this.criminal_action_type = criminal_action_type;
        this.criminal_action_cancellation_date = criminal_action_cancellation_date;
        this.criminal_action_cancellation_reason = criminal_action_cancellation_reason;
        this.disciplinary_action_type = disciplinary_action_type;
        this.disciplinary_action_details = disciplinary_action_details;
        this.disciplinary_action_cancellation_date = disciplinary_action_cancellation_date;
        this.disciplinary_action_cancellation_reason = disciplinary_action_cancellation_reason;

        this.offence_description = offence_description;
        this.offence_method = offence_method;
        this.offence_location = offence_location;
    }

    toString() {
        
        return '         \npcco: ' + this.pcco +
        '         \ncourt_name: ' + this.court_name +
        '         \ncourt_case_number: ' + this.court_case_number +
        '         \ncourt_sentence_date: ' + this.court_sentence_date +
        '         \ncourt_sentence_number: ' + this.court_sentence_number +
        '         \ncourt_sentence_applying_date: ' + this.court_sentence_applying_date +
        '         \ncriminal_record_cancellation_date: ' + this.criminal_record_cancellation_date +
        '         \ncriminal_record_cancellation_reason: ' + this.criminal_record_cancellation_reason +
        '         \nis_active: ' + this.is_active +

        '         \ncriminal_article: ' + this.criminal_article.id +
        '         \ncriminal_action_type: ' + this.criminal_action_type +
        '         \ncriminal_action_cancellation_date: ' + this.criminal_action_cancellation_date +
        '         \ncriminal_action_cancellation_reason: ' + this.criminal_action_cancellation_reason +
        '         \ndisciplinary_action_type: ' + this.disciplinary_action_type +
        '         \ndisciplinary_action_details: ' + this.disciplinary_action_details +
        '         \ndisciplinary_action_cancellation_date: ' + this.disciplinary_action_cancellation_date +
        '         \ndisciplinary_action_cancellation_reason: ' + this.disciplinary_action_cancellation_reason +

        '         \noffence_description: ' + this.offence_description +
        '         \noffence_method: ' + this.offence_method +
        '         \noffence_location: ' + this.offence_location;
    }

    static getAll() {
        return CriminalRecordModel.find()
        .populate('pcco')
    }

    static getById(id) {
        return CriminalRecordModel.findById(id)
        .populate('pcco')
    }

    static insert(criminal_record) {
        const model = new CriminalRecordModel(criminal_record);
        return model.save()
        .then(saved => {return saved.id;});
    }

    static update(criminal_record) {
        return CriminalRecordModel.findOneAndUpdate({_id: criminal_record.id}, criminal_record, { new: true });
    }

    static delete(id) {
        return CriminalRecordModel.findOne({ _id: id })
            .then( () => {
                return Promise.all([
                    CriminalRecordModel.deleteOne({ _id: id }),
                ]);
            });
    }
}

module.exports = CriminalRecord;