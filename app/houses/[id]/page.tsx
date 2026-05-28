import { getProperties, Home } from "@/services/api";
import Link from "next/link";

type Props = {
  params: {
    id: string;
  };
};

export default async function HouseDetailPage({ params }: Props) {
  const homes = await getProperties();
  const home = homes.find((h) => h.id === params.id);

  if (!home) {
    return (
      <div className="p-20 text-center text-xl">
        Không tìm thấy nhà 🏠
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <Link href="/" className="mb-10 inline-block font-bold text-red-600">
        ← Quay lại
      </Link>

      <img
        src={home.image}
        alt={home.title_vi}
        className="mb-10 h-[500px] w-full rounded-3xl object-cover"
      />

      <h1 className="mb-4 text-5xl font-black text-red-600">
        {home.title_vi}
      </h1>

      <p className="mb-6 text-xl text-gray-500">
        {home.title_zh}
      </p>

      <p className="mb-6 text-3xl font-bold text-red-600">
        {home.price}
      </p>

      <p className="mb-10 text-lg">📍 {home.city}</p>

      <div className="grid grid-cols-3 gap-6 text-center">
        <div className="rounded-xl bg-yellow-50 p-6">
          <p className="text-3xl font-black">{home.bedrooms}</p>
          <p>Bedrooms</p>
        </div>

        <div className="rounded-xl bg-yellow-50 p-6">
          <p className="text-3xl font-black">{home.bathrooms}</p>
          <p>Bathrooms</p>
        </div>

        <div className="rounded-xl bg-yellow-50 p-6">
          <p className="text-3xl font-black">{home.area}</p>
          <p>Area</p>
        </div>
      </div>
    </div>
  );
}