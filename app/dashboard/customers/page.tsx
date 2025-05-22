import { fetchFilteredCustomers } from "@/app/lib/data";
import { Metadata } from "next";
import CustomersTable from "@/app/ui/customers/table";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || "";
  const customersData = await fetchFilteredCustomers(query);

  return (
    <div className="w-full">
      <CustomersTable customers={customersData} />
    </div>
  );
}
