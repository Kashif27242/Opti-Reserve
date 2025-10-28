const gallaryRepository = require('../repositories/gallaryRepository');
const fs = require('fs');
const path = require('path');

class GallaryController {

    // GET /gallaries
    async index(req, res) {
        try {
            const gallaries = await gallaryRepository.findAll({ orderBy: 'img_order', direction: 'asc' });
            return res.json({ data: gallaries });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch gallaries' });
        }
    }

    // POST /gallaries
    async store(req, res) {
        try {
            const files = req.files; // using multer or similar middleware
            if (!files || !files.length) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            const gallary = await gallaryRepository.storeImages(files);
            return res.json({ message: 'Gallary images uploaded', data: gallary });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
    }

    // GET /gallaries/:id
    async show(req, res) {
        try {
            const { id } = req.params;
            const gallary = await gallaryRepository.findById(id);
            return res.json({ data: gallary });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch gallary' });
        }
    }

    // PUT /gallaries/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const gallary = await gallaryRepository.update(id, data);
            return res.json({ message: 'Gallary updated', data: gallary });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
    }

    // DELETE /gallaries/:id
    async destroy(req, res) {
        try {
            const { id } = req.params;
            await gallaryRepository.delete(id);
            return res.json({ message: 'Gallary deleted' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
    }

    // POST /gallaries/reorder
    async reorder(req, res) {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids)) {
                return res.status(400).json({ status: 'error', message: 'Invalid input' });
            }
            await gallaryRepository.reorder(ids);
            return res.json({ status: 'success' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
    }

    // POST /gallaries/delete-images
    async deleteImages(req, res) {
        try {
            let { imageIds } = req.body;

            if (!Array.isArray(imageIds)) {
                imageIds = JSON.parse(imageIds);
            }

            if (!Array.isArray(imageIds)) {
                return res.status(400).json({ error_message: 1, message: 'Invalid input' });
            }

            await gallaryRepository.deleteImagesById(imageIds);

            return res.json({ error_message: 0, message: 'Images deleted successfully' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error_message: 1, message: err.message });
        }
    }
}

module.exports = new GallaryController();
