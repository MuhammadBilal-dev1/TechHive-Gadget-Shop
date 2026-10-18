/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/coupons/page-component.tsx
 * (new file)
 */
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coupon, createCoupon, deleteCoupon, toggleCouponActive } from "@/actions/coupons";

export default function CouponsPageComponent({ coupons }: { coupons: Coupon[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrderAmount("0");
    setExpiresAt("");
  };

  const handleCreate = async () => {
    if (!code.trim() || !discountValue) {
      toast.error("Code and discount value are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await createCoupon({
        code,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrderAmount || 0),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      toast.success("Coupon created");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await toggleCouponActive(coupon.id, !coupon.is_active);
      toast.success(coupon.is_active ? "Coupon deactivated" : "Coupon activated");
    } catch (error) {
      toast.error("Could not update coupon");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCoupon(id);
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error("Could not delete coupon");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" /> New coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create coupon</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="SAVE20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Discount type</Label>
                  <Select
                    value={discountType}
                    onValueChange={(v) => setDiscountType(v as "percentage" | "flat")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "percentage" ? "20" : "10"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Minimum order ($)</Label>
                  <Input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Expires (optional)</Label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create coupon"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min order</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const isExpired = coupon.expires_at
                  ? new Date(coupon.expires_at) < new Date()
                  : false;

                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `$${coupon.discount_value.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="font-mono">
                      ${coupon.min_order_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {coupon.expires_at ? (
                        <span className={isExpired ? "text-destructive" : "spec-strip"}>
                          {format(new Date(coupon.expires_at), "MMM dd, yyyy")}
                          {isExpired ? " (expired)" : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={() => handleToggle(coupon)}
                        />
                        <Badge variant={coupon.is_active ? "default" : "outline"}>
                          {coupon.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
