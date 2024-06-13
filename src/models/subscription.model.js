import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({

    subscriber: {
        type: Schema.Types.ObjectId,  //one who is subscibing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,   //onw to whom 'subscriber' is subscribing
        ref: "User"
    }
},{timestamps: true})

const subscription = mongoose.model("subscription", subscriptionSchema)