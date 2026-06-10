import { openDB } from 'idb'

// Inisialisasi Database
const initDB = async () => {
  return openDB('tabeon_db', 1, {
    upgrade(db) {
      // Membuat 'tabel/koleksi' bernama 'images' jika belum ada
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images')
      }
    }
  })
}

// Menyimpan File (Blob)
export const saveImageToDB = async (key: string, file: Blob) => {
  const db = await initDB()
  await db.put('images', file, key)
}

// Mengambil File (Blob)
export const getImageFromDB = async (key: string): Promise<Blob | undefined> => {
  const db = await initDB()
  return await db.get('images', key)
}

// Menghapus File
export const deleteImageFromDB = async (key: string) => {
  const db = await initDB()
  await db.delete('images', key)
}