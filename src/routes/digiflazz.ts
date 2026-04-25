import { NextFunction, Request, Response, Router } from "express";
import { RoleMiddleware } from "../middlerware/role-middleware";
import { authMiddleware } from "../middlerware/auth-middleware";
import { DigiflazzService } from "../services/digiflazz";

const Digiflazz = Router();

Digiflazz.get(
  "/cek-saldo",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await DigiflazzService.cekSaldo();

      return res.status(200).json({
        success: true,
        message: "Success get saldo",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

Digiflazz.get(
  "/pricelist",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await DigiflazzService.getPriceList();

      return res.status(200).json({
        success: true,
        message: "Success get pricelist",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);


Digiflazz.post(
  "/transaction",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ref_id, product_code, customer_no } = req.body;

      if (!ref_id || !product_code || !customer_no) {
        return res.status(400).json({
          success: false,
          message: "ref_id, product_code, customer_no is required",
        });
      }

      const result = await DigiflazzService.createTransaction({
        ref_id,
        product_code,
        customer_no,
      });

      return res.status(200).json({
        success: true,
        message: "Transaction created",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default Digiflazz;