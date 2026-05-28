export async function getProperties() {

  const res = await fetch(
    "https://sheetdb.io/api/v1/qv0poefhc2lak"
  );

  return res.json();
}