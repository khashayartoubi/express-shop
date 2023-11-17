import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const Schema = mongoose.Schema;


const CategorySchema = new Schema({
    name: { type: String, required: true },
    lable: { type: String },
    parent: { type: Schema.ObjectId, ref: 'Category' },
    // image: { type: Schema.ObjectId, ref: 'Multimedia', require: true },
}, {
    timestamps: true
});

// required for paginate method in resolver
CategorySchema.plugin(mongoosePaginate);

const Category = mongoose.model("Category", CategorySchema);


export default Category;