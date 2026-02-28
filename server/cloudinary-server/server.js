require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer config for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
    }
});

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ======================
// ROUTES
// ======================

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Cloudinary Server đang chạy',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
    });
});

// Upload single image
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file được upload' });
        }

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'pc-shop-products',
            resource_type: 'image'
        });

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Lỗi upload ảnh: ' + error.message });
    }
});

// Upload multiple images
app.post('/api/upload-multiple', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Không có file được upload' });
        }

        const uploadPromises = req.files.map(async (file) => {
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;

            return cloudinary.uploader.upload(dataURI, {
                folder: 'pc-shop-products',
                resource_type: 'image'
            });
        });

        const results = await Promise.all(uploadPromises);

        res.json({
            success: true,
            files: results.map(r => ({
                url: r.secure_url,
                public_id: r.public_id
            }))
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Lỗi upload ảnh: ' + error.message });
    }
});

// Delete image by public_id
app.delete('/api/delete/:public_id', async (req, res) => {
    try {
        const { public_id } = req.params;
        const result = await cloudinary.uploader.destroy(public_id);

        res.json({
            success: true,
            result
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Lỗi xóa ảnh: ' + error.message });
    }
});

// List images in folder
app.get('/api/images', async (req, res) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'pc-shop-products',
            max_results: 50
        });

        res.json({
            success: true,
            images: result.resources.map(r => ({
                url: r.secure_url,
                public_id: r.public_id,
                created_at: r.created_at
            }))
        });

    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({ error: 'Lỗi lấy danh sách ảnh: ' + error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Cloudinary Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📁 Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});
