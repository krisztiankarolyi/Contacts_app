import React, { useEffect, useState } from "react";
import Contact from "./Contact";
import axios from "axios";

function ContactsPage({ token }) {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 1. Add search term state
  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    fetchContacts();
  }, [token]);

  const fetchContacts = () => {
    axios
      .get(apiUrl+"/contacts", {
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
      .delete(`${apiUrl}/contacts/${id}`, {
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
      .put(apiUrl+`/contacts/${editingContact.id}`, formData, {
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


  const downloadJson = async (id) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
  
      const photoUrl = `${apiUrl}/${contact.avatarurl.replace(/\\/g, "/")}`;
      contact.avatarurl = photoUrl;
      const jsonStr = JSON.stringify(contact, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${contact.name.replace(/\s+/g, "_")}.json`;
      link.click();
  };

  const downloadVcard = async (id) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
  
    let photoBase64 = '';
    let photoMimeType = '';
  
    if (contact.avatarurl) {
      const photoUrl = `${apiUrl}/${contact.avatarurl.replace(/\\/g, '/')}`;
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      photoMimeType = blob.type.split('/')[1].toUpperCase();
  
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
  
      photoBase64 = base64;
    }
  
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.name}`,
      `TEL;TYPE=CELL:${contact.mobile}`,
      `EMAIL:${contact.email}`,
      `ADR:${contact.address || ''}`,
    ];
  
    if (photoBase64) {
      const photoLine = `PHOTO;ENCODING=b;TYPE=${photoMimeType}:${photoBase64}`;
      lines.push(...foldLine(photoLine).split('\r\n'));
    }
  
    lines.push('END:VCARD');
  
    const vcard = lines.join('\r\n');
  
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${contact.name.replace(/\s+/g, '_')}.vcf`;
    link.click();
  };

  function foldLine(line) {
    const maxLength = 75;
    if (line.length <= maxLength) return line;
  
    let result = '';
    while (line.length > maxLength) {
      result += line.slice(0, maxLength) + '\r\n ';
      line = line.slice(maxLength);
    }
    result += line;
    return result;
  }


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
      <div className="mb-4 fixed">
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
              photo={`${apiUrl}/${contact.avatarurl}`}
              mobile={contact.mobile}
              email={contact.email}
              address={contact.address || "No address provided"}
              onDelete={handleDelete}
              onDownloadJson={downloadJson}
              onDownloadVcard={downloadVcard}
              onEdit={() => setEditingContact(contact)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactsPage;
