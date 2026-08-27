import React from "react";
import PageComponent from "./page-component";
import { getMonthlyOrders } from "@/actions/orders";
import { getCategoryData } from "@/actions/categories";
import { getLatestUsers } from "@/actions/auth";

const AdminDashboard = async () => {
  const monthlyOrders = await getMonthlyOrders();
  const categoryData = await getCategoryData();
  const latestUsers = await getLatestUsers();

  return (
    <PageComponent
      latestUsers={latestUsers}
      monthlyOrders={monthlyOrders}
      categoryData={categoryData}
    />
  );
};

export default AdminDashboard;
