/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/coupons/page.tsx
 * (new page)
 */
import { getCoupons } from "@/actions/coupons";
import CouponsPageComponent from "@/app/admin/coupons/page-component";

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return <CouponsPageComponent coupons={coupons} />;
}
