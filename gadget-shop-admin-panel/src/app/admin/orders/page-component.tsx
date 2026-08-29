/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/orders/page-component.tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Consolidated ID / Slug / Description / Date into a single "Order"
 *   cell block (spec-strip style) instead of 4 separate columns
 * - Status shown as a colored badge next to the editable Select,
 *   so you can scan status at a glance without reading the dropdown
 * - Added search (by customer email or order slug) and a status filter
 * - Wrapped in a Card to match the rest of the redesigned admin panel
 */
"use client";

import { OrdersWithProducts } from "@/app/admin/orders/types";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { updateOrderStatus } from "@/actions/orders";

const statusOptions = ["Pending", "Shipped", "InTransit", "Completed"];

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  Pending: "outline",
  Shipped: "secondary",
  InTransit: "secondary",
  Completed: "default",
};

type Props = {
  ordersWithProducts: OrdersWithProducts;
};

type OrderedProducts = {
  order_id: number;
  product: number & {
    category: number;
    created_at: string;
    heroImage: string;
    id: number;
    imageUrl: string[];
    maxQuantity: number;
    price: number;
    slug: string;
    title: string;
  };
}[];

export default function PageComponent({ ordersWithProducts }: Props) {
  const [selectedProducts, setSelectedProducts] = useState<OrderedProducts>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const openProductsModal = (products: OrderedProducts) => () =>
    setSelectedProducts(products);

  const orderedProducts = ordersWithProducts?.flatMap((order) =>
    order.order_items.map((item) => ({
      order_id: order.id,
      product: item.product,
    }))
  );

  const handleStatusChange = async (orderId: number, status: string) => {
    await updateOrderStatus(orderId, status);
  };

  const filteredOrders = useMemo(() => {
    return (ordersWithProducts ?? []).filter((order) => {
      // @ts-ignore
      const email: string = order.user?.email ?? "";
      const matchesSearch =
        !search.trim() ||
        email.toLowerCase().includes(search.trim().toLowerCase()) ||
        order.slug.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ordersWithProducts, search, statusFilter]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Orders Management</h1>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or order slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">#{order.id} · {order.slug}</span>
                      <span className="spec-strip">
                        {format(new Date(order.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </TableCell>
                  {/* @ts-ignore */}
                  <TableCell>{order.user?.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadgeVariant[order.status] ?? "outline"}>
                        {order.status}
                      </Badge>
                      <Select
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                        defaultValue={order.status}
                      >
                        <SelectTrigger className="w-[130px]" size="sm">
                          <SelectValue>{order.status}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {order.order_items.length} item{order.order_items.length > 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openProductsModal(
                            orderedProducts.filter((item) => item.order_id === order.id)
                          )}
                        >
                          View Products
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Order Products</DialogTitle>
                        </DialogHeader>

                        <div className="mt-4">
                          {selectedProducts.map(({ product }, index) => (
                            <div key={index} className="mb-2 flex items-center space-x-2">
                              <Image
                                className="h-16 w-16 rounded object-cover"
                                src={product.heroImage}
                                alt={product.title}
                                width={64}
                                height={64}
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold">{product.title}</span>
                                <span className="font-mono text-muted-foreground">
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Available Quantity: {product.maxQuantity}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}