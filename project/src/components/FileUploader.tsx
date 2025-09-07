import React from "react";
import Papa, { ParseResult } from "papaparse";
import * as XLSX from "xlsx";

interface FileUploaderProps {
  onDataParsed: (data: Record<string, unknown>[], fileName: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataParsed }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith(".csv")) {
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<Record<string, unknown>>) => {
          if (!results.data || results.data.length === 0) {
            alert("⚠️ The CSV file is empty or invalid.");
            return;
          }
          console.log("✅ Parsed CSV:", results.data);
          onDataParsed(results.data, file.name);
        },
        error: (error) => {
          console.error("❌ CSV parsing error:", error);
          alert("⚠️ Failed to parse CSV file.");
        },
      });
    } else if (file.name.toLowerCase().endsWith(".json")) {
      reader.onload = (event) => {
        try {
          const rawText = event.target?.result as string;
          const parsed = JSON.parse(rawText);
          const data = Array.isArray(parsed) ? parsed : [parsed];

          if (!data || data.length === 0) {
            alert("⚠️ The JSON file is empty or invalid.");
            return;
          }

          console.log("✅ Parsed JSON:", data);
          onDataParsed(data, file.name);
        } catch (err) {
          console.error("❌ JSON parsing error:", err);
          alert("⚠️ Invalid JSON file!");
        }
      };
      reader.readAsText(file);
    } else if (
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.name.toLowerCase().endsWith(".xls")
    ) {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0]; // take first sheet
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
            worksheet
          );

          if (!jsonData || jsonData.length === 0) {
            alert("⚠️ The Excel file is empty or invalid.");
            return;
          }

          console.log("✅ Parsed Excel:", jsonData);
          onDataParsed(jsonData, file.name);
        } catch (err) {
          console.error("❌ Excel parsing error:", err);
          alert("⚠️ Failed to parse Excel file!");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("⚠️ Only CSV, JSON, or Excel files are supported.");
    }

    // 🔄 Reset input so same file can be uploaded again
    e.target.value = "";
  };

  return (
    <label className="cursor-pointer p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
      📂 Upload CSV/JSON/Excel
      <input
        type="file"
        accept=".csv,.json,.xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
    </label>
  );
};
