# webdev_week3


## **Step 6: Context API**

### **Key Concept: Context API**
- The Context API is used for state management across components.

### **In-Depth Explanation of the Context API**

The **Context API** in React is a built-in feature that allows you to share state or data across multiple components without having to pass props manually through every level of the component tree (a process known as **prop drilling**). It is particularly useful for managing **global state** or data that needs to be accessed by many components in an application.

---

### **How the Context API Works**

The Context API consists of three main parts:

1. **`React.createContext`**:
   - Creates a context object that holds the shared data.
   - Provides a `Provider` component to supply the data and a `Consumer` component (or `useContext` hook) to access it.

2. **Provider**:
   - The `Provider` component wraps the part of the component tree where the context should be available.
   - It supplies the context value to all child components.

3. **Consumer or `useContext`**:
   - The `Consumer` component or the `useContext` hook is used to access the context value in child components.
   - The `useContext` hook allows you to access the value of a context directly in a functional component.  It eliminates the need to wrap components with the `Consumer` componenet, making the code cleaner and easier to read.  

---

### **When to Use the Context API**

The Context API is ideal for:
1. **Global State Management**:
   - Sharing data like user authentication status, theme settings, or language preferences across the application.

2. **Avoiding Prop Drilling**:
   - When data needs to be passed through multiple levels of components, the Context API eliminates the need to pass props manually at every level.

3. **Lightweight State Management**:
   - For simpler applications, the Context API can replace state management libraries like Redux or Zustand.

4. **Cross-Cutting Concerns**:
   - Managing data that affects multiple parts of the application, such as modals, notifications, or user preferences.

---

### **Examples in TypeScript**

#### **Step 1: Create a Context**

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context data
interface User {
  name: string;
  age: number;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Create a provider component
interface UserProviderProps {
  children: ReactNode;
}

// Create the context with a default value of undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
// export const useUser = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };
```

---

#### **Step 2: Use the Context in Components**

##### **Parent Component**
Wrap the application (or part of it) with the `UserProvider` to make the context available.

```tsx
import React from 'react';
import { UserProvider } from './context/UserContext';
import UserProfile from './components/UserProfile';

const App: React.FC = () => {
  return (
    <UserProvider>
      <UserProfile />
    </UserProvider>
  );
};

export default App;
```

---

##### **Child Component**
Access the context using the `useUser` custom hook or access the context directly using useContext.

```tsx
import React, { useContext } from 'react';
import { useUser } from '../context/UserContext';

const UserProfile: React.FC = () => {
  //custom hook
  //const { user, setUser } = useUser();

  //built in hook
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('UserProfile must be used within a UserProvider');
  }

