import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";

const createBook = async (req: Request, res: Response, next: NextFunction) => {

    const {title, genre} = req.body;
    console.log('req.files:', req.files);
    const files = req.files as {[fieldname: string]: Express.Multer.File[]};
    const coverImageMimeType = files.coverImage[0].mimetype.split('/').pop();
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(__dirname, '../../public/data/uploads', fileName);

    try {
        const uploadResult = await cloudinary.uploader.upload(filePath,{
            filename_override: fileName,
            folder: "book_covers",
            format: coverImageMimeType,
        } );
    
        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(__dirname,"../../public/data/uploads",bookFileName);
    
        const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath,{
            resource_type: 'raw',
            filename_override: bookFileName,
            folder: 'book_pdfs',
            format: "pdf"
        })
    
        console.log("bookFileUploadResult: " ,bookFileUploadResult);
        console.log('uploadResult', uploadResult);

        const newBook = await bookModel.create({
            title,
            genre,
            author: "66f0daac7c50ce4198c52f94",
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url,
        })

        //Delete  temp files
        try {
            await fs.promises.unlink(filePath);
            await fs.promises.unlink(bookFilePath);
        } catch (error) {
            console.log(error);
        }

        res.status(201).json({id: newBook._id});
    } catch (error) {
        console.log(error);
        return next(createHttpError(500,"Error while uploading files"));
    }
}
   
export {createBook};