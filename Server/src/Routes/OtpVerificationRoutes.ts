import { Router } from 'express';
import express from 'express';
import { resendOtp, verifyInvestor } from '../Controllers/OtpVerificationControllers';

const OtpRouter = Router();

/**
 * @swagger
 * tags:
 *   name: OTP Verification
 *   description: Email verification using OTP codes
 */

/**
 * @swagger
 * /auth/otp/verifyOtp:
 *   post:
 *     summary: Verify OTP code
 *     tags: [OTP Verification]
 *     description: Verifies the OTP code sent to user's email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP code sent to user's email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                   example: OTP verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Email verified successfully
 *       400:
 *         description: Invalid OTP or validation error
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
 *                   example: Invalid or expired OTP
 *             examples:
 *               invalidOtp:
 *                 summary: Invalid OTP
 *                 value:
 *                   success: false
 *                   message: Invalid or expired OTP
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: Email and OTP are required
 *               expiredOtp:
 *                 summary: Expired OTP
 *                 value:
 *                   success: false
 *                   message: Invalid or expired OTP
 *               usedOtp:
 *                 summary: Already used OTP
 *                 value:
 *                   success: false
 *                   message: Invalid or expired OTP
 *       404:
 *         description: No OTP found for the email
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
 *                   example: No OTP found for this email
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
 *                   example: Internal server error
 */
OtpRouter.post('/verifyOtp', verifyInvestor as express.RequestHandler);
/**
 * @swagger
 * /auth/otp/resendOtp:
 *   post:
 *     summary: Resend OTP code
 *     tags: [OTP Verification]
 *     description: Resends a new OTP code to the user's email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
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
 *                   example: OTP resent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: OTP resent to email
 *       400:
 *         description: Invalid request or user state
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
 *                   example: Email is required
 *             examples:
 *               missingEmail:
 *                 summary: Missing email field
 *                 value:
 *                   success: false
 *                   message: Email is required
 *               alreadyVerified:
 *                 summary: Email already verified
 *                 value:
 *                   success: false
 *                   message: Email already verified
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   success: false
 *                   message: Invalid email format
 *       404:
 *         description: User not found
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
 *                   example: User not found
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
 *                   example: Failed to send email
 *             examples:
 *               emailFailure:
 *                 summary: Email sending failure
 *                 value:
 *                   success: false
 *                   message: Failed to send email
 *               dbError:
 *                 summary: Database error
 *                 value:
 *                   success: false
 *                   message: Internal server error
 */
OtpRouter.post('/resendOtp', resendOtp as express.RequestHandler);

export default OtpRouter;
