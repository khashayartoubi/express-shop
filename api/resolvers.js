import User from "../app/models/users.js"
import validator from 'validator';
import bcrypt from 'bcrypt';
import config from "../app/config/index.js";
import Multimedia from './../app/models/multimedia.js';
import { mkdirp } from 'mkdirp'
import path, { resolve } from 'path';
import fs from 'fs';
import Category from "../app/models/category.js";
import Brand from "../app/models/brand.js";
// import mongoosePaginate from 'mongoose-paginate-v2';
// import paginate from 'mongoose-paginate-v2';

export const resolvers = {
    Mutation: {
        register: async (param, args) => {
            try {
                const valid = {
                    phone: validator.isEmpty(args.phone),
                    password: validator.isEmpty(args.password)
                }
                if (valid.phone) return { status: 404, message: 'Invalid phone' }
                if (valid.password) return { status: 404, message: 'Invalid password' }
                const phoneUser = await User.findOne({ phone: args.phone })
                if (phoneUser) return { status: 401, message: 'Invalid phone' }
                const salt = bcrypt.genSaltSync(10)
                const hash = bcrypt.hashSync(args.password, salt)

                const user = await User.create({
                    phone: args.phone,
                    password: hash
                })
                user.save();

                return {
                    status: 200,
                    message: "user added successfully",
                }
            } catch (error) {
                throw new Error(error.message);
            }

        },
        multimedia: async (param, args, { token, isAdmin }) => {
            console.log(token)
            console.log(isAdmin)
            console.log(args)
            try {
                if (token && isAdmin) {

                    const { createReadStream, filename } = await args.image;
                    const stream = createReadStream();
                    const { filePath } = await saveImage({ stream, filename });

                    console.log("filePath =>>", filePath)
                    try {
                        await Multimedia.create({
                            name: filename,
                            dir: filePath
                        });
                    } catch (error) {
                        throw new Error(error)
                    }
                    return {
                        status: 200,
                        message: "user added successfully",

                    }
                } else {
                    throw new Error('You dont permission')
                }
            } catch (error) {
                return new Error(error.message)
            }
        },
        category: async (param, args, { token, isAdmin }) => {
            try {
                if (token, isAdmin) {
                    if (validator.isEmpty(args.input.name)) throw new Error('name can not be empty')
                    // if (validator.isEmpty(args.input.image)) throw new Error('image can not be empty')

                    const nameCategory = await Category.findOne({ name: args.input.name })
                    if (nameCategory) throw new Error('exist same name in categories list')
                    await Category.create({
                        name: args.input.name,
                        label: args.input.label,
                        parent: args.input.parent,
                        // image: args.input.image
                    })

                    return {
                        status: 200,
                        message: "category added successfully"
                    }

                } else {
                    return {
                        status: 403,
                        message: "not permission"
                    }
                }
            } catch (error) {
                throw new Error(error)
            }
        },
        brand: async (param, args, { token, isAdmin }) => {
            if (token, isAdmin) {
                try {
                    // const page = args.input.page || 1;
                    // const limit = args.input.limit || 10
                    // const brand = await Brand.paginate({}, { page, limit, populate: {  } })
                    // return brand.docs;

                    console.log(args.input)
                    await Brand.create({
                        name: args.input.name,
                        lable: args.input.lable,
                        category: args.input.category,
                        // image: args.input.image,
                    })
                    return {
                        status: 200,
                        message: "brand add successfully"
                    }

                } catch (error) {
                    throw new Error(error)
                }
            } else {
                throw new Error('you cant add brand')
            }
        }
    },
    Query: {
        users: async () => {
            const usr = await User.find()
            return usr
        },
        login: async (param, args) => {
            try {
                const user = await User.findOne({ phone: args.phone });
                if (!user) return { status: 404, message: 'user not registered' };
                const isValid = bcrypt.compareSync(args.password, user.password);
                if (!isValid) return { status: 404, message: 'user is not valid' };
                const token = await User.CreateToken(user._id, config.secret.jwt, "10h")

                return {
                    status: 200,
                    message: "user loged in successfully",
                    token
                }
            } catch (error) {
                console.log('ssswwww')
                throw new Error(error.message)
            }
        },
        async getAllCategory(param, args) {
            console.log(args.input)
            if (args.input.mainCategory == true) {
                const page = args.input.page || 1;
                const limit = args.input.limit || 10
                const category = await Category.paginate({ parent: null }, { page, limit })
                return category.docs;

            } else if (args.input.mainCategory == false && args.input.parentCategory == true) {
                const page = args.input.page || 1;
                const limit = args.input.limit || 10
                const category = await Category.paginate({ parent: args.input.catId }, { page, limit, populate: { path: "parent", populate: { path: "parent" } } })
                return category.docs;
            } else if (args.input.mainCategory == false && args.input.parentCategory == false) {
                const page = args.input.page || 1;
                const limit = args.input.limit || 10
                const category = await Category.paginate({}, { page, limit, populate: { path: "parent", populate: { path: "parent" } } })
                return category.docs;

            }
            const page = args.input.page || 1;
            const limit = args.input.limit || 10
            const category = await Category.paginate({}, { page, limit })
            return category.docs;
        },
        async getAllBrands(param, args, { token, isAdmin }) {
            if (token, isAdmin) {
                try {
                    if (args.input.category) {
                        const page = args.input.page || 1;
                        const limit = args.input.limit || 10
                        const brand = await Brand.paginate({ category: args.input.category }, { page, limit, populate: { path: "category" } })
                        return brand.docs;
                    }
                    const page = args.input.page || 1;
                    const limit = args.input.limit || 10
                    const brand = await Brand.paginate({}, { page, limit, populate: { path: "category" } })
                    return brand.docs;



                } catch (error) {
                    throw new Error(error)
                }
            } else {
                throw new Error('you cant get brand')
            }
        }
    }
}

let saveImage = ({ stream, filename }) => {
    const date = new Date();
    let dir = `uploads/${date.getFullYear()}/${date.getMounth() + 1}`;
    mkdirp.sync(path.join(__dirname, `/public/${dir}`));

    let filePath = `${dir}/${filename}`;
    if (fs.existsSync(path.join(__dirname, `/public/${filePath}`))) {
        filePath = `${dir}/${Date.now()}-${filePath}`
    }

    return new Promise((resolve, reject) => {
        stream
            .pipe(fs.createWriteStream(path.join(__dirname, `/public/${filePath}`)))
            .on('error', error => reject(error))
            .on('finish', resolve => resolve({ filePath }))
    })
}