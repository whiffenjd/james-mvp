/**
 * @swagger
 * /capital-calls/create:
 *   post:
 *     summary: Create a new capital call
 *     tags: [CapitalCall]
 *     description: Creates a new capital call for a fund (only fund managers can create)
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
 *                 example: "Capital call for Q3 2025"
 *     responses:
 *       201:
 *         description: Capital call created successfully
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
 *                   example: "Capital call created successfully"
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
 *                     createdBy:
 *                       type: string
 *                       format: uuid
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
 *                   example: "Only fund managers can create capital calls"
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
 *                   example: "Failed to create capital call"
 */

/**
 * @swagger
 * /capital-calls/list:
 *   get:
 *     summary: Retrieve all capital calls for user
 *     tags: [CapitalCall]
 *     description: Retrieves a paginated list of capital calls for the authenticated user
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
 *         description: Capital calls retrieved successfully
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
 *                   example: "Capital calls retrieved successfully"
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
 *                   example: "Failed to retrieve capital calls"
 */

/**
 * @swagger
 * /capital-calls/{id}/status:
 *   patch:
 *     summary: Update capital call status
 *     tags: [CapitalCall]
 *     description: Updates the status of a capital call (only investors can update)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Capital call ID
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
 *         description: Capital call status updated successfully
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
 *                   example: "Capital call status updated successfully"
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
 *                   example: "Only investors can update capital call status"
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
 *                   example: "Failed to update capital call status"
 */

/**
 * @swagger
 * /capital-calls/{id}:
 *   patch:
 *     summary: Update capital call
 *     tags: [CapitalCall]
 *     description: Updates a capital call's details (only fund managers can update)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Capital call ID
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
 *                 example: "Updated capital call for Q3 2025"
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Capital call updated successfully
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
 *                   example: "Capital call updated successfully"
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
 *                     createdBy:
 *                       type: string
 *                       format: uuid
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
 *                   example: "At least one field must be provided for update"
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
 *                   example: "Only fund managers can update capital calls"
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
 *                   example: "Failed to update capital call"
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
