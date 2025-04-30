import React, { useState } from "react";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;


function Form({ token }) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    photo: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const saveCB = async (formData) => {
    try {
      await axios.post(apiUrl+"/contacts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });
      setSuccessMessage("✅ Contact saved successfully!");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("❌ Error while saving contact: " + (error.response?.data?.error || error.message));
      setSuccessMessage("");
    }
  };

  function handleChange(event) {
    const { id, value, files } = event.target;

    if (id === "photo") {
      setFormData((prev) => ({
        ...prev,
        [id]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name || !formData.mobile || !formData.email) {
      setErrorMessage("❗ Please fill in every fields.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("mobile", formData.mobile);
    data.append("email", formData.email);
    data.append("address", formData.address);
    if (formData.photo) {
      data.append("avatar", formData.photo);
    }

    saveCB(data);

    setFormData({
      name: "",
      mobile: "",
      email: "",
      address: "",
      photo: "",
    });
  }

  return (
    <form className="p-4 border rounded shadow-sm mb-4 bg-light">
      <div className="mb-3">
        <input
          type="text"
          id="name"
          maxLength={50}
          placeholder="Name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          id="mobile"
          maxLength={50}
          placeholder="Mobile Number"
          className="form-control"
          value={formData.mobile}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <input
          type="email"
          id="email"
          maxLength={50}
          placeholder="Email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          id="address"
          maxLength={200}
          placeholder="Address"
          className="form-control"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
    
      <div className="mb-3">
        <p>Avatar (optional, max 2 MB)</p>
        <input
          type="file"
          accept=".jpg, .png, .jpeg, .bmp, .tif, .tiff"
          id="photo"
          className="form-control"
          onChange={handleChange}
        />
      </div>

      <button type="submit" onClick={handleSubmit} className="btn btn-primary">
        Save Contact
      </button>

      {/* Megerősítés vagy hibaüzenet */}
      {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
    </form>
  );
}

export default Form;
