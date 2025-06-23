import { Router } from 'express';
import FundController from '../Controllers/FundControllers';
import uploadMultipleDocs from '../Middlewares/FundDocsUpload';
import { verifyToken } from '../Middlewares/VerifyToken';
import express from 'express';
const FundRouter = Router();

FundRouter.post('/createFund', verifyToken, uploadMultipleDocs, FundController.createFund);
FundRouter.get('/getAllFunds', verifyToken, FundController.getAllFunds);
FundRouter.get('/getAllFundsSpecificData', verifyToken, FundController.getAllFundsSpecificData);
FundRouter.get('/getFundById/:id', verifyToken, FundController.getFundById);
FundRouter.get('/manager/:managerId', verifyToken, FundController.getManagerFunds);
FundRouter.patch('/updateFund/:id', verifyToken, uploadMultipleDocs, FundController.updateFund);
FundRouter.delete('/deleteFund/:id', verifyToken, FundController.deleteFund);
FundRouter.get(
  '/investors',
  verifyToken,
  FundController.getInvestorsByManager as unknown as express.RequestHandler,
);
/**
 * @swagger
 * tags:
 *   - name: Fund
 *     description: Endpoints for managing funds
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     FundInvestor:
 *       type: object
 *       properties:
 *         investorId:
 *           type: string
 *           example: b5eba7de-475d-4bd1-9e1b-392e9f31627e
 *         name:
 *           type: string
 *           example: Zohaib Haider
 *         amount:
 *           type: number
 *           example: 423
 *         documentUrl:
 *           type: string
 *           example: https://s3.amazonaws.com/bucket/funds/investorDoc.pdf
 *         addedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-06-23T11:38:33.814Z
 *     FundDocument:
 *       type: object
 *       properties:
 *         fileUrl:
 *           type: string
 *           example: https://s3.amazonaws.com/bucket/funds/fundDoc.pdf
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-06-23T11:38:33.814Z
 *     Fund:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         fundSize:
 *           type: string
 *         fundType:
 *           type: string
 *         targetGeographies:
 *           type: string
 *         targetSectors:
 *           type: string
 *         targetMOIC:
 *           type: string
 *         targetIRR:
 *           type: string
 *         minimumInvestment:
 *           type: string
 *         fundLifetime:
 *           type: string
 *         fundDescription:
 *           type: string
 *         investors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FundInvestor'
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FundDocument'
 *     FundResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Fund created successfully
 *         statusCode:
 *           type: integer
 *           example: 201
 */

/**
 * @swagger
 * /fund/createFund:
 *   post:
 *     summary: Create a new fund with documents and investors
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: |
 *                   JSON stringified fund and investor details.
 *
 *                   🟢 Example:
 *
 *                   ```json
 *                   {
 *                     "name": "Sint consequatur no",
 *                     "fundSize": "Aliquid libero assum",
 *                     "fundType": "Ducimus sunt ipsa",
 *                     "targetGeographies": "Sed aut in perferend",
 *                     "targetSectors": "Quaerat eius est ill",
 *                     "targetMOIC": "Tenetur et labore to",
 *                     "targetIRR": "Natus voluptatem mol",
 *                     "minimumInvestment": "Deserunt et quasi ve",
 *                     "fundLifetime": "Nemo ea quidem eos e",
 *                     "fundDescription": "Dolor dolores error ",
 *                     "investors": [
 *                       {
 *                         "investorId": "b5eba7de-475d-4bd1-9e1b-392e9f31627e",
 *                         "name": "Zohaib Haider",
 *                         "amount": 423,
 *                         "documentUrl": "",
 *                         "addedAt": "2025-06-23T11:38:33.814Z"
 *                       },
 *                       {
 *                         "investorId": "ac7b632c-01db-4118-be1e-d020f8a59c69",
 *                         "name": "Miyabi Nagumo",
 *                         "amount": 43,
 *                         "documentUrl": "",
 *                         "addedAt": "2025-06-23T11:38:47.540Z"
 *                       }
 *                     ]
 *                   }
 *                   ```
 *               fundDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Fund documents (one or more files)
 *               investorDocument_0:
 *                 type: string
 *                 format: binary
 *                 description: Document for investor at index 0
 *               investorDocument_1:
 *                 type: string
 *                 format: binary
 *                 description: Document for investor at index 1
 *               investorDocument_2:
 *                 type: string
 *                 format: binary
 *                 description: Document for investor at index 2
 *     responses:
 *       201:
 *         description: Fund created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FundResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /fund/getAllFunds:
 *   get:
 *     summary: Get all funds
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all funds
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fund'
 */

