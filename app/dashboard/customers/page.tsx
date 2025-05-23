import { fetchCustomers } from "@/app/lib/data";
import { Metadata } from "next";
import CustomersTable from "@/app/ui/customers/table";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function Page() {
  const customersData = await fetchCustomers();

  return (
    <div className="w-full">
      <CustomersTable customers={customersData} />
    </div>
  );
}
