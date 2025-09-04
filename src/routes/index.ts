import express from 'express';

import {
  validateCreateKidsGiftBox,
  validateUpdateKidsGiftBox,
  validateKidsGiftBoxId,
} from '../middleware';
import { createKidsGiftBox, getAllKidsGiftBoxes, getKidsGiftBoxById } from '../controllers';

const router = express.Router();

/**
 * @swagger
 * /api/v1/kids-gift-boxes:
 *   get:
 *     summary: Get all kids gift boxes
 *     tags: [Kids Gift Boxes]
 *     responses:
 *       200:
 *         description: List of all kids gift boxes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KidsGiftBox'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllKidsGiftBoxes);

/**
 * @swagger
 * /api/v1/kids-gift-boxes/{id}:
 *   get:
 *     summary: Get a kids gift box by ID
 *     tags: [Kids Gift Boxes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The gift box ID
 *     responses:
 *       200:
 *         description: Gift box found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KidsGiftBox'
 *       404:
 *         description: Gift box not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validateKidsGiftBoxId, getKidsGiftBoxById);

/**
 * @swagger
 * /api/v1/kids-gift-boxes:
 *   post:
 *     summary: Create a new kids gift box
 *     tags: [Kids Gift Boxes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - box_contains
 *               - reviews_avg
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 example: "Squishmallow Fun"
 *               price:
 *                 type: string
 *                 pattern: '^\$\d+\.\d{2}$'
 *                 example: "$39.95"
 *               box_contains:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: "This Epic Kids Squishmallow gift box contains:\n1x 12\" Squishmallow plushie\n1x Kit Kat Mini\n2x Mini Mentos Fruit lolly rolls"
 *               reviews_avg:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: "Perfect gift box for kids who love soft, cuddly companions! This amazing Squishmallow gift box brings joy and sweetness together."
 *     responses:
 *       201:
 *         description: Gift box created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KidsGiftBox'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateCreateKidsGiftBox, createKidsGiftBox);

/**
 * @swagger
 * /api/v1/kids-gift-boxes/{id}:
 *   put:
 *     summary: Update a kids gift box
 *     tags: [Kids Gift Boxes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The gift box ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 example: "Squishmallow Fun"
 *               price:
 *                 type: string
 *                 pattern: '^\$\d+\.\d{2}$'
 *                 example: "$39.95"
 *               box_contains:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: "This Epic Kids Squishmallow gift box contains:\n1x 12\" Squishmallow plushie\n1x Kit Kat Mini\n2x Mini Mentos Fruit lolly rolls"
 *               reviews_avg:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: "Perfect gift box for kids who love soft, cuddly companions!"
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Gift box updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KidsGiftBox'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Gift box not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', validateKidsGiftBoxId, validateUpdateKidsGiftBox, createKidsGiftBox);

/**
 * @swagger
 * /api/v1/kids-gift-boxes/{id}:
 *   delete:
 *     summary: Delete a kids gift box
 *     tags: [Kids Gift Boxes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The gift box ID
 *     responses:
 *       204:
 *         description: Gift box deleted successfully
 *       404:
 *         description: Gift box not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', validateKidsGiftBoxId, createKidsGiftBox);

export default router;