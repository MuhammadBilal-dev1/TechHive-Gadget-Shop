/**
 * Drop this file at: gadget-shop-admin-panel/src/components/category.tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Created date shown as a spec-strip instead of plain text
 * - Product count shown as a badge next to the linked-products dialog
 * - Larger, consistently-rounded thumbnail matching the products table
 */
import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TableCell, TableRow } from "@/components/ui/table";
import { CreateCategorySchema } from "@/app/admin/categories/create-category.schema";
import { CategoryWithProducts } from "@/app/admin/categories/categories.types";

export const CategoryTableRow = ({
  category,
  setCurrentCategory,
  setIsCreateCategoryModalOpen,
  deleteCategoryHandler,
}: {
  category: CategoryWithProducts;
  setCurrentCategory: (category: CreateCategorySchema | null) => void;
  setIsCreateCategoryModalOpen: (isOpen: boolean) => void;
  deleteCategoryHandler: (id: number) => Promise<void>;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const productCount = category.products?.length ?? 0;

  const handleEditClick = (category: CreateCategorySchema) => {
    setCurrentCategory({
      name: category.name,
      // @ts-ignore
      image: new File([], ""),
      intent: "update",
      slug: category.slug,
    });
    setIsCreateCategoryModalOpen(true);
  };

  const handleDelete = async () => {
    await deleteCategoryHandler(category.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <TableRow>
        <TableCell className="sm:table-cell">
          <Image
            alt={category.name}
            className="aspect-square rounded-md border object-cover"
            height="56"
            src={category.imageUrl}
            width="56"
          />
        </TableCell>
        <TableCell className="font-medium">{category.name}</TableCell>
        <TableCell className="md:table-cell">
          <span className="spec-strip">
            {format(new Date(category.created_at), "yyyy-MM-dd")}
          </span>
        </TableCell>
        <TableCell className="md:table-cell">
          {productCount > 0 ? (
            <Dialog>
              <DialogTrigger asChild>
                <Badge variant="outline" className="cursor-pointer">
                  {productCount} product{productCount > 1 ? "s" : ""}
                </Badge>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle className="sr-only">Category product list</DialogTitle>
                <h2>Products</h2>
                <ScrollArea className="h-[400px] rounded-md p-4">
                  {category.products.map((product) => (
                    <Card key={product.id} className="mb-4 cursor-pointer">
                      <div className="grid-cols-[100px,1fr] flex items-center gap-4 pl-5">
                        <Image
                          alt={product.title}
                          className="aspect-square rounded-md object-cover"
                          height="100"
                          src={product.heroImage}
                          width="100"
                        />
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-medium leading-none">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.maxQuantity} in stock
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          ) : (
            <span className="text-sm text-muted-foreground">No products linked</span>
          )}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  handleEditClick({
                    ...category,
                    intent: "update",
                  })
                }
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <Dialog open={isDeleteDialogOpen} onOpenChange={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this category.
              {productCount > 0 && (
                <span className="mt-2 block font-medium text-destructive">
                  {productCount} product{productCount > 1 ? "s are" : " is"} still linked to
                  this category.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};