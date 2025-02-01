import * as XLSX from "xlsx";

export const exportProducts = (products, selectedProducts, type) => {
  if (selectedProducts.length === 0) {
    alert("Please select products to export.");
    return;
  }

  // กรองสินค้าเฉพาะที่เลือก
  const selectedData = products
    .filter((product) => selectedProducts.includes(product.id))
    .map((product) => ({
      Brand: product.Brand || "N/A",
      SKU: product.SKU || "N/A",
      Name: product.Name || "N/A",
      Categories: product.Categories || "N/A",
      Seller: product.Seller || "N/A",
      Image: product.Image || "N/A",
      NormalPrice: `฿${new Intl.NumberFormat("th-TH", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(product.NormalPrice)}`,
      Discount: product.AppliedPromotion
        ? `${product.AppliedPromotion.discount}% (Promo)`
        : product.Discount
        ? `${product.Discount}%`
        : "N/A",
      FinalPrice: `฿${new Intl.NumberFormat("th-TH", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(product.FinalPrice)}`,
      Status: product.Status || "N/A",
      CreatedAt: product.CreatedAt
        ? new Date(product.CreatedAt).toLocaleString()
        : "N/A",
      LastUpdate: product.LastUpdate
        ? new Date(product.LastUpdate).toLocaleString()
        : "N/A",
    }));

  if (type === "csv" || type === "excel") {
    // Export CSV or Excel
    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Products");

    if (type === "csv") {
      XLSX.writeFile(workbook, "selected_products.csv", { bookType: "csv" });
    } else if (type === "excel") {
      XLSX.writeFile(workbook, "selected_products.xlsx", {
        bookType: "xlsx",
      });
    }
  } else if (type === "print") {
    // แสดงข้อมูลในรูปแบบที่พิมพ์ได้
    const printableData = selectedData;

    const newWindow = window.open("", "_blank");
    const printContent = `
      <html>
        <head>
          <title>Print Selected Products</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            img { max-width: 50px; height: auto; object-fit: cover; }
          </style>
        </head>
        <body>
          <h2>Selected Products</h2>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>SKU</th>
                <th>Brand</th>
                <th>Name</th>
                <th>Categories</th>
                <th>Seller</th>
                <th>Normal Price</th>
                <th>Discount (%)</th>
                <th>Final Price</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              ${printableData
                .map(
                  (row) => `
                  <tr>
                    <td>
                      ${
                        row.Image !== "No Image"
                          ? `<img src="${row.Image}" alt="${row.Name}" />`
                          : "No Image"
                      }
                    </td>
                    <td>${row.SKU}</td>
                    <td>${row.Brand}</td>
                    <td>${row.Name}</td>
                    <td>${row.Categories}</td>
                    <td>${row.Seller}</td>
                    <td>${row.NormalPrice}</td>
                    <td>${row.Discount}</td>
                    <td>${row.FinalPrice}</td>
                    <td>${row.Status}</td>
                    <td>${row.CreatedAt}</td>
                    <td>${row.LastUpdate}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
  }
};
