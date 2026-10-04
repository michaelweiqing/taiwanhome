import type { Metadata } from "next"
import AdminImportClient from "./AdminImportClient"

export const metadata: Metadata = { title: "Đăng tin từ link | Admin 8386", robots: { index: false, follow: false } }

export default function AdminImportPage() {
  return <AdminImportClient />
}
