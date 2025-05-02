import React from "react";

function Contact({ id, name, photo, mobile, email, address, onDelete, onDownloadJson, onDownloadVcard, onEdit}) {
  return (
        <div className="card h-100 contact-card">
          <div className="row g-0 h-100">
            <div className="col-8 d-flex flex-column justify-content-center p-2">
              <h5 className="card-title">{name}</h5>
              <p className="card-text mb-1">📞 <a href={`tel:${mobile}`}>{mobile}</a></p>
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

          {/* Gombok alsó sávja */}
          <div className="card-footer bg-light d-flex justify-content-between flex-wrap gap-2 p-2">
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onDownloadJson(id)}
              >
                JSON
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => onDownloadVcard(id)}
              >
                vCard
              </button>
        
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-warning btn-sm text-dark"
                onClick={() => onEdit({ id, name, mobile, email, address })}
              >
                ✏️
              </button>
              <button
                className="btn btn-danger btn-sm text-light"
                onClick={() => onDelete(id)}
              >
                ❌
              </button>
            </div>
          </div>
        </div>

  );
}

export default Contact;