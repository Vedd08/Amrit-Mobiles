import { prisma } from "@/backend/lib/prisma";
import { getAdminSession } from "@/backend/lib/auth";
import { priceListRows } from "@/backend/lib/price-list";
import { toCsv } from "@/backend/lib/spreadsheet";
import { istDayKey } from "@/admin/lib/format";

/** The whole catalogue as a price list (CSV, opens in Excel). The admin layout doesn't guard route handlers, so this checks itself. */
export async function GET() {
  if (!(await getAdminSession())) {
    return new Response("Sign in to the admin panel first.", { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: [{ brand: "asc" }, { name: "asc" }],
    select: { slug: true, name: true, brand: true, price: true, mrp: true, stock: true, isActive: true, category: { select: { name: true } } },
  });

  return new Response(toCsv(priceListRows(products)), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amrit-price-list-${istDayKey(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
