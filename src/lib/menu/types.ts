export type MenuCategory = 'makanan' | 'minuman' | 'paket_mancing';
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  is_active?: boolean;
}
