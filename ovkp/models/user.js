const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    full_name: {type: String},
    role: {type: Number, default: 0}, // 0 - Admin, 1 - Regist.
    email: {type: String, required: true },
    password: {type: String, required: true },
    created_at: {type: Date, default: Date.now()},
    is_active: {type: Boolean, default: false}
});

const UserModel = mongoose.model('user', UserSchema);

class User {
    constructor(full_name, role, email, password) {
        this.full_name = full_name;
        this.role = role;
        this.email = email;
        this.password = password;
    }

    static getAll() {
        return UserModel.find();
    }

    static getById(id) {
        return UserModel.findById(id);
    }

    static getByEmailAndPassword(email, password) {
        return UserModel.findOne({email: email, password: password});
    }

    static getRegistrars() {
        return UserModel.find({role: 1});
    }

    static insert(user) {
        const model = new UserModel(user);
        return model.save()
        .then(saved => {return saved.id;});
    }

    static update(user) {
        return UserModel.findOneAndUpdate({_id: user.id}, user, { new: true });
    }

    static delete(id) {
        return UserModel.findOne({ _id: id })
            .then( () => {
                return Promise.all([
                    UserModel.deleteOne({ _id: id }),
                ]);
            });
    }
}

module.exports = User;