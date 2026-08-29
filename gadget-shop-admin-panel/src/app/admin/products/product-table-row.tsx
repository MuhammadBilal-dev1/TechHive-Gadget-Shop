/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/products/product-table-row.tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Thumbnail + title grouped together instead of separate columns
 * - Category shown as a badge instead of plain text
 * - Price in monospace (matches the "spec sheet" identity)
 * - Stock column replaced with a spec-strip (SKU · qty · status dot)
 * - Fixed a pre-existing bug: the delete icon's onClick handler was
 *   wired to setCurrentProduct instead of opening the delete modal
 */
import { Dispatch, SetStateAction } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { ProductWithCategory } from '@/app/admin/products/products.types';
import { CreateOrUpdateProductSchema } from '@/app/admin/products/schema';
import { getStockStatus, stockStatusDotClass, stockStatusLabel } from '@/lib/stock';

type Props = {
  product: ProductWithCategory;
  setIsProductModalOpen: Dispatch<SetStateAction<boolean>>;
  setCurrentProduct: Dispatch<
    SetStateAction<CreateOrUpdateProductSchema | null>
  >;
  setIsDeleteModalOpen: Dispatch<SetStateAction<boolean>>;
};

export const ProductTableRow = ({
  product,
  setIsProductModalOpen,
  setCurrentProduct,
  setIsDeleteModalOpen,
}: Props) => {
  const stockStatus = getStockStatus(product.maxQuantity);
  const sku = `GS-${String(product.id).padStart(4, '0')}`;

  const toEditableProduct = (): CreateOrUpdateProductSchema => ({
    title: product.title,
    category: product.category.id.toString(),
    price: product.price?.toString() ?? '',
    maxQuantity: product.maxQuantity.toString(),
    heroImage: undefined,
    images: [],
    slug: product.slug,
    intent: 'update',
  });

  const handleEditClick = () => {
    setCurrentProduct(toEditableProduct());
    setIsProductModalOpen(true);
  };

  const handleDeleteClick = () => {
    setCurrentProduct(toEditableProduct());
    setIsDeleteModalOpen(true);
  };

  return (
    <TableRow key={product.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          {product.heroImage && (
            <Image
              width={40}
              height={40}
              src={product.heroImage}
              alt={product.title}
              className="h-10 w-10 rounded-md border object-cover"
            />
          )}
          <span className="font-medium">{product.title}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{product.category.name}</Badge>
      </TableCell>
      <TableCell className="font-mono">${product.price?.toFixed(2)}</TableCell>
      <TableCell>
        <span className="spec-strip">
          <span className={`spec-dot ${stockStatusDotClass[stockStatus]}`} />
          {sku} · QTY {product.maxQuantity} · {stockStatusLabel[stockStatus]}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={handleEditClick}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDeleteClick}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
};