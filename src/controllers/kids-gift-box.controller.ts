import { Request, Response } from 'express';
import { KidsGiftBoxService } from '../services';


const giftBoxService = new KidsGiftBoxService();

export const getAllKidsGiftBoxes = async (req: Request, res: Response): Promise<void> => {
  try {
    const giftBoxes = await giftBoxService.getAllKidsGiftBoxes();
    res.json(giftBoxes);
  } catch (error) {
    console.error('Error getting all gift boxes:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve gift boxes',
    });
  }
};

export const getKidsGiftBoxById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const giftBox = await giftBoxService.getKidsGiftBoxById(id);

    if (!giftBox) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Gift box not found',
      });
      return;
    }

    res.json(giftBox);
  } catch (error) {
    console.error('Error getting gift box by ID:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve gift box',
    });
  }
};

export const createKidsGiftBox = async (req: Request, res: Response): Promise<void> => {
  try {
    const giftBoxData = req.body;
    const giftBox = await giftBoxService.createKidsGiftBox(giftBoxData);
    res.status(201).json(giftBox);
  } catch (error) {
    console.error('Error creating gift box:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create gift box',
    });
  }
};

export const updateGiftBox = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    const giftBox = await giftBoxService.updateKidsGiftBox(id, updateData);

    if (!giftBox) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Gift box not found',
      });
      return;
    }

    res.json(giftBox);
  } catch (error) {
    console.error('Error updating gift box:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update gift box',
    });
  }
};

export const deleteGiftBox = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await giftBoxService.deleteKidsGiftBox(id);

    if (!deleted) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Gift box not found',
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting gift box:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete gift box',
    });
  }
};