  const handleLogin = () => {
    setUser({ name: 'John Doe', age: 30 });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Age: {user.age}</p>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      ) : (
        <div>
          <p>No user logged in</p>
          <button onClick={handleLogin}>Log In</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
```

---

### **How to Use the Context API**

1. **Define the Context**:
   - Use `createContext` to define the context and its default value.

2. **Provide the Context**:
   - Wrap the relevant part of your component tree with the `Provider` component and pass the context value.

3. **Consume the Context**:
   - Use the `useContext` hook or the `Consumer` component to access the context value in child components.

---

### **Application Types Where Context API Is Useful**

1. **Authentication**:
   - Managing user login state, roles, and permissions across the application.

2. **Theme Management**:
   - Switching between light and dark modes or managing other UI themes.

3. **Language/Localization**:
   - Providing translations and managing the current language setting.

4. **Global Notifications**:
   - Managing alerts, toasts, or other notifications that need to be accessible globally.

5. **Shopping Cart**:
   - Sharing cart data (e.g., items, total price) across multiple components in an e-commerce application.

6. **Modals and Dialogs**:
   - Managing the visibility and content of modals or dialogs.

---

### **Advantages of the Context API**

1. **Simplifies Prop Drilling**:
   - Eliminates the need to pass props through multiple levels of components.

2. **Built-In Solution**:
   - No need to install external libraries like Redux for simple state management.

3. **Flexible**:
   - Can be used for a wide range of use cases, from global state to cross-cutting concerns.

4. **Type Safety with TypeScript**:
   - Ensures that the context value is strongly typed, reducing runtime errors.

---

### **Limitations of the Context API**

1. **Performance Issues**:
   - If the context value changes frequently, it can cause unnecessary re-renders of all components consuming the context. To mitigate this, consider splitting contexts or using memoization.

2. **Not a Replacement for Complex State Management**:
   - For large-scale applications with deeply nested state or complex state transitions, libraries like Redux, Zustand, or MobX may be more appropriate.

---

### **When to Avoid the Context API**

- If the state is only needed by a few components, passing props directly is simpler and more efficient.
- For highly dynamic or complex state management, consider using a dedicated state management library.

---

The Context API is a powerful tool for managing global state in React applications, especially when combined with TypeScript for type safety. It works best for lightweight state management and avoiding prop drilling, making it a great choice for many modern React applications.

---

## **Step 7: Putting It All Together**

- Combine all components into a single application.
- Use the `UserProvider` to wrap the application and provide context to all components.
- Use routing (optional) to navigate between components.

---

### Using Bootstrap with React

Bootstrap is a popular CSS framework that helps you build responsive and visually appealing user interfaces. To use Bootstrap in React, you can use **React-Bootstrap**, a library that provides Bootstrap components as React components.

---

### **React-Bootstrap**

React-Bootstrap is a complete re-implementation of Bootstrap components using React. It eliminates the need for jQuery and provides a more React-friendly way to use Bootstrap.

#### **React-Bootstrap Documentation**:  
[React-Bootstrap Official Website](https://react-bootstrap.github.io/)

---

### **Installation**

To install React-Bootstrap and Bootstrap CSS, follow these steps:

1. Install React-Bootstrap:

   ```bash
   npm install react-bootstrap bootstrap
   ```

2. Import Bootstrap CSS in your `index.tsx` or `App.tsx` file:

   ```tsx
   // filepath: /home/bodonnell/lectures/webdev_week3/src/index.tsx
   import 'bootstrap/dist/css/bootstrap.min.css';
   import React from 'react';
   import ReactDOM from 'react-dom';
   import App from './App';

   ReactDOM.render(<App />, document.getElementById('root'));
   ```

---

### **Best Practices**

1. **Use React-Bootstrap Components**:
   - Instead of using raw HTML with Bootstrap classes, use React-Bootstrap components for better integration with React.

2. **Customize Bootstrap**:
   - Use a custom Bootstrap theme or override styles with your own CSS to match your application's design.

3. **Keep Components Modular**:
   - Use React-Bootstrap components in a modular way to keep your code clean and reusable.

4. **Lazy Load Components**:
   - Use lazy loading for large components to improve performance.

---

### **Code Examples**

#### **Navbar Example**

```tsx
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

const AppNavbar: React.FC = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">MyApp</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
            <Nav.Link href="/contact">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
```

---

#### **Button Example**

```tsx
// filepath: /home/bodonnell/lectures/webdev_week3/src/components/ButtonExample.tsx
import React from 'react';
import { Button } from 'react-bootstrap';

const ButtonExample: React.FC = () => {
  return (
    <div>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary" className="ms-2">Secondary Button</Button>
    </div>
  );
};

export default ButtonExample;
```

---

#### **Form Example**

```tsx
// filepath: /home/bodonnell/lectures/webdev_week3/src/components/FormExample.tsx
import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';

const FormExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email:', email, 'Password:', password);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default FormExample;
```

---

#### **Card Example**

```tsx
// filepath: /home/bodonnell/lectures/webdev_week3/src/components/CardExample.tsx
import React from 'react';
import { Card, Button } from 'react-bootstrap';

const CardExample: React.FC = () => {
  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src="https://via.placeholder.com/150" />
      <Card.Body>
        <Card.Title>Card Title</Card.Title>
        <Card.Text>
          Some quick example text to build on the card title and make up the bulk of the card's content.
        </Card.Text>
        <Button variant="primary">Go somewhere</Button>
      </Card.Body>
    </Card>
  );
};

export default CardExample;
```

---


### React Routing with Hyperlinks

React uses a library called **React Router** to handle routing in single-page applications (SPAs). React Router allows you to define routes and navigate between different components or pages without reloading the entire page. This is achieved by updating the browser's history and rendering the appropriate components dynamically.

---

### **Key Concepts of React Router**

1. **Routes**:
   - Define the mapping between a URL path and a React component.

2. **Router**:
   - Wraps your application and enables routing functionality.

3. **Link**:
   - Used to navigate between routes without reloading the page.

4. **Switch (or Routes in v6)**:
   - Ensures only one route is rendered at a time.

5. **Dynamic Routing**:
   - Allows parameters in the URL to pass data to components.

---

### **Setting Up React Router**

1. Install React Router:

   ```bash
   npm install react-router-dom
   ```

2. Import the necessary components from `react-router-dom`.

---

### **Basic Example of React Routing**

#### **Step 1: Define Routes**

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default App;
```

---

#### **Step 2: Create Components for Each Page**

```tsx
import React from 'react';

const Home: React.FC = () => {
  return <h1>Welcome to the Home Page</h1>;
};

export default Home;
```

```tsx
dev_week3/src/pages/About.tsx
import React from 'react';

const About: React.FC = () => {
  return <h1>About Us</h1>;
};

export default About;
```

```tsx
import React from 'react';

const Contact: React.FC = () => {
  return <h1>Contact Us</h1>;
};

export default Contact;
```

---

#### **Step 3: Add Navigation Links**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
```

---

#### **Step 4: Combine Navbar with App**

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default App;
```

---

### **Dynamic Routing**

Dynamic routing allows you to pass parameters through the URL.

#### Example:

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return <h1>Welcome, {username}!</h1>;
};

