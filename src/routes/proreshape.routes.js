import { Router } from "express";
import { proReshape } from "../controllers/proreshape.controller.js"

const router = Router();

router.route("/submit").post(proReshape)


export default router