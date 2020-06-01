const mongoose = require('mongoose');

const CriminalArticlesSchema = new mongoose.Schema({
    article_number: {type: Number},
    article_title: {type: String},
    article_content: {type: String}
});

const CriminalArticlesModel = mongoose.model('criminal_articles', CriminalArticlesSchema);

class CriminalArticles {
    constructor(article_number, article_title, article_content) {
        this.article_number = article_number;
        this.article_title = article_title;
        this.article_content = article_content;
    }

    static async getAll() {
        return await CriminalArticlesModel.find();
    }

    static async getById(id) {
        return await CriminalArticlesModel.findById(id);
    }
    
    static insert(article) {
        const model = new CriminalArticlesModel(article);
        return model.save()
        .then(saved => {return saved.id;});
    }
    static async update(article) {
        return await CriminalArticlesModel.findOneAndUpdate({_id: article.id}, article, { new: true });
    }
    static delete(id) {
        return CriminalArticlesModel.findOne({ _id: id })
            .then( () => {
                return Promise.all([
                    CriminalArticlesModel.deleteOne({ _id: id }),
                ]);
            });
    }
}

module.exports = CriminalArticles;