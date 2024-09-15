// app/page.js
"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Image from "next/image";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setExtractedText("");
    setJsonData(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract text");
      }

      setExtractedText(data.text);
      setJsonData(data.json);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!jsonData) return;

    const ws = XLSX.utils.json_to_sheet(jsonData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ExtractedData");
    XLSX.writeFile(wb, "extracted_data.xlsx");
  };

  return (
    <div className="min-h-screen bg-[#1a237e] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Image to Excel Converter
        </h1>
        <div className="bg-[#283593] shadow-lg rounded-lg p-6 mb-8">
          <div className="mb-6">
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium mb-2"
            >
              Upload an image
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-[#3949ab] file:text-white
                hover:file:bg-[#3f51b5]"
            />
          </div>
          {preview && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Image Preview:</h2>
              <div className="relative h-64 w-full">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="w-full bg-[#3949ab] hover:bg-[#3f51b5] text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 mb-4"
          >
            {isLoading ? "Processing..." : "Convert Image"}
          </button>
          {jsonData && (
            <button
              onClick={handleDownload}
              className="w-full bg-[#4caf50] hover:bg-[#45a049] text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Download Excel
            </button>
          )}
        </div>
        {error && (
          <div
            className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {extractedText && (
          <div className="mt-8 bg-[#283593] shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Extracted Text:</h2>
            <p className="whitespace-pre-wrap">{extractedText}</p>
          </div>
        )}
        {jsonData && (
          <div className="mt-8 bg-[#283593] shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">JSON Data:</h2>
            <pre className="bg-[#1a237e] p-4 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
