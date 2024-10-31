// import multer from "multer";

// const storage = multer.diskStorage({
//     filename:function(req, file, callback){
//         callback(null, file.originalname)
//     }
// })

// const upload = multer({ dest: 'uploads/' })

// export default upload

import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/temp'); // Set the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Set the file name
    }
});

const upload = multer({ storage });

export default upload;
