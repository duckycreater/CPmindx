// Cloudinary Configuration
// Sử dụng Cloudinary Server tại localhost:3001 để upload ảnh (server-side)
const CLOUDINARY_SERVER_URL = 'http://localhost:3001';

// Upload image to Cloudinary via Server
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${CLOUDINARY_SERVER_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

