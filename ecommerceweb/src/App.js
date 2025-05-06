import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Footer from "./layout/Footer";
import Header from "./layout/Header";
import { useReducer } from "react";
import MyUserReducer from "./reducers/MyUserReducer";
import { MyUserContext } from "./configs/MyContexts";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Google OAuth Client ID - thay thế bằng ID của bạn khi đăng ký trên Google Cloud Platform
const GOOGLE_CLIENT_ID = "618407643524-0nasoq3jc5dvturarl9truih021cofag.apps.googleusercontent.com";

// Tạo theme cho Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5"
    }
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 500,
    },
  },
});

// Component bảo vệ route cho người dùng đã đăng nhập
const ProtectedRoute = ({ children }) => {
  const [user] = React.useContext(MyUserContext);
  return user ? <Navigate to="/" /> : children;
};

// Component bảo vệ route cho người dùng chưa đăng nhập
const AuthenticatedRoute = ({ children }) => {
  const [user] = React.useContext(MyUserContext);
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  // Sử dụng useReducer với MyUserReducer, state ban đầu là null
  const [user, dispatch] = useReducer(MyUserReducer, null);
  
  // Kiểm tra phiên đăng nhập khi tải trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        dispatch({ type: "LOGIN", payload: userData });
      } catch (error) {
        console.error("Lỗi khôi phục phiên đăng nhập:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);
  
  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider theme={theme}>
          <CssBaseline /> {/* Reset CSS để đồng nhất trên các trình duyệt */}
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={
                <ProtectedRoute>
                  <Login />
                </ProtectedRoute>
              } />
              <Route path="/register" element={
                <ProtectedRoute>
                  <Register />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <AuthenticatedRoute>
                  <Profile />
                </AuthenticatedRoute>
              } />
            </Routes>
            <Footer />
          </BrowserRouter>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </MyUserContext.Provider>
  );
}

export default App;
