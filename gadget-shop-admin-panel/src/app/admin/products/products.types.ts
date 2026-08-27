import { Category } from "@/app/admin/categories/categories.types";

export type ProductWithCategory = {
  id: number;
  title: string;
  slug: string;
  imageUrl: string[];
  price: number;
  heroImage: string;
  category: Category;
  maxQuantity: number;
  created_at: string;
};

export type ProductsWithCategoriesResponse = ProductWithCategory[]

export type UpdateProductSchema = {
    category: number;
    heroImage: string;
    imageUrl: string[];
    maxQuantity: number;
    price: number;
    slug: string;
    title: string;
}