/**
 * @swagger
 * /fund/getAllFundsSpecificData:
 *   get:
 *     summary: Get all funds with specific data
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of funds with specific data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fund'
 */

/**
 * @swagger
 * /fund/getFundById/{id}:
 *   get:
 *     summary: Get fund by ID
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fund ID
 *     responses:
 *       200:
 *         description: Fund details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fund'
 *       404:
 *         description: Fund not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /fund/manager/{managerId}:
 *   get:
 *     summary: Get all funds for a manager
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manager ID
 *     responses:
 *       200:
 *         description: List of funds for the manager
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fund'
 */

/**
 * @swagger
 * /fund/updateFund/{id}:
 *   patch:
 *     summary: Update an existing fund with new or existing documents and investors
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the fund to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: |
 *                   JSON stringified fund and investor update details.
 *
 *                   🔄 Example:
 *
 *                   ```json
 *                   {
 *                     "name": "Updated Fund Name",
 *                     "fundSize": "1234567",
 *                     "fundType": "Private Equity",
 *                     "targetGeographies": "North America, Europe",
 *                     "targetSectors": "Healthcare, Tech",
 *                     "targetMOIC": "2.0x",
 *                     "targetIRR": "18%",
 *                     "minimumInvestment": "50000",
 *                     "fundLifetime": "7 years",
 *                     "fundDescription": "Updated fund description",
 *                     "existingDocuments": [
 *                       "https://s3.aws.com/bucket/fundDoc1.pdf"
 *                     ],
 *                     "investors": [
 *                       {
 *                         "investorId": "b5eba7de-475d-4bd1-9e1b-392e9f31627e",
 *                         "name": "Zohaib Haider",
 *                         "amount": 1000,
 *                         "documentUrl": "https://s3.aws.com/investorDocs/inv1.pdf",
 *                         "addedAt": "2025-06-23T11:38:33.814Z"
 *                       },
 *                       {
 *                         "investorId": "ac7b632c-01db-4118-be1e-d020f8a59c69",
 *                         "name": "Miyabi Nagumo",
 *                         "amount": 500,
 *                         "documentUrl": "",
 *                         "addedAt": "2025-06-23T11:38:47.540Z"
 *                       }
 *                     ]
 *                   }
 *                   ```
 *               fundDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New fund document files (optional)
 *               investorDocument_0:
 *                 type: string
 *                 format: binary
 *                 description: New document for investor at index 0 (optional)
 *               investorDocument_1:
 *                 type: string
 *                 format: binary
 *                 description: New document for investor at index 1 (optional)
 *               investorDocument_2:
 *                 type: string
 *                 format: binary
 *                 description: New document for investor at index 2 (optional)
 *     responses:
 *       201:
 *         description: Fund updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FundResponse'
 *       404:
 *         description: Fund not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /fund/deleteFund/{id}:
 *   delete:
 *     summary: Delete a fund by ID
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fund ID
 *     responses:
 *       200:
 *         description: Fund deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fund deleted successfully
 *       404:
 *         description: Fund not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /fund/investors:
 *   get:
 *     summary: Get all investors for the manager
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of investors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FundInvestor'
 */
export default FundRouter;
