/**
 * [INPUT]:    接收 FormData (包含 file)
 * [OUTPUT]:   返回成功后的图片 URL 及元信息
 * [POS]:      app/actions/upload.ts - 文件上传 Server Action
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use server'

import { uploadToImgURL } from '@/lib/image'

export async function uploadImageAction(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided for upload');
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
