import axios from "axios";

const API_URL =
  "https://sheetdb.io/api/v1/abc123";

async function getProperty(id) {
  const response = await axios.get(API_URL);

  const properties = response.data;

  return properties.find(
    (item) => item.id === id
  );
}

export default async function HouseDetail({
  params,
}) {

  const property = await getProperty(
    params.id
  );

  if (!property) {
    return <div>Không tìm thấy nhà</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">

      <img
        src={property.image}
        className="w-full rounded-3xl"
      />

      <h1 className="mt-10 text-5xl font-black text-red-600">
        {property.title_vi}
      </h1>

    </div>
  );
}