import PocketBase from 'pocketbase';

export const pb = new PocketBase("https://cunconnects-pb.onrender.com");

// Helper: URL pública de un archivo almacenado en PocketBase
export function getFileUrl(record: { collectionId?: string; collectionName?: string; id: string; [key: string]: unknown }, filename: string | null | undefined): string | null {
  if (!filename) return null;
  return pb.getFileUrl(record as Parameters<typeof pb.getFileUrl>[0], filename);
}

// Helper: imagen fallback
export function imgOrDefault(url: string | null | undefined): string {
  return url || 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600';
}
