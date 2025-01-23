import React, { useState } from "react";

const ProductForm = ({ onSubmit, initialData = {} }) => {
  const [form, setForm] = useState({
    Image: initialData.Image || "",
    Brand: initialData.Brand || "",
    SKU: initialData.SKU || "",
    Name: initialData.Name || "",
    Category: initialData.Category || "",
    Seller: initialData.Seller || "",
    NormalPrice: initialData.NormalPrice || 0,
    MarkDown: initialData.MarkDown || 0,
    FinalPrice: initialData.FinalPrice || 0,
    Status: initialData.Status || "active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="Image"
        placeholder="Image URL"
        value={form.Image}
        onChange={handleChange}
      />
      <input
        type="text"
        name="Brand"
        placeholder="Brand"
        value={form.Brand}
        onChange={handleChange}
      />
      <input
        type="text"
        name="SKU"
        placeholder="SKU"
        value={form.SKU}
        onChange={handleChange}
      />
      <input
        type="text"
        name="Name"
        placeholder="Name"
        value={form.Name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="Category"
        placeholder="Category"
        value={form.Category}
        onChange={handleChange}
      />
      <input
        type="text"
        name="Seller"
        placeholder="Seller"
        value={form.Seller}
        onChange={handleChange}
      />
      <input
        type="number"
        name="NormalPrice"
        placeholder="Normal Price"
        value={form.NormalPrice}
        onChange={handleChange}
      />
      <input
        type="number"
        name="MarkDown"
        placeholder="Mark Down (%)"
        value={form.MarkDown}
        onChange={handleChange}
      />
      <input
        type="number"
        name="FinalPrice"
        placeholder="Final Price"
        value={form.FinalPrice}
        onChange={handleChange}
      />
      <select name="Status" value={form.Status} onChange={handleChange}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button type="submit">Save</button>
    </form>
  );
};

export default ProductForm;
