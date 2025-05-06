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
import './App.css'; // Import CSS với theme xanh lá

// Google OAuth Client ID - thay thế bằng ID của bạn khi đăng ký trên Google Cloud Platform
const GOOGLE_CLIENT_ID = "618407643524-0nasoq3jc5dvturarl9truih021cofag.apps.googleusercontent.com";

// Tạo theme cho Material UI dựa trên các biến CSS
const theme = createTheme({
  palette: {
    primary: {
      light: '#4caf50',
      main: '#2e7d32',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    secondary: {
      light: '#80cbc4',
      main: '#009688',
      dark: '#00796b',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    success: {
      main: '#66bb6a',
    },
    info: {
      main: '#29b6f6',
    },
    warning: {
      main: '#ffa726',
    },
    error: {
      main: '#ef5350',
    },
    text: {
      primary: '#263238',
      secondary: '#546e7a',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        containedPrimary: {
          background: 'var(--primary-gradient)',
        },
        containedSecondary: {
          background: 'var(--secondary-gradient)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e0e0e0',
              transition: 'border-color 0.2s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: 'var(--primary-main)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--primary-main)',
            },
          },
        },
      },
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
