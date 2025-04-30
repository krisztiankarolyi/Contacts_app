import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';

export default function AppNavbar({ username, token }) {
  return (
    <Navbar bg="primary" expand="lg" variant="dark" className="mb-4 navbar sticky-top ">
      <Container>
        <Navbar.Brand as={Link} to="/">Contacts App</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {token && (
              <>
                <Nav.Link as={Link} to="/newContact">New Contact</Nav.Link>
                <Nav.Link as={Link} to="/contacts">My Contacts</Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="ms-auto">
            {!token ? (
              <>
                <Nav.Link as={Link} to="/">About the app</Nav.Link>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            ) : (
              <NavDropdown
                title={
                  <span>
                    Welcome, {username}{' '}
                    <img
                      src={`http://localhost:8080/uploads/default.jpg`}
                      alt={username}
                      className="rounded-circle ms-1 avatar"
                      style={{ width: '50px', height: '50px' }}
                    />
                  </span>
                }
                id="user-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
