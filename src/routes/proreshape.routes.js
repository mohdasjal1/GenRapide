import { Router } from "express";
import upload from "../middlewares/multer.js";
import { handlePdf, handleText, downloadFinalMessage, handleDownload } from "../controllers/proreshape.controller.js"

const router = Router();

// router.route("/submit").post(upload.any(),proReshape)
// router.route('/match')
// .post(upload.fields(
//     [
//         { name: 'resumeFile' },
//         { name: 'requirementsFile' }
//     ]
// ), rewriter)

router.route("/upload").post(upload.fields([
    { name: 'resumeFile' },
    { name: 'requirementsFile' }
]), (req, res, next) => {
    if (req.files.resumeFile && req.files.requirementsFile) {
        // Call the rewriter function if both files are present
        return handlePdf(req, res, next);
    } else {
        // Call proReshape if only general files are uploaded
        return handleText(req, res, next);
    }
});


// router.get("/download", downloadFinalMessage);
router.get("/download", handleDownload);

// router.route("/download-document").get(generateAndDownloadDocument)
// router.get("/download-document", generateAndDownloadDocument);


export default router