import { DeleteObjectCommand, PutObjectCommand, S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { AppError } from '../utils/AppError.js'

export interface ObjectStorageAdapter {
  put(key: string, body: Buffer, contentType: string): Promise<void>
  signDownload(key: string, fileName: string): Promise<string>
  delete(key: string): Promise<void>
}

let adapterOverride: ObjectStorageAdapter | null = null

export function setObjectStorageAdapter(adapter: ObjectStorageAdapter | null): void {
  adapterOverride = adapter
}

function getStorageConfig() {
  const endpoint = process.env.S3_ENDPOINT
  const region = process.env.S3_REGION
  const bucket = process.env.S3_BUCKET
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
  if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new AppError(503, 'Private document storage is not configured.')
  }
  return { endpoint, region, bucket, accessKeyId, secretAccessKey }
}

function getS3Client() {
  const config = getStorageConfig()
  return {
    bucket: config.bucket,
    client: new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    }),
  }
}

export async function putPrivateObject(key: string, body: Buffer, contentType: string): Promise<void> {
  if (adapterOverride) return adapterOverride.put(key, body, contentType)
  const { client, bucket } = getS3Client()
  try {
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }))
  } catch {
    throw new AppError(502, 'Could not store the uploaded document.')
  } finally {
    client.destroy()
  }
}

export async function createPrivateDownloadUrl(key: string, fileName: string): Promise<string> {
  if (adapterOverride) return adapterOverride.signDownload(key, fileName)
  const { client, bucket } = getS3Client()
  try {
    return await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${fileName.replace(/["\\\r\n]/g, '_')}"`,
      }),
      { expiresIn: 120 },
    )
  } catch {
    throw new AppError(502, 'Could not prepare the private document download.')
  } finally {
    client.destroy()
  }
}

export async function deletePrivateObject(key: string): Promise<void> {
  if (adapterOverride) return adapterOverride.delete(key)
  const { client, bucket } = getS3Client()
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  } catch {
    console.error('Failed to remove an unreferenced object from private storage.')
  } finally {
    client.destroy()
  }
}