import type { Metadata } from "next"
import ManageListingsClient from "./ManageListingsClient"

export const metadata: Metadata = { title: "Quản lý tin đăng | Admin 8386", robots: { index: false, follow: false } }

export default function ManageListingsPage() {
  return <ManageListingsClient />
}
