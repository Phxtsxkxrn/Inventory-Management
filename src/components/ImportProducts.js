import React, { useState } from "react";
import Papa from "papaparse"; // สำหรับไฟล์ CSV
import * as XLSX from "xlsx"; // สำหรับไฟล์ Excel
import { getProducts } from "../services/product.service"; // Add this import
import "./ImportProducts.css";
import { FaCloudUploadAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { showToast } from "../utils/toast";

const ImportProducts = ({ onImport, onClose, categories }) => {
  // เพิ่ม categories prop
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

  // เพิ่มฟังก์ชันตรวจสอบราคา
  const validatePrice = (price) => {
    let numericPrice;
    if (typeof price === "number") {
      numericPrice = price;
    } else if (typeof price === "string") {
      // ลบ ฿ และ , ออกก่อนแปลงเป็นตัวเลข
      const cleanPrice = price.replace(/[฿,]/g, "");
      if (!/^\d+(\.\d{0,2})?$/.test(cleanPrice)) {
        return { isValid: false, reason: "format" };
      }
      numericPrice = parseFloat(cleanPrice);
    } else {
      return { isValid: false, reason: "format" };
    }

    // ตรวจสอบค่าราคา
    if (numericPrice <= 0) {
      return { isValid: false, reason: "value" };
    }
    return { isValid: true };
  };

  const showPriceError = (rowNumbers, reason) => {
    const errorMessage =
      reason === "value"
        ? "Price must be greater than 0."
        : "Price must be a number.";

    Swal.fire({
      icon: "error",
      title: "Invalid Price",
      html: `Found invalid prices in the following rows:<br><strong>${rowNumbers.join(
        ", "
      )}</strong><br><br>${errorMessage}`,
      confirmButtonText: "OK",
    });
    setError("Invalid price detected");
    setUploadStatus("");
  };

  // แก้ไขฟังก์ชันตรวจสอบส่วนลด
  const validateDiscount = (discount) => {
    if (typeof discount === "number") {
      return discount >= 0 && discount <= 100;
    }
    if (typeof discount === "string") {
      // ลบ % ออกก่อนตรวจสอบ
      const cleanDiscount = discount.replace(/%/g, "");
      if (!/^\d+(\.\d{0,2})?$/.test(cleanDiscount)) {
        return false;
      }
      const value = parseFloat(cleanDiscount);
      // ตรวจสอบว่าส่วนลดต้องอยู่ระหว่าง 0-100
      return value >= 0 && value <= 100;
    }
    return false;
  };

  // แก้ไขข้อความแจ้งเตือนในส่วนของการตรวจสอบส่วนลด
  const showDiscountError = (rowNumbers) => {
    Swal.fire({
      icon: "error",
      title: "Invalid Discount Value",
      html: `Found invalid discounts in the following rows:<br><strong>${rowNumbers.join(
        ", "
      )}</strong><br><br>Discount must be a number between 0-100%.`,
      confirmButtonText: "OK",
    });
    setError("Invalid discount value detected");
    setUploadStatus("");
  };

  // เพิ่มฟังก์ชันตรวจสอบหมวดหมู่
  const validateCategories = (categoryValue, availableCategories) => {
    if (!categoryValue) {
      return {
        isValid: false,
        invalidList: ["Empty category"],
        message: "Category is required",
      };
    }

    // แยกหมวดหมู่กรณีที่มีหลายหมวดหมู่คั่นด้วยเครื่องหมาย , หรือ ;
    const categoryList = categoryValue.split(/[,;]/).map((cat) => cat.trim());

    // ตรวจสอบว่าทุกหมวดหมู่มีอยู่ในระบบ
    const invalidCategories = categoryList.filter(
      (cat) => cat && !availableCategories.includes(cat)
    );

    return {
      isValid: invalidCategories.length === 0,
      invalidList: invalidCategories,
      message:
        invalidCategories.length > 0
          ? `Categories not found in system: ${invalidCategories.join(", ")}`
          : "",
    };
  };

  const showCategoryError = (
    rowNumbers,
    invalidCategories,
    availableCategories
  ) => {
    Swal.fire({
      icon: "error",
      title: "Invalid Categories",
      html:
        `Found invalid categories in rows:<br><strong>${rowNumbers.join(
          ", "
        )}</strong><br><br>` +
        `Invalid categories:<br><strong>${invalidCategories.join(
          ", "
        )}</strong><br><br>` +
        `Available categories:<br>${availableCategories.join(", ")}`,
      confirmButtonText: "OK",
    });
    setError("Invalid categories detected");
    setUploadStatus("");
  };

  // เพิ่มการตรวจสอบ Status
  const validateStatus = (status) => {
    const validStatuses = ["active", "inactive"];
    if (!status || typeof status !== "string") {
      return { isValid: false, reason: "empty" };
    }
    const cleanStatus = status.trim().toLowerCase();
    return {
      isValid: validStatuses.includes(cleanStatus),
      reason: "invalid",
    };
  };

  const showStatusError = (rowNumbers, invalidStatuses) => {
    Swal.fire({
      icon: "error",
      title: "Invalid Status",
      html:
        `Found invalid status in rows:<br><strong>${rowNumbers.join(
          ", "
        )}</strong><br><br>` +
        `Invalid values:<br><strong>${invalidStatuses.join(
          ", "
        )}</strong><br><br>` +
        `Status must be either 'active' or 'inactive'`,
      confirmButtonText: "OK",
    });
    setError("Invalid status detected");
    setUploadStatus("");
  };

  const processCSV = (file) => {
    setUploadStatus("Processing file...");
    console.log("Start processing CSV file:", file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;

      // ตรวจสอบไฟล์เปล่า
      if (!csvData || csvData.trim() === "") {
        Swal.fire({
          icon: "error",
          title: "Empty File",
          text: "The file is empty. Please check your file and try again.",
          confirmButtonText: "OK",
        });
        setError("Empty file detected");
        setUploadStatus("");
        return;
      }

      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
          try {
            // เพิ่มการตรวจสอบ Status ก่อนการตรวจสอบอื่นๆ
            const invalidStatuses = results.data
              .map((item, index) => ({
                row: index + 2,
                status: item.Status,
                validation: validateStatus(item.Status),
              }))
              .filter((item) => !item.validation.isValid);

            if (invalidStatuses.length > 0) {
              const rowNumbers = invalidStatuses.map((item) => item.row);
              const uniqueInvalidStatuses = [
                ...new Set(
                  invalidStatuses.map((item) => item.status || "empty")
                ),
              ];
              showStatusError(rowNumbers, uniqueInvalidStatuses);
              return;
            }

            // ตรวจสอบหมวดหมู่ที่ไม่ถูกต้อง
            const categoriesValidation = results.data
              .map((item, index) => ({
                row: index + 2,
                validation: validateCategories(item.Categories, categories),
              }))
              .filter((item) => !item.validation.isValid);

            if (categoriesValidation.length > 0) {
              const rowNumbers = categoriesValidation.map((item) => item.row);
              const invalidCategories = [
                ...new Set(
                  categoriesValidation.flatMap(
                    (item) => item.validation.invalidList
                  )
                ),
              ];
              showCategoryError(rowNumbers, invalidCategories, categories);
              return;
            }

            // ตรวจสอบส่วนลด
            const invalidDiscounts = results.data
              .map((item, index) => ({
                row: index + 2,
                discount: item.Discount,
                value: parseFloat(item.Discount?.replace?.("%", "") || 0),
              }))
              .filter((item) => !validateDiscount(item.discount));

            if (invalidDiscounts.length > 0) {
              const rowNumbers = invalidDiscounts.map((item) => item.row);
              showDiscountError(rowNumbers);
              return;
            }

            // ตรวจสอบราคาที่ไม่ถูกต้อง
            const invalidPrices = results.data
              .map((item, index) => ({
                row: index + 2,
                price: item.NormalPrice,
                validation: validatePrice(item.NormalPrice),
              }))
              .filter((item) => !item.validation.isValid);

            if (invalidPrices.length > 0) {
              const rowNumbers = invalidPrices.map((item) => item.row);
              const reason = invalidPrices[0].validation.reason; // ใช้เหตุผลแรกที่พบ
              showPriceError(rowNumbers, reason);
              return;
            }

            // ตรวจสอบ SKU ที่เป็นค่าว่าง
            const emptySkus = results.data.filter(
              (item) => !item.SKU || item.SKU.trim() === ""
            );
            if (emptySkus.length > 0) {
              const rowNumbers = emptySkus.map((_, index) => index + 2); // +2 เพราะ row 1 คือ header
              Swal.fire({
                icon: "error",
                title: "Invalid Data",
                html: `Found empty SKUs in the following rows:<br><strong>${rowNumbers.join(
                  ", "
                )}</strong><br><br>SKU is required and cannot be empty.`,
                confirmButtonText: "OK",
              });
              setError("Empty SKUs detected");
              setUploadStatus("");
              return;
            }

            // กำหนด headers ที่อนุญาต
            const allowedHeaders = [
              "Brand",
              "SKU",
              "Name",
              "Categories",
              "Seller",
              "Image",
              "NormalPrice",
              "Discount",
              "Status",
            ];

            // ตรวจสอบ headers ที่เกินมา
            const extraHeaders = results.meta.fields.filter(
              (header) => !allowedHeaders.includes(header)
            );

            if (extraHeaders.length > 0) {
              Swal.fire({
                icon: "error",
                title: "Invalid File Format",
                html: `Found unexpected columns:<br><strong>${extraHeaders.join(
                  ", "
                )}</strong><br><br>Only the following columns are allowed:<br>${allowedHeaders.join(
                  ", "
                )}`,
                confirmButtonText: "OK",
              });
              setError(`Unexpected columns found: ${extraHeaders.join(", ")}`);
              setUploadStatus("");
              return;
            }

            // ตรวจสอบ required headers ที่ขาดไป
            const requiredHeaders = [
              "Brand",
              "SKU",
              "Name",
              "Categories",
              "Seller",
              "NormalPrice",
              "Discount",
              "Status",
            ];
            const missingHeaders = requiredHeaders.filter(
              (header) => !results.meta.fields.includes(header)
            );

            if (missingHeaders.length > 0) {
              Swal.fire({
                icon: "error",
                title: "Invalid File Format",
                html: `Missing required columns:<br><strong>${missingHeaders.join(
                  ", "
                )}</strong><br><br>Please check your file format and try again.`,
                confirmButtonText: "OK",
              });
              setError(
                `Missing required columns: ${missingHeaders.join(", ")}`
              );
              setUploadStatus("");
              return;
            }

            console.log("Parsed CSV headers:", results.meta.fields);
            console.log("First row of data:", results.data[0]);

            setUploadStatus("Checking for duplicates...");
            const parsedData = results.data.map((item) => {
              const normalPrice = parseCurrency(item.NormalPrice);
              const discount = parseFloat(item.Discount) || 0;
              const finalPrice = normalPrice - (normalPrice * discount) / 100;

              const processedItem = {
                ...item,
                NormalPrice: normalPrice,
                Discount: discount,
                FinalPrice: finalPrice,
                Image: item.Image?.trim() || "",
              };
              console.log("Processed item:", processedItem);
              return processedItem;
            });

            // ตรวจสอบ SKU ซ้ำ
            const existingProducts = await getProducts();
            console.log("Existing products count:", existingProducts.length);

            const duplicates = parsedData.filter((item) =>
              existingProducts.some(
                (existingItem) => existingItem.SKU === item.SKU
              )
            );
            console.log(
              "Found duplicate SKUs:",
              duplicates.map((d) => d.SKU)
            );

            if (duplicates.length > 0) {
              const duplicateSkus = duplicates
                .map((item) => item.SKU)
                .join(", ");
              const result = await Swal.fire({
                title: "Duplicate SKUs Found",
                html: `The following SKUs already exist:<br><br><strong>${duplicateSkus}</strong>`,
                icon: "warning",
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: "Update Existing",
                denyButtonText: "Cancel Import",
                cancelButtonText: "Skip Duplicates",
                confirmButtonColor: "#3085d6",
                denyButtonColor: "#d33",
              });

              if (result.isConfirmed) {
                // แยกข้อมูลระหว่างอัพเดทและสร้างใหม่
                const toUpdate = [];
                const toCreate = [];

                parsedData.forEach((item) => {
                  const existingProduct = existingProducts.find(
                    (p) => p.SKU === item.SKU
                  );
                  if (existingProduct) {
                    // เก็บข้อมูลที่จะอัพเดท
                    toUpdate.push({
                      ...item,
                      id: existingProduct.id,
                      Status: item.Status || existingProduct.Status, // เก็บ Status เดิมถ้าไม่ได้ระบุมา
                    });
                  } else {
                    // เก็บข้อมูลที่จะสร้างใหม่
                    toCreate.push(item);
                  }
                });

                // ส่งข้อมูลแยกระหว่างอัพเดทและสร้างใหม่
                await onImport({ toUpdate, toCreate });
                setUploadStatus("Import complete!");
                showToast.success(
                  `Updated ${toUpdate.length} and created ${toCreate.length} products`
                );
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                // ข้ามสินค้าที่ซ้ำ นำเข้าเฉพาะสินค้าใหม่
                const newProducts = parsedData.filter(
                  (item) =>
                    !existingProducts.some(
                      (existingItem) => existingItem.SKU === item.SKU
                    )
                );

                if (newProducts.length > 0) {
                  // ส่งเฉพาะข้อมูลที่จะสร้างใหม่
                  await onImport({
                    toCreate: newProducts,
                    toUpdate: [],
                  });
                  setUploadStatus("Import complete!");
                  showToast.success(
                    `${newProducts.length} new products imported`
                  );
                } else {
                  setUploadStatus("No new products to import");
                  showToast.info("No new products to import");
                }
              } else {
                // ถ้ากด deny (Cancel Import) จะไม่ทำอะไร
                showToast.info("Import cancelled");
              }
            } else {
              // ไม่มีสินค้าซ้ำ นำเข้าทั้งหมด
              console.log("Preparing to import all products:", parsedData);
              try {
                console.log("Sending data to Firebase...");
                // ส่งข้อมูลโดยตรงไม่ต้องห่อด้วย object
                await onImport(parsedData);
                console.log("Data sent successfully");
                setUploadStatus("Import complete!");
                showToast.success(
                  `${parsedData.length} products imported successfully`
                );
              } catch (error) {
                console.error("Firebase import error:", error);
                setError("Error importing products: " + error.message);
                showToast.error("Failed to import products: " + error.message);
              }
            }
          } catch (error) {
            setError("Error importing products.");
            showToast.error("Failed to import products");
          }
        },
      });
    };
    reader.readAsText(file);
  };

  const processExcel = (file) => {
    setUploadStatus("Processing file...");
    console.log("Start processing Excel file:", file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const binaryData = event.target.result;
        const workbook = XLSX.read(binaryData, { type: "binary" });

        // ตรวจสอบไฟล์เปล่า
        if (workbook.SheetNames.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Empty File",
            text: "The Excel file has no sheets. Please check your file and try again.",
            confirmButtonText: "OK",
          });
          setError("Empty Excel file detected");
          setUploadStatus("");
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // ตรวจสอบข้อมูลในชีท
        const data = XLSX.utils.sheet_to_json(worksheet);
        if (data.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Empty Sheet",
            text: "The Excel sheet contains no data. Please check your file and try again.",
            confirmButtonText: "OK",
          });
          setError("Empty sheet detected");
          setUploadStatus("");
          return;
        }

        // Get headers from the first row
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];

        // กำหนด headers ที่อนุญาต
        const allowedHeaders = [
          "Brand",
          "SKU",
          "Name",
          "Categories",
          "Seller",
          "Image",
          "NormalPrice",
          "Discount",
          "Status",
        ];

        // ตรวจสอบ headers ที่เกินมา
        const extraHeaders = headers.filter(
          (header) => !allowedHeaders.includes(header)
        );

        if (extraHeaders.length > 0) {
          Swal.fire({
            icon: "error",
            title: "Invalid File Format",
            html: `Found unexpected columns:<br><strong>${extraHeaders.join(
              ", "
            )}</strong><br><br>Only the following columns are allowed:<br>${allowedHeaders.join(
              ", "
            )}`,
            confirmButtonText: "OK",
          });
          setError(`Unexpected columns found: ${extraHeaders.join(", ")}`);
          setUploadStatus("");
          return;
        }

        // ตรวจสอบ required headers
        const requiredHeaders = [
          "Brand",
          "SKU",
          "Name",
          "Categories",
          "Seller",
          "NormalPrice",
          "Discount",
          "Status",
        ];
        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          Swal.fire({
            icon: "error",
            title: "Invalid File Format",
            html: `Missing required columns:<br><strong>${missingHeaders.join(
              ", "
            )}</strong><br><br>Please check your file format and try again.`,
            confirmButtonText: "OK",
          });
          setError(`Missing required columns: ${missingHeaders.join(", ")}`);
          setUploadStatus("");
          return;
        }

        console.log("Excel headers:", headers);
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        console.log("Raw Excel data first row:", rawData[0]);

        // เพิ่มการตรวจสอบ Status
        const invalidStatuses = rawData
          .map((item, index) => ({
            row: index + 2,
            status: item.Status,
            validation: validateStatus(item.Status),
          }))
          .filter((item) => !item.validation.isValid);

        if (invalidStatuses.length > 0) {
          const rowNumbers = invalidStatuses.map((item) => item.row);
          const uniqueInvalidStatuses = [
            ...new Set(invalidStatuses.map((item) => item.status || "empty")),
          ];
          showStatusError(rowNumbers, uniqueInvalidStatuses);
          return;
        }

        // ตรวจสอบหมวดหมู่ที่ไม่ถูกต้อง
        const categoriesValidation = rawData
          .map((item, index) => ({
            row: index + 2,
            validation: validateCategories(item.Categories, categories),
            categories: item.Categories,
          }))
          .filter((item) => !item.validation.isValid);

        if (categoriesValidation.length > 0) {
          const rowNumbers = categoriesValidation.map((item) => item.row);
          const invalidCategories = [
            ...new Set(
              categoriesValidation.flatMap(
                (item) => item.validation.invalidList
              )
            ),
          ];
          showCategoryError(rowNumbers, invalidCategories, categories);
          return;
        }

        // ตรวจสอบส่วนลด
        const invalidDiscounts = rawData
          .map((item, index) => ({
            row: index + 2,
            discount: item.Discount,
            value: parseFloat(String(item.Discount).replace("%", "") || 0),
          }))
          .filter((item) => !validateDiscount(item.discount));

        if (invalidDiscounts.length > 0) {
          const rowNumbers = invalidDiscounts.map((item) => item.row);
          showDiscountError(rowNumbers);
          return;
        }

        // ตรวจสอบราคาที่ไม่ถูกต้อง
        const invalidPrices = rawData
          .map((item, index) => ({
            row: index + 2,
            price: item.NormalPrice,
            validation: validatePrice(item.NormalPrice),
          }))
          .filter((item) => !item.validation.isValid);

        if (invalidPrices.length > 0) {
          const rowNumbers = invalidPrices.map((item) => item.row);
          const reason = invalidPrices[0].validation.reason;
          showPriceError(rowNumbers, reason);
          return;
        }

        // ตรวจสอบ SKU ที่เป็นค่าว่าง
        const emptySkus = rawData.filter(
          (item) => !item.SKU || String(item.SKU).trim() === ""
        );
        if (emptySkus.length > 0) {
          // หา row numbers (เพิ่ม 2 เพราะ row 1 คือ header และ Excel เริ่มนับจาก 1)
          const rowNumbers = emptySkus.map((_, index) => {
            const idx = rawData.indexOf(emptySkus[index]);
            return idx + 2;
          });

          Swal.fire({
            icon: "error",
            title: "Invalid Data",
            html: `Found empty SKUs in the following rows:<br><strong>${rowNumbers.join(
              ", "
            )}</strong><br><br>SKU is required and cannot be empty.`,
            confirmButtonText: "OK",
          });
          setError("Empty SKUs detected");
          setUploadStatus("");
          return;
        }

        const parsedData = rawData.map((item) => {
          const normalPrice = parseCurrency(item.NormalPrice);
          const discount = parseFloat(item.Discount) || 0;
          const finalPrice = normalPrice - (normalPrice * discount) / 100;

          const processedItem = {
            ...item,
            NormalPrice: normalPrice,
            Discount: discount,
            FinalPrice: finalPrice,
            Image: item.Image?.trim() || "",
          };
          console.log("Processed Excel item:", processedItem);
          return processedItem;
        });

        // ตรวจสอบ SKU ซ้ำเหมือนกับ CSV
        const existingProducts = await getProducts();
        const duplicates = parsedData.filter((item) =>
          existingProducts.some((existingItem) => existingItem.SKU === item.SKU)
        );

        // ใช้ logic เดียวกับ CSV
        if (duplicates.length > 0) {
          const duplicateSkus = duplicates.map((item) => item.SKU).join(", ");
          const result = await Swal.fire({
            title: "Duplicate SKUs Found",
            html: `The following SKUs already exist:<br><br><strong>${duplicateSkus}</strong>`,
            icon: "warning",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Update Existing",
            denyButtonText: "Cancel Import",
            cancelButtonText: "Skip Duplicates",
            confirmButtonColor: "#3085d6",
            denyButtonColor: "#d33",
          });

          if (result.isConfirmed) {
            // แยกข้อมูลระหว่างอัพเดทและสร้างใหม่
            const toUpdate = [];
            const toCreate = [];

            parsedData.forEach((item) => {
              const existingProduct = existingProducts.find(
                (p) => p.SKU === item.SKU
              );
              if (existingProduct) {
                // เก็บข้อมูลที่จะอัพเดท
                toUpdate.push({
                  ...item,
                  id: existingProduct.id,
                  Status: item.Status || existingProduct.Status, // เก็บ Status เดิมถ้าไม่ได้ระบุมา
                });
              } else {
                // เก็บข้อมูลที่จะสร้างใหม่
                toCreate.push(item);
              }
            });

            // ส่งข้อมูลแยกระหว่างอัพเดทและสร้างใหม่
            await onImport({ toUpdate, toCreate });
            setUploadStatus("Import complete!");
            showToast.success(
              `Updated ${toUpdate.length} and created ${toCreate.length} products`
            );
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // ข้ามสินค้าที่ซ้ำ นำเข้าเฉพาะสินค้าใหม่
            const newProducts = parsedData.filter(
              (item) =>
                !existingProducts.some(
                  (existingItem) => existingItem.SKU === item.SKU
                )
            );

            if (newProducts.length > 0) {
              // ส่งเฉพาะข้อมูลที่จะสร้างใหม่
              await onImport({
                toCreate: newProducts,
                toUpdate: [],
              });
              setUploadStatus("Import complete!");
              showToast.success(`${newProducts.length} new products imported`);
            } else {
              setUploadStatus("No new products to import");
              showToast.info("No new products to import");
            }
          }
          // ถ้ากด deny (Cancel Import) จะไม่ทำอะไร
        } else {
          await onImport({ toCreate: parsedData });
          setUploadStatus("Import complete!");
          showToast.success(
            `${parsedData.length} products imported successfully`
          );
        }
      } catch (error) {
        setError("Error importing products.");
        showToast.error("Failed to import products");
      }
    };
    reader.readAsBinaryString(file);
  };

  const parseCurrency = (value) => {
    console.log("Parsing currency value:", value, "type:", typeof value);

    if (typeof value === "number") {
      console.log("Value is already a number:", value);
      return value;
    }
    if (typeof value !== "string") {
      console.log("Invalid value type, returning 0");
      return 0;
    }

    const cleaned = value.replace(/[฿,]/g, "").replace(/[^0-9.]/g, "");
    console.log("Cleaned currency string:", cleaned);

    const numberValue = parseFloat(cleaned);
    console.log("Final parsed value:", numberValue);

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
