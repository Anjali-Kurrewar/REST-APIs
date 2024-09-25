import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middleware/authenticate";

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
        
        const _req = req as AuthRequest;

        const newBook = await bookModel.create({
            title,
            genre,
            author: _req.userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, genre } = req.body;
      const bookId = req.params.bookId;
      const book = await bookModel.findOne({ _id: bookId });
  
      if (!book) {
        return next(createHttpError(404, "Book not found"));
      }
  
      const _req = req as AuthRequest;
      if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "Unauthorized to update this book"));
      }
  
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let completeCoverImage = "";
  
      // Handle cover image upload
      if (files.coverImage) {
        const filename = files.coverImage[0].filename;
        const coverMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  
        const filePath = path.resolve(
          __dirname,
          "../../public/data/uploads/" + filename
        );
        completeCoverImage = filename;
  
        try {
          const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: completeCoverImage,
            folder: "book-covers",
            format: coverMimeType,
          });
  
          completeCoverImage = uploadResult.secure_url;
          await fs.promises.unlink(filePath); // Remove local file
        } catch (err) {
          return next(createHttpError(500, "Error uploading cover image"));
        }
      }
  
      // Handle book file upload
      let completeFileName = "";
      if (files.file) {
        const bookFilePath = path.resolve(
          __dirname,
          "../../public/data/uploads/" + files.file[0].filename
        );
        const bookFileName = files.file[0].filename;
        completeFileName = bookFileName;
  
        try {
          const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",
            filename_override: completeFileName,
            folder: "book-covers",
            format: "pdf",
          });
  
          completeFileName = uploadResultPdf.secure_url;
          await fs.promises.unlink(bookFilePath); // Remove local file
        } catch (err) {
          return next(createHttpError(500, "Error uploading book file"));
        }
      }
  
      const updatedBook = await bookModel.findOneAndUpdate(
        { _id: bookId },
        {
          title: title,
          genre: genre,
          coverImage: completeCoverImage || book.coverImage,
          file: completeFileName || book.file,
        },
        { new: true }
      );
  
      res.json(updatedBook);
    } catch (error) {
      next(error); // Pass any unexpected errors to the error-handling middleware
    }
  };
  
const listBook =  async (req: Request, res: Response, next: NextFunction) => {
    try {
        const book = await bookModel.find();
        res.json(book); 
    } catch (error) {
        return next(createHttpError(500,"Error whhile getting a book"))
    }
}

const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;

    try {
       const book = await bookModel.findOne({_id: bookId});
       if(!book){
        return next(createHttpError(404,"Book not found"));
       }
       return res.json(book);
    } catch (error) {
        return next(createHttpError(500,"Error while getting a book"));
    }
}

   
export {createBook,updateBook,listBook,getSingleBook};