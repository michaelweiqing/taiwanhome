import axios from "axios";

const API_URL =
  "https://sheetdb.io/api/v1/qv0poefhc2lak";

export const getProperties = async () => {
  const response = await axios.get(API_URL);

  return response.data;
};