/**
 * [INPUT]:    接收 FormData (包含 file)
 * [OUTPUT]:   返回成功后的图片 URL 及元信息
 * [POS]:      app/actions/upload.ts - 文件上传 Server Action
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use server'

import { uploadToImgURL } from '@/lib/image'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

function hasImageSignature(bytes: Uint8Array): boolean {
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  const isGif =
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50

  return isJpeg || isPng || isGif || isWebp
}

export async function uploadImageAction(formData: FormData) {
  const file = formData.get('file')

  if (!(file instanceof File)) {
    throw new Error('No file provided for upload')
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('Unsupported image type')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image is too large')
  }

  const buffer = await file.arrayBuffer()
  const headerBytes = new Uint8Array(buffer.slice(0, 12))
  if (!hasImageSignature(headerBytes)) {
    throw new Error('Invalid image file')
  }

  try {
    const result = await uploadToImgURL(file);
    return {
      success: true,
      data: result
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}
