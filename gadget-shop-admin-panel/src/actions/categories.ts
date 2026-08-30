"use server";

import slugify from "slugify";
import { CategoriesWithProductsResponse } from "@/app/admin/categories/categories.types";
import {
  CreateCategorySchemaServer,
  UpdateCategorySchema,
} from "@/app/admin/categories/create-category.schema";
import { createClient } from "@/supabase/server";

const supabase = createClient();

export const getCategoriesWithProducts =
  async (): Promise<CategoriesWithProductsResponse> => {
    const { data, error } = await (await supabase)
      .from("category")
      .select("* , products:product(*)")
      .returns<CategoriesWithProductsResponse>();

    if (error) throw new Error(`Error fetching categories: ${error.message}`);

    return data || [];
  };

export const imageUploadHandler = async (formData: FormData) => {
  if (!formData) return;

  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) throw new Error("Expexted a file");

  const fileName = fileEntry.name;

  try {
    const { data, error } = await (await supabase).storage
      .from("gadget-app-images")
      .upload(fileName, fileEntry, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image: ", error);
      throw new Error("Error uploading image");
    }

    const {
      data: { publicUrl },
    } = await (await supabase).storage
      .from("gadget-app-images")
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw new Error("Error uploading image");
  }
};

export const createCategory = async ({
  image: imageUrl,
  name,
}: CreateCategorySchemaServer) => {
  const slug = slugify(name, { lower: true });

  const { data, error } = await (await supabase).from("category").insert({
    name,
    imageUrl,
    slug,
  });

  if (error) throw new Error(`Error reating category: ${error.message}`);

  return data;
};

export const updateCategory = async ({
  imageUrl,
  name,
  slug
}: UpdateCategorySchema) => {
  // const slug = slugify(name, { lower: true });

  const { data, error } = await (
    await supabase
  )
    .from("category")
    .update({
      name,
      imageUrl,
    })
    .match({ slug });

  if (error) throw new Error(`Error reating category: ${error.message}`);

  return data;
};

export const deleteCategory = async (id: number) => {
  const { error } = await (await supabase)
    .from("category")
    .delete()
    .match({ id });

  if (error) throw new Error(`Error deleting category: ${error.message}`);
};

export const getCategoryData = async () => {
  const supabase = createClient();
  const { data, error } = await (await supabase).from('category')
    .select('name, products:product(id)');

  if (error) throw new Error(`Error fetching category data: ${error.message}`);

  const categoryData = data.map(
    (category: { name: string; products: { id: number }[] }) => ({
      name: category.name,
      products: category.products.length,
    })
  );

  return categoryData;
};