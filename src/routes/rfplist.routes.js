import { Router } from "express";
import { getUserFiles,
         listBlobs,
         downloadBlob,         
         downloadDataAsDcox
        } from "../controllers/rfplist.controller.js";


const router = Router();


router.get("/files/:userId", getUserFiles);                  //  List all the PDFs uploaded through RFP Decoder
router.get("/download-blob/:blobName", downloadBlob)         //  Download the PDF uploaded through RFP Decoder
router.get("/download-pdf/:blobName", downloadDataAsDcox)    //  Generate and download Word document

// router.get("/list-blobs", listBlobs)




export default router