/**
 * Stubbed Vercel Blob storage helpers.
 * Replace with @vercel/blob when deploying to Vercel.
 */

export async function uploadToBlob(
  _filename: string,
  _data: Buffer | string,
): Promise<string> {
  // TODO: replace with actual Vercel Blob upload
  return `/placeholder-blob/${Date.now()}.png`;
}

export async function deleteFromBlob(_url: string): Promise<void> {
  // TODO: replace with actual Vercel Blob delete
}
