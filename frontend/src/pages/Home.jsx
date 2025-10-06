import { useState } from "react";
import API from "../api/axios";

export default function Home() {
  const [response, setResponse] = useState(null);

  const testApi = async () => {
    try {
      const res = await API.get("/ping");
      setResponse(res.data.message);
    } catch (error) {
      setResponse("Error: " + error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Home Page</h1>
      <button
        onClick={testApi}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test API
      </button>

      {response && <p className="mt-4">Response: {response}</p>}
    </div>
  );
}
