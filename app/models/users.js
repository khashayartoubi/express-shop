import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

const Schema = mongoose.Schema;


const User = new Schema({
    phone: { type: String, required: true },
    password: { type: String, required: true },
    level: { type: Boolean, default: false },
})

User.statics.CreateToken = async (id, secretId, exp) => {
    return await jwt.sign({ id }, secretId, {
        expiresIn: exp
    })
}

User.statics.CheckToken = async (req, secretId) => {
    try {
        if (req) {
            const token = req.headers['token'];
            if (!token) return null;
            return await jwt.verify(token, secretId);
        }
    } catch (error) {
        throw new Error(error)
    }

}


export default mongoose.model('User', User)

