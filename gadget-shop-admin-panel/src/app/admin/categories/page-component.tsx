/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/categories/page-component.tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Table wrapped in a Card header with a search input and result count
 * - Header label "Products" -> shows count via badge now (see category.tsx)
 */
"use client";

import { FC, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { PlusCircle, Search } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CategoryTableRow } from "@/components/category";
import {
  createCategorySchema,
  CreateCategorySchema,
} from "@/app/admin/categories/create-category.schema";
import { CategoriesWithProductsResponse } from "@/app/admin/categories/categories.types";
import { CategoryForm } from "@/app/admin/categories/category-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCategory, deleteCategory, imageUploadHandler, updateCategory } from "@/actions/categories";

type Props = {
  categories: CategoriesWithProductsResponse;
};

const CategoriesPageComponent: FC<Props> = ({ categories }) => {
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<CreateCategorySchema | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      image: undefined,
    },
  });

  const router = useRouter();

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [categories, search]);

  const submitCategoryHandler: SubmitHandler<CreateCategorySchema> = async (
    data
  ) => {
    const { image, name, intent = "create" } = data;

    const handleImageUpload = async () => {
      const uniqueId = uuid();
      const fileName = `category/category-${uniqueId}`;
      const file = new File([data.image[0]], fileName);
      const formData = new FormData();
      formData.append("file", file);

      return imageUploadHandler(formData);
    };

    switch (intent) {
      case "create": {
        const imageUrl = await handleImageUpload();

        if (imageUrl) {
          await createCategory({ image: imageUrl, name });
          form.reset();
          router.refresh();
          setIsCreateCategoryModalOpen(false);
          toast.success("Category created successfully");
        }
        break;
      }
      case "update": {
        if (image && currentCategory?.slug) {
          const imageUrl = await handleImageUpload();

          if (imageUrl) {
            await updateCategory({
              imageUrl,
              name,
              slug: currentCategory.slug,
              intent: "update",
            });
            form.reset();
            router.refresh();
            setIsCreateCategoryModalOpen(false);
            toast.success("Category updated successfully");
          }
        }
      }

      default:
        console.error("Invalid intent");
    }
  };

  const deleteCategoryHandler = async (id: number) => {
    await deleteCategory(id);
    router.refresh();
    toast.success("Category deleted successfully");
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="my-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog
          open={isCreateCategoryModalOpen}
          onOpenChange={() =>
            setIsCreateCategoryModalOpen(!isCreateCategoryModalOpen)
          }
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={() => {
                setCurrentCategory(null);
                setIsCreateCategoryModalOpen(true);
              }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Category
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              form={form}
              onSubmit={submitCategoryHandler}
              defaultValues={currentCategory}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-x-auto">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>
            {filteredCategories.length} categor
            {filteredCategories.length !== 1 ? "ies" : "y"}
          </CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="md:table-cell">Created at</TableHead>
                <TableHead className="md:table-cell">Products</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <CategoryTableRow
                  key={category.id}
                  category={category}
                  setCurrentCategory={setCurrentCategory}
                  setIsCreateCategoryModalOpen={setIsCreateCategoryModalOpen}
                  deleteCategoryHandler={deleteCategoryHandler}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
};

export default CategoriesPageComponent;