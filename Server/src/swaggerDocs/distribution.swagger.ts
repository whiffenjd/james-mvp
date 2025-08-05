/**
 * @swagger
 * /distribution/create:
 *   post:
 *     summary: Create a new distribution
 *     tags: [Distribution]
 *     description: Creates a new distribution for a fund (only fund managers can create)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fundId
 *               - investorId
 *               - amount
 *               - date
 *               - recipientName
 *               - bankName
 *               - accountNumber
 *               - description
 *             properties:
 *               fundId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               investorId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *               amount:
 *                 type: string
 *                 pattern: ^\d+(\.\d{1,2})?$
 *                 example: "1000.00"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-05T14:49:00Z"
 *               recipientName:
 *                 type: string
 *                 example: "John Doe"
 *               bankName:
 *                 type: string
 *                 example: "Example Bank"
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               description:
 *                 type: string
 *                 example: "Distribution for Q3 2025"
 *     responses:
 *       201:
 *         description: Distribution created successfully
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
 *                   example: "Distribution created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     fundId:
 *                       type: string
 *                       format: uuid
 *                     investorId:
 *                       type: string
 *                       format: uuid
 *                     amount:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     recipientName:
 *                       type: string
 *                     bankName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *                     createdBy:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
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
 *                   example: "Invalid fund ID"
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
 *                   example: "Only fund managers can create distributions"
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
 *                   example: "Failed to create distribution"
 */

/**
 * @swagger
 * /distribution/list:
 *   get:
 *     summary: Retrieve all distributions for user
 *     tags: [Distribution]
 *     description: Retrieves a paginated list of distributions for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 5
 *         description: Number of items per page
 *       - in: query
 *         name: fundId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by fund ID
 *     responses:
 *       200:
 *         description: Distributions retrieved successfully
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
 *                   example: "Distributions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
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
 *                           investorId:
 *                             type: string
 *                             format: uuid
 *                           amount:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           recipientName:
 *                             type: string
 *                           bankName:
 *                             type: string
 *                           accountNumber:
 *                             type: string
 *                           description:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [pending, approved, rejected]
 *                           createdBy:
 *                             type: string
 *                             format: uuid
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           InvestorName:
 *                             type: string
 *                           InvestorEmail:
 *                             type: string
 *                             format: email
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
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
 *                   example: "Failed to retrieve distributions"
 */

/**
 * @swagger
 * /distribution/status/{id}:
 *   patch:
 *     summary: Update distribution status
 *     tags: [Distribution]
 *     description: Updates the status of a distribution (only investors can update)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Distribution ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: "approved"
 *     responses:
 *       200:
 *         description: Distribution status updated successfully
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
 *                   example: "Distribution status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     fundId:
 *                       type: string
 *                       format: uuid
 *                     investorId:
 *                       type: string
 *                       format: uuid
 *                     amount:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     recipientName:
 *                       type: string
 *                     bankName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [approved, rejected]
 *                     createdBy:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
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
 *                   example: "Status must be either 'approved' or 'rejected'"
 *       403:
 *         description: Forbidden - Only investors can update status
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
 *                   example: "Only investors can update distribution status"
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
 *                   example: "Failed to update distribution status"
 */

/**
 * @swagger
 * /distribution/{id}:
 *   patch:
 *     summary: Update distribution
 *     tags: [Distribution]
 *     description: Updates a distribution's details (only fund managers can update)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Distribution ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fundId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               investorId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *               amount:
 *                 type: string
 *                 pattern: ^\d+(\.\d{1,2})?$
 *                 example: "1000.00"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-05T14:49:00Z"
 *               recipientName:
 *                 type: string
 *                 example: "John Doe"
 *               bankName:
 *                 type: string
 *                 example: "Example Bank"
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               description:
 *                 type: string
 *                 example: "Updated distribution for Q3 2025"
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Distribution updated successfully
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
 *                   example: "Distribution updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     fundId:
 *                       type: string
 *                       format: uuid
 *                     investorId:
 *                       type: string
 *                       format: uuid
 *                     amount:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     recipientName:
 *                       type: string
 *                     bankName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *                     createdBy:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
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
 *                   example: "Invalid fund ID"
 *       403:
 *         description: Forbidden - Only fund managers can update
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
 *                   example: "Only fund managers can update distributions"
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
 *                   example: "Failed to update distribution"
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
