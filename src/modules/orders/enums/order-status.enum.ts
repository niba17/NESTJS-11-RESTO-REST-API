export enum OrderStatus {
  PENDING = 'PENDING', // Pesanan masuk, belum diproses
  PREPARING = 'PREPARING', // Sedang dimasak
  READY = 'READY', // Siap saji/antar
  COMPLETED = 'COMPLETED', // Sudah dibayar/selesai
  CANCELLED = 'CANCELLED', // Dibatalkan
}
