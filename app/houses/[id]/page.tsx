import axios from 'axios';

const API_URL = 'https://sheetdb.io/api/v1/abc123';

async function getProperty(id: string) {
  const response = await axios.get(API_URL);
  const properties = response.data;

  return properties.find((item: any) => item.id === id);
}

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const property = await getProperty(params.id);

  return (
    <div>
      <h1>{property?.title}</h1>
      <p>{property?.description}</p>
    </div>
  );
}