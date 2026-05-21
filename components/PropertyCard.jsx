import Link from "next/link";
export default function PropertyCard({ property }) {
  return (
    <div className="rounded-3xl bg-white shadow-lg overflow-hidden">
      <img
        src={property.image}
        className="w-full h-64 object-cover"
      />

      <div className="p-5">
        <h3 className="text-2xl font-bold text-red-600">
          {property.title_vi}
        </h3>

        <p className="text-gray-500 mt-2">
          {property.title_zh}
        </p>

        <div className="mt-4 text-3xl font-black text-yellow-500">
          {property.price}
        </div>

        <p className="mt-3 text-gray-600">
          📍 {property.city}
        </p>

        <Link
  href={`/houses/${property.id}`}
  className="mt-5 block w-full bg-red-600 text-white py-3 rounded-2xl font-bold text-center"
>
  Xem chi tiết 詳細資訊
</Link>
      </div>
    </div>
  );
}