import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button, Form, Modal } from 'react-bootstrap';
import LoginCards from './LoginCards';

const UserProfile: React.FC = () => {
  const { user, setUser, addPreviousLogin } = useUser();
  const [myName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAge: number = Number(age);
    const newUser = { name: myName, age: numericAge, email: email };

    setUser(newUser);
    addPreviousLogin(newUser); // Add the user to previous logins

    setName('');
    setEmail('');
    setAge('');
  };

  const handleLogout = () => {
    setUser(null);
    handleClose();
  };

  return (
    <div>
      <LoginCards />
      {user ? (
        <div>
          <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
              <Modal.Title>Modal title</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Name: {user.name}</p>
              <p>Age: {user.age}</p>
              <p>Email: {user.email}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleLogout}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : (
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={myName}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Age</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Check me out" />
          </Form.Group>
          <Button variant="primary" type="submit" onClick={handleShow}>
            Submit
          </Button>
        </Form>
      )}
    </div>
  );
};

export default UserProfile;