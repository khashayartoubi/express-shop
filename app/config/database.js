
const { MONGODB_URL } = process.env

export default {
    url: MONGODB_URL,
    options: { useNewUrlParser: true, useUnifiedTopology: true }
}