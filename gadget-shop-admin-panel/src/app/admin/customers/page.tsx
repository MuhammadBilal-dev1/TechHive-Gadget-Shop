/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/customers/page.tsx
 * (new page — accessible to anyone who can reach /admin, same as
 * Products/Orders/Categories; unlike Team, this isn't super_admin-only)
 */
import { getCustomers } from "@/actions/customers";
import CustomersPageComponent from "./customers-page-component";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return <CustomersPageComponent customers={customers} />;
}