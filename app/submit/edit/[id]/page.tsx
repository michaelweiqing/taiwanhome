import SubmitForm from "../../SubmitForm"

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <SubmitForm editId={id} />
    </div>
  )
}
