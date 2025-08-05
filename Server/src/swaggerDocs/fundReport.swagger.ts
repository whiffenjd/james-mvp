/**
 * @swagger
 * /fund-report/create:
 *   post:
 *     summary: Create a new fund report
 *     tags: [FundReport]
 *     description: Creates a new fund report with an uploaded document (only fund managers can create)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fundId
 *               - projectName
 *               - description
 *               - year
 *               - quarter
 *               - document
 *             properties:
 *               fundId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               projectName:
 *                 type: string
 *                 example: "Annual Performance Report"
 *               description:
 *                 type: string
 *                 example: "Fund performance report for Q3 2025"
 *               year:
 *                 type: string
 *                 pattern: ^\d{4}$
 *                 example: "2025"
 *               quarter:
 *                 type: string
 *                 pattern: ^(Q[1-4])$
 *                 example: "Q3"
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: The document file to be uploaded
 *     responses:
 *       201:
 *         description: Fund report created successfully
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
 *                   example: "Fund report created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     fundId:
 *                       type: string
 *                       format: uuid
 *                     projectName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     documentUrl:
 *                       type: string
 *                       format: uri
 *                     year:
 *                       type: string
 *                     quarter:
 *                       type: string
 *                     createdBy:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or missing document
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
 *                   example: "Document file is required"
 *       403:
 *         description: Forbidden - Only fund managers can create
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
 *                   example: "Only fund managers can create fund reports"
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
 *                   example: "Failed to create fund report"
 */

/**
 * @swagger
 * /fund-report/by-fund/{fundId}:
 *   get:
 *     summary: Retrieve fund reports by fund ID
 *     tags: [FundReport]
 *     description: Retrieves a paginated list of fund reports for a specific fund
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Fund ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *           pattern: ^\d{4}$
 *         description: Filter by year (e.g., 2025)
 *       - in: query
 *         name: quarter
 *         schema:
 *           type: string
 *           pattern: ^(Q[1-4])$
 *         description: Filter by quarter (e.g., Q1, Q2, Q3, Q4)
 *     responses:
 *       200:
 *         description: Fund reports retrieved successfully
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
 *                   example: "Fund reports retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           fundId:
 *                             type: string
 *                             format: uuid
 *                           projectName:
 *                             type: string
 *                           description:
 *                             type: string
 *                           documentUrl:
 *                             type: string
 *                             format: uri
 *                           year:
 *                             type: string
 *                           quarter:
 *                             type: string
 *                           createdBy:
 *                             type: string
 *                             format: uuid
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           createdByName:
 *                             type: string
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
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
 *                   example: "Failed to retrieve fund reports"
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
