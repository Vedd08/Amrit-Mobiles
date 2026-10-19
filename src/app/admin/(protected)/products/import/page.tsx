import { PageHeader, btn } from "@/admin/components/ui";
import { DownloadIcon } from "@/admin/components/icons";
import { PriceListImport } from "./PriceListImport";

export default function PriceListImportPage() {
  return (
    <div>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title="Update prices from Excel"
        description="Change prices, MRP, stock and visibility for many products at once."
      />

      <ol className="mb-6 grid gap-3 md:grid-cols-3">
        <li className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-lime-ink">Step 1</p>
          <p className="mt-1 font-bold text-ink">Download the price list</p>
          <p className="mt-1 text-sm text-ink-3">Every product, with today&apos;s price and stock.</p>
          {/* A plain link: the route sends a file download. */}
          <a href="/admin/products/export" className={`${btn.secondary} mt-4`}>
            <DownloadIcon className="h-4 w-4" />
            Download (.csv)
          </a>
        </li>
        <li className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-lime-ink">Step 2</p>
          <p className="mt-1 font-bold text-ink">Edit it in Excel</p>
          <p className="mt-1 text-sm text-ink-3">
            Change <b className="text-ink-2">Price</b>, <b className="text-ink-2">MRP</b>, <b className="text-ink-2">Stock</b> or{" "}
            <b className="text-ink-2">Visible</b> (Yes/No). Leave <b className="text-ink-2">Product ID</b> as it is. You can delete
            rows you aren&apos;t changing.
          </p>
        </li>
        <li className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-lime-ink">Step 3</p>
          <p className="mt-1 font-bold text-ink">Upload and check</p>
          <p className="mt-1 text-sm text-ink-3">
            Save as .xlsx or .csv and upload it below. You&apos;ll see every change before anything is saved.
          </p>
        </li>
      </ol>

      <PriceListImport />
    </div>
  );
}
