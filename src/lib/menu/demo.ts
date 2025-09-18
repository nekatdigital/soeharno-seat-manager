import type { MenuItem } from "@/lib/menu/types";

export const demoMenu: MenuItem[] = [
  { id: '1', name: 'Nasi Gudeg', price: 25000, category: 'makanan', is_active: true },
  { id: '2', name: 'Ayam Bakar', price: 35000, category: 'makanan', is_active: true },
  { id: '3', name: 'Pecel Lele', price: 20000, category: 'makanan', is_active: true },
  { id: '4', name: 'Ikan Bakar', price: 45000, category: 'makanan', is_active: true },
  { id: '5', name: 'Es Teh Manis', price: 8000, category: 'minuman', is_active: true },
  { id: '6', name: 'Es Jeruk', price: 10000, category: 'minuman', is_active: true },
  { id: '7', name: 'Kopi Tubruk', price: 12000, category: 'minuman', is_active: true },
  { id: '8', name: 'Paket Mancing 1 Jam', price: 15000, category: 'paket_mancing', is_active: true },
  { id: '9', name: 'Paket Mancing 3 Jam', price: 40000, category: 'paket_mancing', is_active: true },
];
