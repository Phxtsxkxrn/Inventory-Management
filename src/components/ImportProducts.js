import React, { useState } from "react";
import Papa from "papaparse"; // สำหรับไฟล์ CSV
import * as XLSX from "xlsx"; // สำหรับไฟล์ Excel
import "./ImportProducts.css";
import { FaCloudUploadAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { showToast } from "../utils/toast";

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
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select a CSV or Excel file before uploading.",
        confirmButtonText: "OK",
      });
      return;
    }

    // ✅ แสดงกล่องยืนยันก่อนอัปโหลด
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to upload this file?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, upload it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setError("");
        setUploadStatus("Uploading...");

        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (fileExtension === "csv") {
          processCSV(file);
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
          processExcel(file);
        } else {
          setError(
            "Unsupported file format. Please upload a CSV or Excel file."
          );
          setUploadStatus("");
          Swal.fire({
            icon: "error",
            title: "Invalid File Format",
            text: "Please upload a CSV or Excel file.",
            confirmButtonText: "OK",
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        onClose(); // ✅ ปิด popup ImportProducts ถ้ากด Cancel
      }
    });
  };

  const processCSV = (file) => {
    setUploadStatus("Processing file...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
          try {
            setUploadStatus("Importing products...");
            const parsedData = results.data.map((item) => {
              const normalPrice = parseCurrency(item.NormalPrice);
              const discount = parseFloat(item.Discount) || 0;
              const finalPrice = normalPrice - (normalPrice * discount) / 100;

              return {
                ...item,
                NormalPrice: normalPrice,
                Discount: discount,
                FinalPrice: finalPrice,
                Image: item.Image?.trim() || "",
              };
            });

            await onImport(parsedData);
            setUploadStatus("Import complete!");
            showToast.success(
              `${parsedData.length} products imported successfully`
            );
          } catch (error) {
            setError("Error importing products.");
            showToast.error("Failed to import products");
          }
        },
        error: function () {
          setError("Error reading the CSV file.");
          showToast.error("Error reading the CSV file");
        },
      });
    };
    reader.readAsText(file);
  };

  const processExcel = (file) => {
    setUploadStatus("Processing file...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const binaryData = event.target.result;
        const workbook = XLSX.read(binaryData, { type: "binary" });

        setUploadStatus("Importing products...");
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet).map((item) => {
          const normalPrice = parseCurrency(item.NormalPrice);
          const discount = parseFloat(item.Discount) || 0;
          const finalPrice = normalPrice - (normalPrice * discount) / 100;

          return {
            ...item,
            NormalPrice: normalPrice,
            Discount: discount,
            FinalPrice: finalPrice,
            Image: item.Image?.trim() || "",
          };
        });

        await onImport(parsedData);
        setUploadStatus("Import complete!");
        showToast.success(
          `${parsedData.length} products imported successfully`
        );
      } catch (error) {
        setError("Error importing products.");
        showToast.error("Failed to import products");
      }
    };
    reader.readAsBinaryString(file);
  };

  const parseCurrency = (value) => {
    // ตรวจสอบชนิดข้อมูล
    if (typeof value === "number") {
      return value; // ถ้าเป็นตัวเลข ให้คืนค่ากลับ
    }
    if (typeof value !== "string") {
      return 0; // ถ้าไม่ใช่ string ให้คืนค่าเป็น 0
    }

    // แปลง string เป็นตัวเลข
    const numberValue = parseFloat(
      value.replace(/[฿,]/g, "").replace(/[^0-9.]/g, "")
    );
    return isNaN(numberValue) ? 0 : numberValue;
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
            Drag & Drop or <span className="file-link">Choose file</span> to
            upload
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
            <p>
              {uploadStatus} {uploadProgress < 100 && `${uploadProgress}%`}
            </p>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <div className="button-group">
          <button onClick={handleUpload} className="modal-button upload">
            Upload
          </button>
          <button onClick={onClose} className="modal-button import-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportProducts;
