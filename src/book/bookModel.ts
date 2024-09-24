import mongoose from "mongoose";
import {Book} from "./booksVariety";

const booksSchema = new  mongoose.Schema<Book>({
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
},
{timestamps: true}
);

export default mongoose.model<Book>("Book", booksSchema);