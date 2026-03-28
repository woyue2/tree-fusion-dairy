/**
 * [INPUT]:    依赖 process.env.ImgURL_Upload_URL 及其 Token（Authorization Bearer）
 * [OUTPUT]:   uploadToImgURL — 执行图床上传并返回图片 URL
 * [POS]:      lib/image.ts - 图床交互服务入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

interface ImgURLResponse {
  code: number;
  msg: string;
  data?: {
    url: string;
    id: string;
    path: string;
    original_name: string;
  };
}

export async function uploadToImgURL(file: File) {
  const uploadUrl = process.env.ImgURL_Upload_URL;
  const token = process.env.ImgURL_Token;

  if (!uploadUrl || !token) {
    throw new Error('ImgURL environment variables are not configured in .env.local');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgURL upload failed with status: ${response.status}`);
    }

    const result: ImgURLResponse = await response.json();

    if (result.code !== 200 || !result.data) {
      throw new Error(result.msg || 'ImgURL uploaded failed without specific error message');
    }

    return {
      url: result.data.url,
      id: result.data.id,
      name: result.data.original_name
    };
  } catch (error) {
    console.error('[ImgURL] Upload Exception:', error);
    throw error;
  }
}
