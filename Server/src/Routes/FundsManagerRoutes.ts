import { Router } from 'express';
import FundController from '../Controllers/FundControllers';
import uploadMultipleDocs from '../Middlewares/FundDocsUpload';
import { verifyToken } from '../Middlewares/VerifyToken';
import express from 'express';
const FundRouter = Router();

FundRouter.post(
  '/createFund',
  verifyToken,
  uploadMultipleDocs,
  FundController.createFund as unknown as express.RequestHandler,
);
FundRouter.get('/getAllFunds', verifyToken, FundController.getAllFunds);
FundRouter.get(
  '/getAllFundsSpecificData',
  verifyToken,
  FundController.getAllFundsSpecificData as unknown as express.RequestHandler,
);
FundRouter.get('/getFundById/:id', verifyToken, FundController.getFundById);
FundRouter.get(
  '/manager/:managerId',
  verifyToken,
  FundController.getManagerFunds as unknown as express.RequestHandler,
);
FundRouter.get(
  '/getAllInvestorFunds',
  verifyToken,
  FundController.getInvestorAllFunds as unknown as express.RequestHandler,
);
FundRouter.patch(
  '/updateFund/:id',
  verifyToken,
  uploadMultipleDocs,
  FundController.updateFund as unknown as express.RequestHandler,
);
FundRouter.delete(
  '/deleteFund/:id',
  verifyToken,
  FundController.deleteFund as unknown as express.RequestHandler,
);
FundRouter.get(
  '/investors',
  verifyToken,
  FundController.getInvestorsByManager as unknown as express.RequestHandler,
);
FundRouter.patch(
  '/:fundId/InvDoc/:investorId/sign',
  verifyToken,
  uploadMultipleDocs,
  FundController.signInvestorFunds as unknown as express.RequestHandler,
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
 *     FundManagerInvestor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 1a2b3c4d-5e6f-7g8h-9i0j-abc123xyz456
 *         email:
 *           type: string
 *           format: email
 *           example: investor@example.com
 *         name:
 *           type: string
 *           example: Miyabi Nagumo
 *         role:
 *           type: string
 *           example: investor
 *         isEmailVerified:
 *           type: boolean
 *           example: true
 *     FundSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 1a2b3c4d-5e6f-7g8h-9i0j-abc123xyz456
 *         name:
 *           type: string
 *           example: Growth Equity Fund
 *         fundType:
 *           type: string
 *           example: Private Equity
 *         fundSize:
 *           type: number
 *           example: 432
 *         fundDescription:
 *           type: string
 *           example: A fund focused on late-stage growth companies.
 *         investorCount:
 *           type: integer
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-06-23T11:38:33.814Z
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
 *         status:
 *           type: boolean
 *           example: false
 *         documentUrl:
 *           type: string
 *           example: https://s3.amazonaws.com/bucket/funds/investorDoc.pdf
 *         documentName:
 *           type: string
 *           example: investorDoc.pdf
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
 *         fileName:
 *           type: string
 *           example: fundDoc.pdf
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
 *           type: number
 *         fundType:
 *           type: string
 *         targetGeographies:
 *           type: string
 *         targetSectors:
 *           type: string
 *         targetMOIC:
 *           type: number
 *         targetIRR:
 *           type: number
 *         minimumInvestment:
 *           type: number
 *         fundManagerId:
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
 *                     "fundSize": 43,
 *                     "fundType": "Ducimus sunt ipsa",
 *                     "targetGeographies": "Sed aut in perferend",
 *                     "targetSectors": "Quaerat eius est ill",
 *                     "targetMOIC": 234234,
 *                     "targetIRR": 2342343,
 *                     "minimumInvestment": 5000,
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
 *       '201':
 *         description: Fund created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FundResponse'
 *       '400':
 *         description: Bad Request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_data:
 *                 summary: Missing fund data
 *                 value:
 *                   success: false
 *                   error: "Missing fund data in request body."
 *                   statusCode: 400
 *               invalid_json:
 *                 summary: Invalid JSON format
 *                 value:
 *                   success: false
 *                   error: "Invalid JSON format in request body."
 *                   statusCode: 400
 *               invalid_investors:
 *                 summary: Invalid investors array
 *                 value:
 *                   success: false
 *                   error: "Investors must be provided as an array."
 *                   statusCode: 400
 *               missing_investor_id:
 *                 summary: Missing investor ID
 *                 value:
 *                   success: false
 *                   error: "Investor at index 0 is missing 'investorId'"
 *                   statusCode: 400
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               general_error:
 *                 summary: General server error
 *                 value:
 *                   success: false
 *                   error: "An unknown error occurred during fund creation."
 *                   statusCode: 500
 *               specific_error:
 *                 summary: Specific error message
 *                 value:
 *                   success: false
 *                   error: "Failed to create fund: Database connection failed"
 *                   statusCode: 500
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
 *     summary: Get all funds with specific summary data
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fund summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FundSummary'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
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
 *                   example: Fund not found
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
 *                     "targetMOIC": 2456,
 *                     "fundManagerId": 184542342424234,
 *                     "targetIRR": 1845,
 *                     "minimumInvestment": 50000,
 *                     "fundLifetime": "7 years",
 *                     "fundDescription": "Updated fund description",
 *                     "existingDocuments": [{
 *                       "https://s3.aws.com/bucket/fundDoc1.pdf"
 *                      },
 *                      {
 *                       "https://s3.aws.com/bucket/fundDoc1.pdf"
 *                        }
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
 *       '200':
 *         description: Fund updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Fund updated successfully"
 *               statusCode: 200
 *       '400':
 *         description: Bad Request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fund_id:
 *                 summary: Missing fund ID
 *                 value:
 *                   success: false
 *                   error: "Missing fund ID in URL path."
 *                   statusCode: 400
 *               invalid_json:
 *                 summary: Invalid JSON format
 *                 value:
 *                   success: false
 *                   error: "Invalid JSON format in request body."
 *                   statusCode: 400
 *               missing_investor_id:
 *                 summary: Missing investor ID
 *                 value:
 *                   success: false
 *                   error: "Investor at index 1 is missing 'investorId'"
 *                   statusCode: 400
 *       '404':
 *         description: Fund not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Fund not found."
 *               statusCode: 404
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               general_error:
 *                 summary: General server error
 *                 value:
 *                   success: false
 *                   error: "An unknown error occurred during fund update."
 *                   statusCode: 500
 *               specific_error:
 *                 summary: Specific error message
 *                 value:
 *                   success: false
 *                   error: "Failed to update fund: Database connection failed"
 *                   statusCode: 500
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
 *                   example: Fund not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
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
 *         description: List of investors referred by the fund manager
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FundManagerInvestor'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
/**
 * @swagger
 * /fund/getAllInvestorFunds:
 *   get:
 *     summary: Get all funds for a specific investor
 *     tags: [Fund]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves all funds where the authenticated investor is a participant
 *     responses:
 *       '200':
 *         description: Successfully fetched funds for investor
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
 *                   example: "Fetched funds for investor"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: Unique identifier for the fund
 *                         example: "7501fab3-00db-4ba4-a3e7-420e2e53a016"
 *                       name:
 *                         type: string
 *                         description: Name of the fund
 *                         example: "ahsan"
 *                       fundSize:
 *                         type: string
 *                         description: Size of the fund
 *                         example: "2500"
 *                       fundType:
 *                         type: string
 *                         description: Type of the fund
 *                         example: "Dev"
 *                       fundDescription:
 *                         type: string
 *                         description: Description of the fund
 *                         example: "des"
 *                       investors:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Zohaib Haider"
 *                             amount:
 *                               type: string
 *                               example: "2000"
 *                             status:
 *                               type: boolean
 *                               example: true
 *                             addedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-06-25T13:25:46.744Z"
 *                             investorId:
 *                               type: string
 *                               format: uuid
 *                               example: "b5eba7de-475d-4bd1-9e1b-392e9f31627e"
 *                             documentUrl:
 *                               type: string
 *                               example: "https://s3.amazonaws.com/bucket/file.pdf"
 *                             documentName:
 *                               type: string
 *                               example: "file.pdf"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fund creation timestamp
 *                         example: "2025-06-25T13:25:24.767Z"
 *             example:
 *               success: true
 *               message: "Fetched funds for investor"
 *               statusCode: 200
 *               data:
 *                 - id: "7501fab3-00db-4ba4-a3e7-420e2e53a016"
 *                   name: "ahsan"
 *                   fundSize: "2500"
 *                   fundType: "Dev"
 *                   fundDescription: "des"
 *                   investors:
 *                     - name: "Zohaib Haider"
 *                       amount: "2000"
 *                       addedAt: "2025-06-25T13:25:46.744Z"
 *                       investorId: "b5eba7de-475d-4bd1-9e1b-392e9f31627e"
 *                       documentUrl: "https://s3.amazonaws.com/bucket/file.pdf"
 *                       documentName: "file.pdf"
 *                   createdAt: "2025-06-25T13:25:24.767Z"
 *                 - id: "cf7752c8-44cc-4b78-9b29-f64744ab9745"
 *                   name: "zebi"
 *                   fundSize: "234"
 *                   fundType: "sad"
 *                   fundDescription: "dsa"
 *                   investors:
 *                     - name: "Zohaib Haider"
 *                       amount: "2423"
 *                       status: true
 *                       addedAt: "2025-06-26T09:21:30.686Z"
 *                       investorId: "b5eba7de-475d-4bd1-9e1b-392e9f31627e"
 *                       documentUrl: "https://s3.amazonaws.com/bucket/file.pdf"
 *                       documentName: "file.pdf"
 *                   createdAt: "2025-06-26T09:21:30.228Z"
 *       '400':
 *         description: Bad Request - Missing investor ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Missing investorId in query"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *             example:
 *               success: false
 *               error: "Missing investorId in query"
 *               statusCode: 400
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Authentication required"
 *               statusCode: 401
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch investor funds"
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *             example:
 *               success: false
 *               error: "Failed to fetch investor funds"
 *               statusCode: 500
 */
/**
 * @swagger
 * /fund/{fundId}/InvDoc/{investorId}/sign:
 *   patch:
 *     summary: Upload signed investor document for a specific fund
 *     description: Fund managers or admins can upload a signed document and update investor status.
 *     tags:
 *       - Fund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fundId
 *         in: path
 *         required: true
 *         description: ID of the fund
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "1a2b3c4d-5e6f-7g8h-9i0j-abc123xyz456"
 *       - name: investorId
 *         in: path
 *         required: true
 *         description: ID of the investor in the fund
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "b5eba7de-475d-4bd1-9e1b-392e9f31627e"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - investor_doc
 *               - status
 *             properties:
 *               investor_doc:
 *                 type: string
 *                 format: binary
 *                 description: Signed investor document file (PDF, DOC, DOCX)
 *               status:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Approval status for the investor document
 *                 example: "true"
 *     responses:
 *       200:
 *         description: Investor document uploaded and updated successfully
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
 *                   example: "Investor document signed and updated successfully"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     investor:
 *                       $ref: '#/components/schemas/FundInvestor'
 *             example:
 *               success: true
 *               message: "Investor document signed and updated successfully"
 *               statusCode: 200
 *               data:
 *                 investor:
 *                   name: "Zohaib Haider"
 *                   amount: "2423"
 *                   addedAt: "2025-06-26T09:21:30.686Z"
 *                   investorId: "b5eba7de-475d-4bd1-9e1b-392e9f31627e"
 *                   documentUrl: "https://jameswhitelabel.s3.eu-north-1.amazonaws.com/funds/1750929972163-file-sample_150kB.pdf"
 *                   documentName: "file-sample_150kB.pdf"
 *                   status: true
 *       400:
 *         description: Missing file or invalid input
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
 *                   example: "Missing required file or invalid status"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized access"
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       403:
 *         description: Forbidden - User is not fund manager or admin
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
 *                   example: "Access denied. Fund manager or admin role required"
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *       404:
 *         description: Fund or investor not found
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
 *                   example: "Fund or investor not found"
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Internal server error
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
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */
export default FundRouter;
