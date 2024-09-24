import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";

const createBook = async (req: Request, res: Response, next: NextFunction) => {

    console.log('req.files:', req.files);
    const files = req.files as {[fieldname: string]: Express.Multer.File[]};
    const coverImageMimeType = files.coverImage[0].mimetype.split('/').pop();
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(__dirname, '../../public/data/uploads', fileName);

    const uploadResult = await cloudinary.uploader.upload(filePath,{
        filename_override: fileName,
        folder: "book_covers",
        format: coverImageMimeType,
    } );

    console.log('uploadResult', uploadResult);
    res.json({uploadResult});
}
   
export {createBook};