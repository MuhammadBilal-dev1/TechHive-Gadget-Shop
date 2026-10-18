/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/customers/page-component.tsx
 * (new file)
 *
 * Table of all customers with their order count + total spent, with a
 * search box by email. Same visual pattern as Products/Orders/
 * Categories pages (Card + search + spec-strip date).
 */
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerSummary } from "@/actions/customers";

export default function CustomersPageComponent({
  customers,
}: {
  customers: CustomerSummary[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    return customers.filter((c) =>
      c.email.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [customers, search]);

  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Customers</h1>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Total customers
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Revenue from customers
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>
            {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
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
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.email}</TableCell>
                  <TableCell>
                    <span className="spec-strip">
                      {customer.created_at
                        ? format(new Date(customer.created_at), "MMM dd, yyyy")
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.order_count > 0 ? "secondary" : "outline"}>
                      {customer.order_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">${customer.total_spent.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}