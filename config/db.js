import mongoose from 'mongoose';

const connectDB = async() => {
try {
const conn = await mongoose.connect(process.env.MONGODB_URI)
console.log('connected to Mongodb Database ${conn.connection.host}');

} catch (error){

console.log('erro in Mongodb ${error')

}

}

export default connectDB;
