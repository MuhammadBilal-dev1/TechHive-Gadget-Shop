/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/dashboard/page-component.tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Added 4 stat cards at the top (Total Orders, Total Products,
 *   Categories, New Signups) computed from the same props already
 *   passed in — no new server actions needed for this pass.
 * - Restyled charts with the TechHive palette instead of the default
 *   recharts blue/green/orange set.
 * - Latest Users table now shows a spec-strip style row (mono date).
 */
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Package, Layers, Users, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MonthlyOrderData = {
  name: string;
  orders: number;
};

type CatrgoryData = {
  name: string;
  products: number;
};

type LatestUser = {
  id: string;
  email: string;
  date: string | null;
};

const CHART_COLORS = ["#F2A93B", "#4FC1E9", "#3FCF8E", "#E5484D", "#8A6423"];

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-md bg-primary/15 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

const PageComponent = ({
  monthlyOrders,
  categoryData,
  latestUsers,
}: {
  monthlyOrders: MonthlyOrderData[];
  categoryData: CatrgoryData[];
  latestUsers: LatestUser[];
}) => {
  const totalOrders = monthlyOrders.reduce((sum, m) => sum + m.orders, 0);
  const totalProducts = categoryData.reduce((sum, c) => sum + c.products, 0);
  const totalCategories = categoryData.length;

  return (
    <div className="flex-1 p-8 overflow-auto">
      <h1 className="mb-6 text-3xl font-bold">Dashboard Overview</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={totalOrders} icon={ShoppingCart} />
        <StatCard label="Total Products" value={totalProducts} icon={Package} />
        <StatCard label="Categories" value={totalCategories} icon={Layers} />
        <StatCard label="New Signups" value={latestUsers.length} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <Legend />
                <Bar dataKey="orders" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Product Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="products"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category to products Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Products per Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <Legend />
                <Bar dataKey="products" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Latest Users */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="spec-strip">
                        <span className="spec-dot spec-dot--in-stock" />
                        {user.date ? new Date(user.date).toLocaleDateString() : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageComponent;