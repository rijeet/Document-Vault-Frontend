export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  allowedFormats: string;
}

export interface UploadedFileMeta {
  publicId: string;
  secureUrl: string;
  mimeType: string;
  resourceType: string;
  fileSize: number;
  originalName: string;
}

/**
 * Uploads a single file directly from the browser to Cloudinary using a
 * signed payload obtained from our backend — bytes never pass through
 * Vercel's serverless function, sidestepping its ~4.5MB request-body cap.
 * XMLHttpRequest (not fetch) is used specifically for upload progress events.
 */
export function uploadFileToCloudinaryDirect(
  file: File,
  signature: UploadSignature,
  onProgress?: (percent: number) => void,
): Promise<UploadedFileMeta> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);
    formData.append("allowed_formats", signature.allowedFormats);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let json: any;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error(`${file.name}: unexpected response from Cloudinary`));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          publicId: json.public_id,
          secureUrl: json.secure_url,
          mimeType: file.type,
          resourceType: json.resource_type,
          fileSize: json.bytes,
          originalName: file.name,
        });
      } else {
        reject(new Error(`${file.name}: ${json?.error?.message ?? `upload failed (${xhr.status})`}`));
      }
    };

    xhr.onerror = () => reject(new Error(`${file.name}: network error while uploading`));
    xhr.send(formData);
  });
}

/** Runs async work over items with a concurrency cap, so many files don't
 * all hit Cloudinary (and the browser's connection limit) simultaneously. */
export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<{ results: R[]; errors: { item: T; error: Error }[] }> {
  const results: R[] = new Array(items.length);
  const errors: { item: T; error: Error }[] = [];
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    const i = nextIndex++;
    if (i >= items.length) return;
    try {
      results[i] = await worker(items[i], i);
    } catch (err) {
      errors.push({ item: items[i], error: err instanceof Error ? err : new Error(String(err)) });
    }
    return runNext();
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runNext()));
  return { results: results.filter((r) => r !== undefined), errors };
}