import React from "react";

function Contact({ id, name, photo, mobile, email, address, onDelete, onEdit}) {
  return (
    <div className="card h-100 contact-card position-relative">
      <div className="row g-0 h-100">
        <div className="col-8 d-flex flex-column justify-content-center p-2">
          <h5 className="card-title">{name}</h5>
          <p className="card-text mb-1">📞 {mobile}</p>
          <p className="card-text">✉️ {email}</p>
          <p className="card-text">🏠 {address}</p>
        </div>
        <div className="col-4 d-flex align-items-center">
          {photo && (
            <img
              src={photo}
              alt={name}
              className="img-fluid rounded-end avatar"
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          )}
        </div>
      </div>

      <button
        className="btn btn-warning text-dark position-absolute bottom-1 end-0 m-2"
        onClick={() => onEdit({ id, name, mobile, email, address })}
      >
        ✏️
      </button>

      <button
        className="btn btn-danger text-light position-absolute bottom-0 end-0 m-2"
        onClick={() => {      
            onDelete(id);
        }}
      >
        ❌
      </button>
    </div>
  );
}

export default Contact;