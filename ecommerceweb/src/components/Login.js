import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import cookie from "react-cookies";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Link as MuiLink,
  Divider
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import { styled } from "@mui/system";
import { MyUserContext } from "../configs/MyContexts";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { endpoint } from "../configs/Apis";
import defaultApi from "../configs/Apis";
import axios from 'axios';


// Styled component cho icon
const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    fontSize: 40,
    color: theme.palette.primary.main
  }
}));

export default function Login() {
  // Sử dụng destructuring trực tiếp để đảm bảo nhất quán với Header.js
  const [user, dispatch] = useContext(MyUserContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [fbInitialized, setFbInitialized] = useState(false);
  const navigate = useNavigate();

  // Facebook App ID - thay thế bằng ID của bạn khi đăng ký trên Facebook Developer
  const FACEBOOK_APP_ID = "1092426749573331";
  const GOOGLE_CLIENT_ID = "618407643524-0nasoq3jc5dvturarl9truih021cofag.apps.googleusercontent.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // Sử dụng defaultApi và endpoint từ import tĩnh
      console.log("Đang gửi request đăng nhập:", {
        username: username,
        password: password
      });

      const response = await defaultApi.post(endpoint.LOGIN, {
        username: username,
        password: password
      });

      const data = response.data;
      console.log("Kết quả đăng nhập:", data);

      if (data.success && data.token) {
        console.log("Lưu token:", data.token);

        // Đảm bảo token đúng định dạng khi lưu
        const tokenValue = data.token.startsWith('Bearer ') ? data.token : `Bearer ${data.token}`;

        // Lưu token vào cả cookie và localStorage để đảm bảo
        cookie.save('token', tokenValue, { path: "/" });
        localStorage.setItem('token', tokenValue);
        localStorage.setItem('user', JSON.stringify(data.user));

        dispatch({
          "type": "LOGIN",
          "payload": data.user
        });

        navigate("/");
      } else {
        setMsg(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      if (err.response) {
        console.error("Chi tiết lỗi:", err.response.status, err.response.data);
        setMsg(`Đăng nhập thất bại: ${err.response.data.message || err.response.statusText} (${err.response.status})`);
      } else {
        setMsg("Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setMsg("");

    try {
      console.log("Google response:", credentialResponse);

      // Sử dụng defaultApi và endpoint từ import tĩnh
      const response = await defaultApi.post(endpoint.GOOGLE_LOGIN, {
        credential: credentialResponse.credential,
        clientId: GOOGLE_CLIENT_ID
      });

      console.log("Kết quả đăng nhập Google:", response.data);
      const data = response.data;

      if (data.success && data.token) {
        cookie.save('token', data.token, {path: "/" });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        dispatch({
          "type": "LOGIN",
          "payload": data.user
        });

        navigate("/");
      } else {
        setMsg(data.message || "Đăng nhập Google thất bại");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập Google:", err);
      if (err.response) {
        console.error("Chi tiết lỗi:", err.response.data);
        setMsg(`Đăng nhập Google thất bại: ${err.response.data.message || err.response.statusText}`);
      } else {
        setMsg("Đăng nhập Google thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLoginClick = () => {
    if (!window.FB) {
      setMsg("Facebook SDK chưa được tải. Vui lòng thử lại sau.");
      return;
    }

    setLoading(true);
    setMsg("");

    window.FB.login(function (response) {
      // gọi hàm async tách biệt
      handleFacebookResponse(response);
    }, { scope: 'public_profile,email' });
  };

  // Tách hàm xử lý response sang async function riêng
  const handleFacebookResponse = async (response) => {
    if (!response || !response.authResponse) {
      console.log('Người dùng hủy đăng nhập hoặc quá trình không hoàn thành.');
      setLoading(false);
      setMsg("Đăng nhập Facebook bị hủy bỏ.");
      return;
    }

    try {
      console.log("Facebook auth response:", response.authResponse);
      
      // Tạo payload đầy đủ cho API
      const payload = {
        accessToken: response.authResponse.accessToken,
        userID: response.authResponse.userID,
        // Thêm các thông tin khác nếu có
        expiresIn: response.authResponse.expiresIn,
        signedRequest: response.authResponse.signedRequest || ""
      };
      
      console.log("Gửi request đến Facebook API:", payload);
      
      // Sử dụng axios trực tiếp để có thể theo dõi chi tiết lỗi
      const apiResponse = await axios.post(
        '/SpringEcommerceApp-1.0-SNAPSHOT/api/login/facebook', 
        payload, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000, // Tăng timeout lên 15s
          withCredentials: true
        }
      );

      const data = apiResponse.data;
      console.log("Kết quả đăng nhập Facebook:", data);

      if (data.success && data.token) {
        cookie.save('token', data.token, { path: "/" });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        dispatch({
          type: "LOGIN",
          payload: data.user
        });

        navigate("/");
      } else {
        setMsg(data.message || "Đăng nhập Facebook thất bại");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập Facebook:", err);
      
      if (err.response) {
        // Server trả về response với status code không phải 2xx
        console.error("Chi tiết lỗi server:", {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data
        });
        setMsg(`Đăng nhập Facebook thất bại (${err.response.status}): ${err.response.data.message || "Lỗi máy chủ"}`);
      } else if (err.request) {
        // Request được gửi nhưng không nhận được response
        console.error("Không nhận được response:", err.request);
        setMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } else {
        // Lỗi khi thiết lập request
        console.error("Lỗi thiết lập request:", err.message);
        setMsg(`Lỗi kết nối: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load Facebook SDK
  useEffect(() => {
    // Khai báo hàm để tránh lỗi ESLint
    function initFacebookSDK() {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        });

        console.log('Facebook SDK initialized successfully');
        setFbInitialized(true);
      };

      // Tải Facebook SDK bằng cách thêm script
      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }

    initFacebookSDK();
  }, []);

  if (user !== null) {
    return <Navigate to="/" />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <IconWrapper>
          <LockOutlinedIcon />
        </IconWrapper>

        <Typography component="h1" variant="h5" gutterBottom>
          Đăng nhập
        </Typography>

        {msg && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{msg}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Tên đăng nhập"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
          </Button>

          <Divider sx={{ my: 2 }} />

          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                setMsg("Đăng nhập Google thất bại. Vui lòng thử lại sau.");
              }}
            />
          </GoogleOAuthProvider>

          <Button
            onClick={handleFacebookLoginClick}
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<FacebookIcon />}
            sx={{ mt: 1, mb: 2, bgcolor: '#1877F2', '&:hover': { bgcolor: '#0e5a9e' } }}
          >
            Đăng nhập bằng Facebook
          </Button>

          <Grid container justifyContent="center">
            <Grid item>
              <MuiLink component={Link} to="/register" variant="body2">
                {"Chưa có tài khoản? Đăng ký ngay"}
              </MuiLink>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
