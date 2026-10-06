import { PhoneHeaderContent } from "@/frontend/components/phones/PhoneHeaderContent";

export default function PhonesLoading() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <PhoneHeaderContent as="h1" interactiveSearch={false} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-white p-4 space-y-4">
              <div className="aspect-square bg-paper rounded-xl" />
              <div className="h-4 w-1/3 bg-line rounded" />
              <div className="h-5 w-3/4 bg-line rounded" />
              <div className="h-6 w-1/2 bg-line rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
