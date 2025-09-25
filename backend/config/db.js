import mongoose  from "mongoose";




const connectDB = async () => {
    try {
      const connectionInstant =  await mongoose.connect(`${process.env.MONGODB_URI}`);
      console.log(` \n MongoDB Connected !! ${connectionInstant.connection.host}`);

    } catch (error) {
        console.log('mongodb connection error : ',error);
        process.exit(1)
    }
}

export default connectDB;