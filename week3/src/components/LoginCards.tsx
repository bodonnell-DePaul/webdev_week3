import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';



const LoginCards: React.FC = () => {

    //const { user, setUser } = useUser();
    const [previousLogins, setPreviousLogins] = useState([]);
    return (
        <>
            {
                previousLogins ? (
                <div>
                    <Card>
                    <Card.Title>No Previous Logins</Card.Title>
                        <Card.Body>
                            <p>Brian O'Donnell</p>
                            <p>bodonnell@gmail.com</p>
                            <p>43</p>
                        </Card.Body>
                    </Card>
                </div>
                )
            :
            (
                    <Card>
                        <Card.Body>
                            <p>Brian O'Donnell</p>
                            <p>bodonnell@gmail.com</p>
                            <p>43</p>
                        </Card.Body>
                    </Card>
                // previousLogins.map(
                //     <Card>
                //         <Card.Body>
                //             <p>user.name</p>
                //             <p>user.email</p>
                //             <p>user.age</p>
                //         </Card.Body>
                //     </Card>
                // )

            )}
        
        </>
    )

}

export default LoginCards;