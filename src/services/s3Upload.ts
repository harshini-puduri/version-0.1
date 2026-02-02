// S3 Image Upload Service
import { backendMode } from './storageMode';

const getApiUrl = () => {
  return backendMode.getUrl();
};

export interface UploadUrlResponse {
  upload_url: string;
  public_url: string;
  key: string;
}

export interface ImageMetadata {
  s3_key: string;
  url: string;
  rag_processed?: boolean;
  rag_description?: string;
}

export const s3Upload = {
  // Get presigned URL for upload
  async getUploadUrl(filename: string, contentType: string): Promise<UploadUrlResponse> {
    const apiUrl = getApiUrl();
    console.log('[S3Upload] Requesting upload URL from:', `${apiUrl}/api/media/upload-url?user_id=demo_user`);
    try {
      const response = await fetch(`${apiUrl}/api/media/upload-url?user_id=demo_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content_type: contentType
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[S3Upload] Failed to get upload URL:', response.status, errorText);
        throw new Error(`Failed to get upload URL: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      console.log('[S3Upload] Got upload URL:', data.key);
      return data;
    } catch (error) {
      console.error('[S3Upload] Network error getting upload URL:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Failed to fetch - Backend may not be running at ${apiUrl}`);
      }
      throw error;
    }
  },

  // Upload file to S3
  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    console.log('[S3Upload] Uploading to S3, file size:', file.size, 'bytes');
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[S3Upload] S3 upload failed:', response.status, errorText);
        throw new Error(`S3 upload failed: ${response.status} - ${errorText}`);
      }
      
      console.log('[S3Upload] Successfully uploaded to S3');
    } catch (error) {
      console.error('[S3Upload] Network error uploading to S3:', error);
      if (error instanceof TypeError) {
        throw new Error('Cannot reach S3 - Check S3 bucket CORS configuration');
      }
      throw error;
    }
  },

  // Complete upload flow
  async uploadImage(file: File): Promise<ImageMetadata> {
    // 1. Get presigned URL
    const { upload_url, public_url, key } = await this.getUploadUrl(
      file.name,
      file.type
    );
    
    // 2. Upload to S3
    await this.uploadToS3(upload_url, file);
    
    // 3. Return metadata
    return {
      s3_key: key,
      url: public_url,
      rag_processed: false
    };
  },

  // Upload multiple images
  async uploadImages(files: File[]): Promise<ImageMetadata[]> {
    const uploads = files.map(file => this.uploadImage(file));
    return Promise.all(uploads);
  }
};
