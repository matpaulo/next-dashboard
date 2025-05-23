import { CalendarIcon } from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";
import { fetchRevenueFromCustomers } from "@/app/lib/data";

export default async function RevenueChart() {
  const chartHeight = 350;
  const revenueData = await fetchRevenueFromCustomers();

  const allMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date.toISOString().slice(0, 7);
  });

  const completeData = allMonths.map((month) => {
    const found = revenueData.find((item) => item.month === month);
    return {
      month,
      total: found ? found.total / 100 : 0,
    };
  });

  const allValues = completeData.map((item) => item.total);
  const maxValue = Math.max(...allValues);
  const topLabel = Math.ceil(maxValue / 1000) * 1000 || 1000;

  if (!revenueData || revenueData.length === 0) {
    return <p className="mt-4 text-gray-400">No data available.</p>;
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue (From Customers)
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="mt-0 grid grid-cols-8 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          ></div>
          {completeData.map((monthData) => (
            <div
              key={monthData.month}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-full rounded-md bg-blue-300"
                style={{
                  height: `${(chartHeight / topLabel) * monthData.total}px`,
                }}
              ></div>
              <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                {monthData.month.slice(5)}/{monthData.month.slice(2, 4)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Last 6 months</h3>
        </div>
      </div>
    </div>
  );
}
