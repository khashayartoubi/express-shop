import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Multimedia = new Schema({
    name: { type: String, required: true },
    dimWidth: { type: String },
    dimHeight: { type: String },
    format: { type: String },
    dir: { type: String, required: true },
})



export default mongoose.model('Multimedia', Multimedia)