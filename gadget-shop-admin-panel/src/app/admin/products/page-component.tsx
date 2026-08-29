/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/products/page-component.tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Table columns updated to match the redesigned ProductTableRow
 *   (Product, Category, Price, Stock, Actions)
 * - Added a search input that filters the table by title client-side
 * - Table now sits inside a Card for visual consistency with the
 *   dashboard, and shows a result count
 */
"use client";

import { FC, useMemo, useState } from "react";
import { PlusIcon, Search } from "lucide-react";
import { v4 as uuid } from "uuid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProductsWithCategoriesResponse } from "@/app/admin/products/products.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Category } from "@/app/admin/categories/categories.types";
import {
  createOrUpdateProductSchema,
  CreateOrUpdateProductSchema,
} from "@/app/admin/products/schema";
import { imageUploadHandler } from "@/actions/categories";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/actions/products";
import { ProductForm } from "@/app/admin/products/product-form";
import { ProductTableRow } from "@/app/admin/products/product-table-row";

type Props = {
  categories: Category[];
  productsWithCategories: ProductsWithCategoriesResponse;
};

export const ProductPageComponent: FC<Props> = ({
  categories,
  productsWithCategories,
}) => {
  const [currentProduct, setCurrentProduct] =
    useState<CreateOrUpdateProductSchema | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const form = useForm<CreateOrUpdateProductSchema>({
    resolver: zodResolver(createOrUpdateProductSchema),
    defaultValues: {
      title: "",
      category: undefined,
      price: undefined,
      maxQuantity: undefined,
      heroImage: undefined,
      images: [],
      intent: "create",
    },
  });

  const router = useRouter();

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return productsWithCategories;
    return productsWithCategories.filter((product) =>
      product.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [productsWithCategories, search]);

  const productCreateUpdateHandler = async (
    data: CreateOrUpdateProductSchema
  ) => {
    const {
      category,
      images,
      maxQuantity,
      price,
      title,
      heroImage,
      slug,
      intent = "create",
    } = data;

    const uploadFile = async (file: File) => {
      const uniqueId = uuid();
      const fileName = `product/product-${uniqueId}-${file.name}`;
      const formData = new FormData();
      formData.append("file", file, fileName);
      return imageUploadHandler(formData);
    };

    let heroImageUrl: string | undefined;
    let imageUrls: string[] = [];

    if (heroImage) {
      const imagePromise = Array.from(heroImage).map((file) =>
        uploadFile(file as File)
      );
      try {
        [heroImageUrl] = await Promise.all(imagePromise);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Error uploading image");
        return;
      }
    }

    if (images.length > 0) {
      const imagesPromises = Array.from(images).map((file) => uploadFile(file));

      try {
        imageUrls = (await Promise.all(imagesPromises)) as string[];
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Error uploading images");
        return;
      }
    }

    switch (intent) {
      case "create": {
        if (heroImageUrl && imageUrls.length > 0) {
          await createProduct({
            category: Number(category),
            images: imageUrls,
            heroImage: heroImageUrl,
            maxQuantity: Number(maxQuantity),
            price: Number(price),
            title,
          });
          form.reset();
          router.refresh();
          setIsProductModalOpen(false);
          toast.success("Product created successfully");
        }
        break;
      }
      case "update": {
        if (heroImageUrl && imageUrls.length > 0 && slug) {
          await updateProduct({
            category: Number(category),
            heroImage: heroImageUrl,
            imageUrl: imageUrls,
            maxQuantity: Number(maxQuantity),
            price: Number(price),
            title,
            slug,
          });
          form.reset();
          router.refresh();
          setIsProductModalOpen(false);
          toast.success("Product updated successfully");
        }
        break;
      }

      default:
        console.error("Invalid intent");
    }
  };

  const deleteProductHandler = async () => {
    if (currentProduct?.slug) {
      await deleteProduct(currentProduct.slug);
      router.refresh();
      toast.success("Product deleted successfully");
      setIsDeleteModalOpen(false);
      setCurrentProduct(null);
    }
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="container mx-auto p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Products Management</h1>
          <Button
            onClick={() => {
              setCurrentProduct(null);
              setIsProductModalOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <ProductTableRow
                    setIsProductModalOpen={setIsProductModalOpen}
                    key={product.id}
                    product={product}
                    setCurrentProduct={setCurrentProduct}
                    setIsDeleteModalOpen={setIsDeleteModalOpen}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Product Modal */}
        <ProductForm
          form={form}
          onSubmit={productCreateUpdateHandler}
          categories={categories}
          isProductModalOpen={isProductModalOpen}
          setIsProductModalOpen={setIsProductModalOpen}
          defaultValues={currentProduct}
        />

        {/* Delete Product Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete {currentProduct?.title}?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteProductHandler}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};