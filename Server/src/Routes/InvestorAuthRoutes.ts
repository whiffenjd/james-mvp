// src/routes/investor.routes.ts
import { Router } from "express";
import { signupInvestor } from "../Controllers/InvestorAuthControllers";
const investorAuthRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Investor Auth
 *   description: Investor authentication APIs
 */

/**
 * @swagger
 * /auth/investor/investorSignup:
 *   post:
 *     summary: Register a new investor
 *     tags: [Investor Auth]
 *     description: Creates a new investor account and sends OTP to the provided email for verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dazai Osamu"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nagumomiyabi59@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent to email
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: OTP sent to email
 *       400:
 *         description: Bad request - Missing required fields or invalid format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email is required"
 *       409:
 *         description: Conflict - Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email already exists"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
investorAuthRouter.post("/investorSignup", signupInvestor);

export default investorAuthRouter;
