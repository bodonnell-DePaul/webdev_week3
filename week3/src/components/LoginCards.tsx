import React from 'react';
import Card from 'react-bootstrap/Card';
import { useUser } from '../contexts/UserContext';

const LoginCards: React.FC = () => {
  const { previousLogins } = useUser();

  return (
    <>
      {previousLogins.length > 0 ? (
        <div>
          {previousLogins.map((login, index) => (
            <Card key={index}>
              <Card.Body>
                <p>{login.name}</p>
                <p>{login.email}</p>
                <p>{login.age}</p>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Card.Title>No Previous Logins</Card.Title>
          <Card.Body>
            <p>No login history available.</p>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default LoginCards;