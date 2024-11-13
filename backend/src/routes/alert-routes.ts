import { Router } from "express";
import {
  getAlerts,
  getAlertById,
  createAlert,
  deleteAlert,
  updateAlert,
} from "../controllers/alert-controllers";

const router = Router();

router.get("/alerts", getAlerts);
router.get("/alerts/:id", getAlertById);
router.post("/alerts", createAlert);
router.put("/alerts/:id", updateAlert);
router.delete("/alerts/:id", deleteAlert);

export default router;
