import multer from 'multer'
import { AppError } from '../utils/AppError.js'

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])

export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(_request, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError(415, 'Only PDF, JPEG, and PNG files are allowed.'))
      return
    }
    callback(null, true)
  },
})