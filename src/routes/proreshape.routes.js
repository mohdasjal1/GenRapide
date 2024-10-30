import { Router } from "express";
import upload from "../middlewares/multer.js";
import { proReshape, rewriter } from "../controllers/proreshape.controller.js"

const router = Router();

router.route("/submit").post(upload.any(),proReshape)

router.route('/match')
.post(upload.fields(
    [
        { name: 'resumeFile' },
        { name: 'requirementsFile' }
    ]
), rewriter)



// router.route("/hit").get(hit)

export default router