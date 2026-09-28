import mongoose, { type InferSchemaType } from 'mongoose'
import { ROLES } from './roles.js'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: Object.values(ROLES) },
    brokerageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brokerage', default: null },
  },
  { timestamps: true },
)

userSchema.pre('validate', function () {
  if (this.role === ROLES.PLATFORM_ADMIN) {
    this.brokerageId = null
  } else if (!this.brokerageId) {
    this.invalidate('brokerageId', 'This role must belong to exactly one brokerage.')
  }
})

export type UserDocument = InferSchemaType<typeof userSchema> & mongoose.Document

export const User = mongoose.models.User ?? mongoose.model('User', userSchema)