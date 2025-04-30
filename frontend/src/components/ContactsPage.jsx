import React, { useEffect, useState } from "react";
import Contact from "./Contact";
import axios from "axios";

function ContactsPage({ token }) {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 1. Add search term state

  useEffect(() => {
    fetchContacts();
  }, [token]);

  const fetchContacts = () => {
    axios
      .get("http://localhost:8080/contacts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setContacts(res.data))
      .catch((err) => {
        console.error(err);
        setError("Hiba történt a kontaktok betöltésekor.");
      });
  };

  const handleDelete = (id) => {
    const contactToDelete = contacts.find((c) => c.id === id);
    if (!window.confirm("Biztosan törölni szeretnéd ezt a kontaktot?")) return;

    axios
      .delete(`http://localhost:8080/contacts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        if (contactToDelete?.avatarURL) {
          localStorage.removeItem(contactToDelete.avatarURL);
        }

        setSuccessMessage("Sikeres törlés.");
        fetchContacts();
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch((err) => console.error("Delete error:", err));
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    const oldAvatar = editingContact.avatarURL;

    const formData = new FormData();
    formData.append("name", editingContact.name);
    formData.append("email", editingContact.email);
    formData.append("mobile", editingContact.mobile);
    formData.append("address", editingContact.address || "");

    axios
      .put(`http://localhost:8080/contacts/${editingContact.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        if (oldAvatar) localStorage.removeItem(oldAvatar);

        setSuccessMessage("Kontakt sikeresen frissítve.");
        setEditingContact(null);
        fetchContacts();
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch((err) => console.error("Update error:", err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingContact((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Filter the contacts based on searchTerm
  const filteredContacts = contacts.filter((contact) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(lowercasedSearchTerm) ||
      contact.mobile.toLowerCase().includes(lowercasedSearchTerm) ||
      contact.email.toLowerCase().includes(lowercasedSearchTerm)
    );
  });

  return (
    <div className="container mt-4">
      <h2>My Contacts</h2>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {editingContact && (
        <form onSubmit={handleUpdate} className="border p-3 mb-4">
          <h5>Editing  <span style={{color: 'red'}}>{editingContact.name}</span></h5>
          <div className="mb-2">
            <input
              type="text"
              className="form-control"
              name="name"
              value={editingContact.name}
              onChange={handleInputChange}
              placeholder="Name"
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              className="form-control"
              name="mobile"
              value={editingContact.mobile}
              onChange={handleInputChange}
              placeholder="Mobil"
            />
          </div>
          <div className="mb-2">
            <input
              type="email"
              className="form-control"
              name="email"
              value={editingContact.email}
              onChange={handleInputChange}
              placeholder="Email"
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              className="form-control"
              name="address"
              value={editingContact.address || ""}
              onChange={handleInputChange}
              placeholder="Address"
            />
          </div>
          <button type="submit" className="btn btn-success me-2">
            Save
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setEditingContact(null)}>
            Cancel
          </button>
        </form>
      )}

      {/* 3. Search input field */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, mobile, email ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Render filtered contacts */}
      <div className="row row-cols-1 row-cols-md-2 g-4 mt-3">
        {filteredContacts.map((contact) => (
          <div className="col" key={contact.id}>
            <Contact
              id={contact.id}
              name={contact.name}
              photo={`http://localhost:8080/${contact.avatarURL}`}
              mobile={contact.mobile}
              email={contact.email}
              address={contact.address || "No address provided"}
              onDelete={handleDelete}
              onEdit={() => setEditingContact(contact)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactsPage;
