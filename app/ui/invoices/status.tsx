import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-1 py-1 text-xs",
        {
          "bg-gray-100 text-gray-500": status === "pending",
          "bg-green-500 text-white": status === "paid",
        }
      )}
    >
      {status === "pending" ? (
        <>
          <ClockIcon className="w-4 text-gray-500" />
        </>
      ) : null}
      {status === "paid" ? (
        <>
          <CheckIcon className="w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}
