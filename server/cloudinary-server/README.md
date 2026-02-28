# Cloudinary Server

Server quản lý tài nguyên ảnh cho PC Shop sử dụng Cloudinary.

## Cài đặt

```bash
cd cloudinary-server
npm install
```

## Chạy server

```bash
# Development (với auto-reload)
npm run dev

# Production
npm start
```

Server sẽ chạy tại `http://localhost:3001`

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Health check |
| POST | `/api/upload` | Upload 1 ảnh |
| POST | `/api/upload-multiple` | Upload nhiều ảnh (tối đa 10) |
| DELETE | `/api/delete/:public_id` | Xóa ảnh theo public_id |
| GET | `/api/images` | Lấy danh sách ảnh |

## Ví dụ sử dụng

### Upload ảnh từ client:

```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formData
});

const data = await response.json();
console.log(data.url); // URL ảnh từ Cloudinary
```
