import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const Schema = mongoose.Schema;


const Brand = new Schema({
    name: { type: String },
    lable: { type: String },
    category: [{ type: Schema.ObjectId, ref: "Category" }],
})

Brand.plugin(mongoosePaginate);

export default mongoose.model('Brand', Brand)