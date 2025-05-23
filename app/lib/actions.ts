"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const FormSchema = z.object({
  // Zod Schema
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  // Field types
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// CREATE INVOICE
export async function createInvoice(prevState: State, formData: FormData) {
  // Zod Validation
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return error
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data insertion in DB
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  // Insert data in DB
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Database Error",
    };
  }

  // Revalidate the cache for the invoices page and redirect the user
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

// UPDATE INVOICE
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  // Zod Validation
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If forms validation failes, return error
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  // Prepare data insertions in DB
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  // Insert data in DB
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Database Error",
    };
  }

  // Revalidate the cache for the invoices page and redirect the user
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

// DELETE INVOICE
export async function deleteInvoice(id: string) {
  // Remove data in DB
  await sql`DELETE FROM invoices WHERE id = ${id}`;

  // Revalidate the cache for the invoices page
  revalidatePath("/dashboard/invoices");
}

// AUTHENTICATION
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
