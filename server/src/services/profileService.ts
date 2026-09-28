import { Types } from 'mongoose'
import { Brokerage } from '../models/Brokerage.js'
import type { UserDocument } from '../models/User.js'

export interface SafeProfile {
  id: string
  name: string
  email: string
  role: UserDocument['role']
  brokerageId: string | null
  brokerageName: string | null
}

export async function toSafeProfile(user: UserDocument): Promise<SafeProfile> {
  const brokerageId = user.brokerageId?.toString() ?? null
  const brokerage = brokerageId
    ? await Brokerage.findById(new Types.ObjectId(brokerageId)).select('name').lean().exec() as { name: string } | null
    : null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    brokerageId,
    brokerageName: brokerage?.name ?? null,
  }
}