export default Profile;
```

Add the route in `App.tsx`:

```tsx
<Route path="/profile/:username" element={<Profile />} />
```

Navigate to `/profile/johndoe` to see "Welcome, johndoe!".

---

### Nested Routes

Nested routes allow you to define routes within other routes, creating a hierarchy. This is useful for applications with sections or subsections.

#### Example:

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
```

```tsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Profile from './Profile';
import Settings from './Settings';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <ul>
          <li>
            <Link to="profile">Profile</Link>
          </li>
          <li>
            <Link to="settings">Settings</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </div>
  );
};

export default Dashboard;
```

```tsx
import React from 'react';

const Profile: React.FC = () => {
  return <h2>Profile Page</h2>;
};

export default Profile;
```

```tsx
import React from 'react';

const Settings: React.FC = () => {
  return <h2>Settings Page</h2>;
};

export default Settings;
```

---

### Protecting Routes Using Higher-Order Components (HOC) or Hooks

To protect routes, you can check if a user is authenticated before rendering a component. If not authenticated, redirect them to a login page.

#### Example Using a Higher-Order Component (HOC):

```tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
```

Usage:

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const isAuthenticated = false; // Replace with actual authentication logic

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
```

---

#### Example Using a Custom Hook:

```tsx
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const useAuth = (isAuthenticated: boolean) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
};

export default useAuth;
```

Usage:

```tsx
import React from 'react';
import useAuth from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const isAuthenticated = false; // Replace with actual authentication logic
  useAuth(isAuthenticated);

  return <h1>Dashboard</h1>;
};

export default Dashboard;
```

---

### **Best Practices for React Routing**

1. **Use `Link` Instead of `<a>`**:
   - `<Link>` prevents full-page reloads, maintaining the SPA behavior.

2. **Organize Routes**:
   - Group related routes into separate files for better maintainability.

3. **404 Pages**:
   - Add a fallback route for undefined paths:

     ```tsx
     <Route path="*" element={<h1>404 - Page Not Found</h1>} />
     ```

4. **Lazy Loading**:
   - Use `React.lazy` and `Suspense` to load components on demand for better performance.

     ```tsx
     const About = React.lazy(() => import('./pages/About'));

     <Suspense fallback={<div>Loading...</div>}>
       <Route path="/about" element={<About />} />
     </Suspense>
     ```

5. **Nested Routes**:
   - Use nested routes for hierarchical navigation.

6. **Authentication**:
   - Protect routes using higher-order components or hooks to check user authentication.

---
