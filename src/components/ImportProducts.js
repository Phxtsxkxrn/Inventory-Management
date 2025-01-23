import React, { useState } from "react";
import Papa from "papaparse"; // สำหรับไฟล์ CSV
import * as XLSX from "xlsx"; // สำหรับไฟล์ Excel
import "./ImportProducts.css";

const ImportProducts = ({ onImport, onClose }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();

    // แยกการประมวลผลตามชนิดไฟล์
    if (fileExtension === "csv") {
      processCSV(file);
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      processExcel(file);
    } else {
      setError("Unsupported file format. Please upload a CSV or Excel file.");
    }
  };

  // ประมวลผลไฟล์ CSV
  const processCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const parsedData = results.data;
          onImport(parsedData); // ส่งข้อมูลไปยัง Parent
        },
        error: function () {
          setError("Error reading the CSV file.");
        },
      });
    };
    reader.readAsText(file);
  };

  // ประมวลผลไฟล์ Excel
  const processExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryData = event.target.result;
      const workbook = XLSX.read(binaryData, { type: "binary" });

      // อ่านเฉพาะชีตแรก
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet);
      onImport(parsedData); // ส่งข้อมูลไปยัง Parent
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Import Products</h3>
        <input type="file" accept=".csv, .xls, .xlsx" onChange={handleFileChange} />
        {error && <p className="error">{error}</p>}
        <div className="button-group">
          <button onClick={handleUpload} className="modal-button upload">
            Upload
          </button>
          <button onClick={onClose} className="modal-button cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportProducts;
