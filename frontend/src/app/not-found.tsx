import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold text-gray-900">Page not found</h2>
      <Link
        href="/inbox"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Go to inbox
      </Link>
    </div>
  );
}
