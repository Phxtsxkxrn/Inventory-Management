import React, { useState } from "react";
import Papa from "papaparse"; // สำหรับไฟล์ CSV
import * as XLSX from "xlsx"; // สำหรับไฟล์ Excel
import "./ImportProducts.css";
import { FaCloudUploadAlt } from "react-icons/fa";

const ImportProducts = ({ onImport, onClose }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(""); // สถานะการอัปโหลด
  const [isDragging, setIsDragging] = useState(false); // สถานะการลากไฟล์

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setUploadProgress(0);
    setUploadStatus("Processing...");

    // Mock progress bar
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setUploadStatus("File Ready");
          return 100;
        }
        return prevProgress + 20;
      });
    }, 300);
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setError("");
    setUploadStatus("Uploading...");

    const fileExtension = file.name.split(".").pop().toLowerCase();

    // แยกการประมวลผลตามประเภทไฟล์
    if (fileExtension === "csv") {
      processCSV(file);
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      processExcel(file);
    } else {
      setError("Unsupported file format. Please upload a CSV or Excel file.");
      setUploadStatus("");
    }
  };

  const processCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const parsedData = results.data;
          onImport(parsedData);
          setUploadStatus("Upload Complete");
        },
        error: function () {
          setError("Error reading the CSV file.");
        },
      });
    };
    reader.readAsText(file);
  };

  const processExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryData = event.target.result;
      const workbook = XLSX.read(binaryData, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet);
      onImport(parsedData);
      setUploadStatus("Upload Complete");
    };
    reader.readAsBinaryString(file);
  };

  // จัดการการลากไฟล์เข้า
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Import Products</h3>
        <div
          className={`upload-area ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.querySelector("input[type='file']").click()}
        >
          <FaCloudUploadAlt size={50} color="#007bff" />
          <p>
            Drag & Drop or <span className="file-link">Choose file</span> to upload
          </p>
          <small>CSV or Excel Files</small>
        </div>
        <input
          type="file"
          accept=".csv, .xls, .xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {file && (
          <div className="upload-status">
            <p>
              <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </p>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>{uploadStatus} {uploadProgress < 100 && `${uploadProgress}%`}</p>
          </div>
        )}
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
